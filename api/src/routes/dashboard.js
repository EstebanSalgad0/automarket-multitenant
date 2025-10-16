import express from 'express';
import { authenticate, authorize, checkTenantAccess } from '../middleware/auth.js';
import { supabase } from '../config/supabase.js';
import redis from '../config/redis.js';

const router = express.Router({ mergeParams: true });

/**
 * @swagger
 * /api/{tenantId}/dashboard:
 *   get:
 *     summary: Obtener datos del dashboard para el tenant
 *     tags: [Dashboard]
 *     parameters:
 *       - in: path
 *         name: tenantId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [7d, 30d, 90d, 1y]
 *           default: 30d
 *     security:
 *       - bearerAuth: []
 */
router.get('/', authenticate, checkTenantAccess, authorize('automotora_admin', 'vendedor_automotora', 'vendedor_particular'), async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { period = '30d' } = req.query;

    // Calcular fecha de inicio basada en el periodo
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    const cacheKey = `dashboard:${tenantId}:${period}`;
    let dashboardData = await redis.get(cacheKey);

    if (!dashboardData) {
      // Estadísticas generales
      const [
        totalVehicles,
        availableVehicles,
        soldVehicles,
        reservedVehicles,
        recentVehicles,
        salesByMonth
      ] = await Promise.all([
        // Total de vehículos
        supabase
          .from('vehicles')
          .select('id', { count: 'exact', head: true })
          .eq('tenant_id', tenantId)
          .neq('status', 'deleted'),

        // Vehículos disponibles
        supabase
          .from('vehicles')
          .select('id', { count: 'exact', head: true })
          .eq('tenant_id', tenantId)
          .eq('status', 'available'),

        // Vehículos vendidos
        supabase
          .from('vehicles')
          .select('id', { count: 'exact', head: true })
          .eq('tenant_id', tenantId)
          .eq('status', 'sold'),

        // Vehículos reservados
        supabase
          .from('vehicles')
          .select('id', { count: 'exact', head: true })
          .eq('tenant_id', tenantId)
          .eq('status', 'reserved'),

        // Vehículos recientes
        supabase
          .from('vehicles')
          .select(`
            id,
            brand,
            model,
            year,
            price,
            status,
            created_at,
            vehicle_images!inner (
              image_url,
              is_primary
            )
          `)
          .eq('tenant_id', tenantId)
          .neq('status', 'deleted')
          .gte('created_at', startDate.toISOString())
          .order('created_at', { ascending: false })
          .limit(5),

        // Ventas por mes (último año)
        supabase
          .from('vehicles')
          .select('sold_at, price')
          .eq('tenant_id', tenantId)
          .eq('status', 'sold')
          .gte('sold_at', new Date(now.getFullYear() - 1, now.getMonth(), 1).toISOString())
          .order('sold_at', { ascending: true })
      ]);

      // Procesar datos de ventas por mes
      const salesData = salesByMonth.data || [];
      const monthlyData = {};
      
      salesData.forEach(sale => {
        if (sale.sold_at) {
          const month = new Date(sale.sold_at).toISOString().substring(0, 7); // YYYY-MM
          if (!monthlyData[month]) {
            monthlyData[month] = { count: 0, revenue: 0 };
          }
          monthlyData[month].count += 1;
          monthlyData[month].revenue += parseFloat(sale.price) || 0;
        }
      });

      // Formatear vehículos recientes
      const formattedRecentVehicles = (recentVehicles.data || []).map(vehicle => ({
        id: vehicle.id,
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year,
        price: vehicle.price,
        status: vehicle.status,
        createdAt: vehicle.created_at,
        primaryImage: vehicle.vehicle_images.find(img => img.is_primary)?.image_url || 
                     vehicle.vehicle_images[0]?.image_url || null
      }));

      // Estadísticas de precios
      const { data: priceStats } = await supabase
        .from('vehicles')
        .select('price')
        .eq('tenant_id', tenantId)
        .eq('status', 'available')
        .not('price', 'is', null);

      let avgPrice = 0;
      let minPrice = 0;
      let maxPrice = 0;

      if (priceStats && priceStats.length > 0) {
        const prices = priceStats.map(v => parseFloat(v.price)).filter(p => !isNaN(p));
        avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
        minPrice = Math.min(...prices);
        maxPrice = Math.max(...prices);
      }

      dashboardData = {
        overview: {
          totalVehicles: totalVehicles.count || 0,
          availableVehicles: availableVehicles.count || 0,
          soldVehicles: soldVehicles.count || 0,
          reservedVehicles: reservedVehicles.count || 0
        },
        pricing: {
          averagePrice: Math.round(avgPrice),
          minPrice: minPrice,
          maxPrice: maxPrice
        },
        recentVehicles: formattedRecentVehicles,
        salesChart: Object.entries(monthlyData).map(([month, data]) => ({
          month,
          count: data.count,
          revenue: Math.round(data.revenue)
        })).sort((a, b) => a.month.localeCompare(b.month)),
        period: period,
        generatedAt: new Date().toISOString()
      };

      // Cachear por 5 minutos
      await redis.set(cacheKey, dashboardData, 300);
    }

    res.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener datos del dashboard'
    });
  }
});

/**
 * @swagger
 * /api/{tenantId}/dashboard/stats:
 *   get:
 *     summary: Obtener estadísticas detalladas
 *     tags: [Dashboard]
 *     parameters:
 *       - in: path
 *         name: tenantId
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 */
router.get('/stats', authenticate, checkTenantAccess, authorize('automotora_admin', 'vendedor_automotora', 'vendedor_particular'), async (req, res) => {
  try {
    const { tenantId } = req.params;

    const cacheKey = `dashboard:stats:${tenantId}`;
    let stats = await redis.get(cacheKey);

    if (!stats) {
      // Estadísticas por marca
      const { data: brandStats } = await supabase
        .from('vehicles')
        .select('brand')
        .eq('tenant_id', tenantId)
        .neq('status', 'deleted');

      const brandCounts = {};
      (brandStats || []).forEach(vehicle => {
        brandCounts[vehicle.brand] = (brandCounts[vehicle.brand] || 0) + 1;
      });

      // Estadísticas por año
      const { data: yearStats } = await supabase
        .from('vehicles')
        .select('year')
        .eq('tenant_id', tenantId)
        .neq('status', 'deleted');

      const yearCounts = {};
      (yearStats || []).forEach(vehicle => {
        yearCounts[vehicle.year] = (yearCounts[vehicle.year] || 0) + 1;
      });

      // Estadísticas por tipo de combustible
      const { data: fuelStats } = await supabase
        .from('vehicles')
        .select('fuel_type')
        .eq('tenant_id', tenantId)
        .neq('status', 'deleted');

      const fuelCounts = {};
      (fuelStats || []).forEach(vehicle => {
        if (vehicle.fuel_type) {
          fuelCounts[vehicle.fuel_type] = (fuelCounts[vehicle.fuel_type] || 0) + 1;
        }
      });

      stats = {
        byBrand: Object.entries(brandCounts)
          .map(([brand, count]) => ({ brand, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10),
        byYear: Object.entries(yearCounts)
          .map(([year, count]) => ({ year: parseInt(year), count }))
          .sort((a, b) => b.year - a.year),
        byFuelType: Object.entries(fuelCounts)
          .map(([fuelType, count]) => ({ fuelType, count }))
          .sort((a, b) => b.count - a.count),
        generatedAt: new Date().toISOString()
      };

      // Cachear por 10 minutos
      await redis.set(cacheKey, stats, 600);
    }

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener estadísticas'
    });
  }
});

export default router;