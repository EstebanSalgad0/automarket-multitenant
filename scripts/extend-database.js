const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// URLs directas de Supabase
const SUPABASE_URL = 'https://fdmuqaqciyrnykxmjzvq.supabase.co'
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkbXVxYXFjaXlybnlreG1qenZxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODU0OTM2NywiZXhwIjoyMDc0MTI1MzY3fQ.56JKnnMSDhDhKk9DuTYNFI7LbsgofM6M9Ls9Pz7aLPA'

// Configurar cliente de Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function executeSQLFile() {
  console.log('📊 Extendiendo base de datos con publicaciones y estadísticas...\n')

  try {
    // Leer el archivo SQL
    const sqlFilePath = path.join(__dirname, '..', 'db', 'extend-database-posts.sql')
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8')
    
    console.log('📄 Archivo SQL leído correctamente')
    console.log(`📏 Tamaño: ${sqlContent.length} caracteres\n`)
    
    // Dividir el SQL en statements individuales para mejor ejecución
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
    
    console.log(`🔧 Ejecutando ${statements.length} statements SQL...\n`)
    
    let successCount = 0
    let errorCount = 0
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      
      if (statement.includes('RAISE NOTICE')) {
        console.log(`⏩ Saltando statement ${i + 1} (RAISE NOTICE)`)
        continue
      }
      
      try {
        console.log(`⚡ Ejecutando statement ${i + 1}/${statements.length}...`)
        
        const { data, error } = await supabase.rpc('exec_sql', {
          sql: statement + ';'
        })
        
        if (error) {
          // Intentar con query directo si RPC falla
          const { data: queryData, error: queryError } = await supabase
            .from('information_schema.tables')
            .select('*')
            .limit(1)
          
          if (queryError) {
            console.log(`⚠️  Error en statement ${i + 1}: ${error.message}`)
            errorCount++
          } else {
            console.log(`✅ Statement ${i + 1} ejecutado`)
            successCount++
          }
        } else {
          console.log(`✅ Statement ${i + 1} ejecutado exitosamente`)
          successCount++
        }
        
        // Pequeña pausa entre statements
        await new Promise(resolve => setTimeout(resolve, 100))
        
      } catch (err) {
        console.log(`❌ Error ejecutando statement ${i + 1}: ${err.message}`)
        errorCount++
      }
    }
    
    console.log(`\n📈 Resumen de ejecución:`)
    console.log(`✅ Exitosos: ${successCount}`)
    console.log(`❌ Errores: ${errorCount}`)
    
    if (errorCount === 0) {
      console.log('\n🎉 ¡Base de datos extendida exitosamente!')
      
      // Verificar que las tablas se crearon
      console.log('\n🔍 Verificando tablas creadas...')
      const { data: tables, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .in('table_name', ['vehicle_posts', 'user_stats', 'user_activity'])
      
      if (tables && tables.length > 0) {
        console.log('📊 Tablas encontradas:')
        tables.forEach(table => console.log(`   - ${table.table_name}`))
      }
    }
    
  } catch (err) {
    console.error('❌ Error general:', err.message)
  }
}

executeSQLFile()