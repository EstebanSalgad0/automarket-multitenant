const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

// URLs directas de Supabase
const SUPABASE_URL = 'https://fdmuqaqciyrnykxmjzvq.supabase.co'
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkbXVxYXFjaXlybnlreG1qenZxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODU0OTM2NywiZXhwIjoyMDc0MTI1MzY3fQ.56JKnnMSDhDhKk9DuTYNFI7LbsgofM6M9Ls9Pz7aLPA'

console.log('📋 Configuración Supabase:')
console.log('URL:', SUPABASE_URL)
console.log('Service Key configurado')

// Configurar cliente de Supabase con service role para operaciones administrativas
const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

async function updatePasswords() {
  console.log('🔐 Actualizando contraseñas de usuarios demo...\n')

  const users = [
    { email: 'admin@toyotacentro.cl', password: 'toyota123', name: 'Carlos Eduardo Martínez' },
    { email: 'vendedor@toyotacentro.cl', password: 'toyota123', name: 'María José Silva Romero' },
    { email: 'admin@premiummotors.cl', password: 'premium123', name: 'Roberto Antonio González' },
    { email: 'vendedor@autoindependientes.cl', password: 'auto123', name: 'Ana Patricia Morales' }
  ]

  for (const user of users) {
    try {
      console.log(`📝 Actualizando contraseña para ${user.name}...`)
      
      // Primero obtener el ID del usuario
      const { data: authUser, error: getUserError } = await supabase.auth.admin.listUsers()
      
      if (getUserError) {
        console.error(`❌ Error obteniendo usuarios:`, getUserError.message)
        continue
      }

      const targetUser = authUser.users.find(u => u.email === user.email)
      
      if (!targetUser) {
        console.error(`❌ Usuario no encontrado: ${user.email}`)
        continue
      }

      // Actualizar la contraseña
      const { data, error } = await supabase.auth.admin.updateUserById(
        targetUser.id,
        { 
          password: user.password,
          email_confirm: true
        }
      )

      if (error) {
        console.error(`❌ Error actualizando ${user.email}:`, error.message)
      } else {
        console.log(`✅ Contraseña actualizada para ${user.email}`)
      }

    } catch (err) {
      console.error(`❌ Error procesando ${user.email}:`, err.message)
    }
  }

  console.log('\n🎉 Proceso de actualización de contraseñas completado!')
  console.log('\n📋 Credenciales actualizadas:')
  users.forEach(user => {
    console.log(`   • ${user.email} → ${user.password}`)
  })
}

updatePasswords().catch(console.error)