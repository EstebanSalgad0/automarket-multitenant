const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuración de Supabase
const supabaseUrl = 'https://fuyqjgwzuqfvrvjjgpmz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1eXFqZ3d6dXFmdnJ2ampncG16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYzNjA1NjAsImV4cCI6MjA1MTkzNjU2MH0.EGwZaaCO-3Qq8hEfYmk7e5uZjY6x0XHX4JrTzJOt9JM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function addSampleVehicles() {
  console.log('🚗 Agregando vehículos de muestra...');

  try {
    // Datos de vehículos para insertar
    const vehicles = [
      // Toyota Centro
      {
        tenant_id: '11111111-1111-1111-1111-111111111111',
        marca: 'Toyota',
        modelo: 'Prius',
        año: 2021,
        precio: 429900.00,
        kilometraje: 25000,
        color: 'Plata',
        combustible: 'Híbrido',
        transmision: 'CVT',
        descripcion: 'Toyota Prius 2021, excelente eficiencia de combustible, ideal para ciudad',
        estado: 'disponible'
      },
      {
        tenant_id: '11111111-1111-1111-1111-111111111111',
        marca: 'Toyota',
        modelo: 'Highlander',
        año: 2022,
        precio: 679900.00,
        kilometraje: 8000,
        color: 'Negro',
        combustible: 'Gasolina',
        transmision: 'Automática',
        descripcion: 'SUV familiar Toyota Highlander 2022, 7 asientos, perfecta para familia',
        estado: 'disponible'
      },
      {
        tenant_id: '11111111-1111-1111-1111-111111111111',
        marca: 'Toyota',
        modelo: 'Yaris',
        año: 2020,
        precio: 189900.00,
        kilometraje: 45000,
        color: 'Rojo',
        combustible: 'Gasolina',
        transmision: 'Manual',
        descripcion: 'Toyota Yaris 2020, compacto y económico, perfecto para la ciudad',
        estado: 'disponible'
      },
      // Carlos Pérez Motors
      {
        tenant_id: '22222222-2222-2222-2222-222222222222',
        marca: 'Mazda',
        modelo: 'CX-5',
        año: 2021,
        precio: 459900.00,
        kilometraje: 28000,
        color: 'Azul',
        combustible: 'Gasolina',
        transmision: 'Automática',
        descripcion: 'Mazda CX-5 2021, SUV elegante con excelente manejo',
        estado: 'disponible'
      },
      {
        tenant_id: '22222222-2222-2222-2222-222222222222',
        marca: 'Hyundai',
        modelo: 'Elantra',
        año: 2022,
        precio: 319900.00,
        kilometraje: 15000,
        color: 'Blanco',
        combustible: 'Gasolina',
        transmision: 'Automática',
        descripcion: 'Hyundai Elantra 2022, sedán moderno con tecnología avanzada',
        estado: 'disponible'
      },
      {
        tenant_id: '22222222-2222-2222-2222-222222222222',
        marca: 'Kia',
        modelo: 'Sportage',
        año: 2020,
        precio: 389900.00,
        kilometraje: 38000,
        color: 'Gris',
        combustible: 'Gasolina',
        transmision: 'Automática',
        descripcion: 'Kia Sportage 2020, SUV confiable con garantía extendida',
        estado: 'disponible'
      },
      // Vendedor particular
      {
        tenant_id: '33333333-3333-3333-3333-333333333333',
        marca: 'Suzuki',
        modelo: 'Swift',
        año: 2018,
        precio: 149900.00,
        kilometraje: 62000,
        color: 'Amarillo',
        combustible: 'Gasolina',
        transmision: 'Manual',
        descripcion: 'Suzuki Swift 2018, citycar ideal para tráfico urbano, muy económico',
        estado: 'disponible'
      },
      {
        tenant_id: '33333333-3333-3333-3333-333333333333',
        marca: 'Mitsubishi',
        modelo: 'ASX',
        año: 2017,
        precio: 219900.00,
        kilometraje: 78000,
        color: 'Blanco',
        combustible: 'Gasolina',
        transmision: 'CVT',
        descripcion: 'Mitsubishi ASX 2017, SUV compacta, mantenimiento al día',
        estado: 'disponible'
      }
    ];

    // Insertar vehículos uno por uno para mejor control de errores
    for (let i = 0; i < vehicles.length; i++) {
      const vehicle = vehicles[i];
      console.log(`Insertando vehículo ${i + 1}/${vehicles.length}: ${vehicle.marca} ${vehicle.modelo}`);
      
      const { data, error } = await supabase
        .from('vehiculos')
        .insert([vehicle])
        .select();

      if (error) {
        console.error(`❌ Error insertando ${vehicle.marca} ${vehicle.modelo}:`, error.message);
      } else {
        console.log(`✅ ${vehicle.marca} ${vehicle.modelo} insertado correctamente`);
      }
    }

    // Verificar el total de vehículos
    const { count, error: countError } = await supabase
      .from('vehiculos')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Error contando vehículos:', countError.message);
    } else {
      console.log(`\n✅ Total de vehículos en la base de datos: ${count}`);
    }

    console.log('\n🎉 ¡Proceso completado!');
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

// Ejecutar el script
addSampleVehicles();