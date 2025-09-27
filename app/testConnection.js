// Test simple de conexión a Supabase
import { createClient } from '@supabase/supabase-js';

// Credenciales de Supabase
const supabaseUrl = 'https://fdmuqaqciyrnykxmjzvq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkbXVxYXFjaXlybnlreG1qenZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjY5MzkzMzgsImV4cCI6MjA0MjUxNTMzOH0.btnnkXx2B5w4vIxJZvRTdyh6VGFklx2mwWqueuZ4K8w';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    try {
        console.log('🔄 Probando conexión a Supabase...');
        
        // Probar obtener tenants
        const { data: tenants, error } = await supabase
            .from('tenants')
            .select('*')
            .limit(5);
            
        if (error) {
            console.error('❌ Error:', error);
            return;
        }
        
        console.log('✅ Conexión exitosa!');
        console.log('📊 Tenants encontrados:', tenants.length);
        tenants.forEach(tenant => {
            console.log(`   - ${tenant.name} (${tenant.slug}) - ${tenant.currency}`);
        });
        
        // Probar obtener vehículos
        const { data: vehicles, error: vehiclesError } = await supabase
            .from('vehicles')
            .select('make, model, year, price, currency')
            .limit(3);
            
        if (vehiclesError) {
            console.error('❌ Error obteniendo vehículos:', vehiclesError);
            return;
        }
        
        console.log('🚗 Vehículos encontrados:', vehicles.length);
        vehicles.forEach(vehicle => {
            console.log(`   - ${vehicle.make} ${vehicle.model} ${vehicle.year} - $${vehicle.price} ${vehicle.currency}`);
        });
        
    } catch (err) {
        console.error('💥 Error de conexión:', err.message);
    }
}

testConnection();