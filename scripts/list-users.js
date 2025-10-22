const { createClient } = require('@supabase/supabase-js')

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

async function listAllUsers() {
  console.log('👥 Listando todos los usuarios en Supabase...\n')

  try {
    const { data: authUsers, error } = await supabase.auth.admin.listUsers()
    
    if (error) {
      console.error('❌ Error:', error.message)
      return
    }

    console.log(`📊 Total de usuarios encontrados: ${authUsers.users.length}\n`)
    
    authUsers.users.forEach((user, index) => {
      console.log(`${index + 1}. 📧 Email: ${user.email}`)
      console.log(`   🆔 ID: ${user.id}`)
      console.log(`   📅 Creado: ${new Date(user.created_at).toLocaleString()}`)
      console.log(`   ✅ Confirmado: ${user.email_confirmed_at ? 'Sí' : 'No'}`)
      console.log('   ─────────────────────────────────────────')
    })

    console.log('\n🔍 Emails esperados vs encontrados:')
    const expectedEmails = [
      'carlos.martinez@toyotacentro.cl',
      'maria.silva@toyotacentro.cl', 
      'roberto.gonzalez@premiummotors.cl',
      'ana.morales@autovendedores.cl'
    ]
    
    const foundEmails = authUsers.users.map(u => u.email)
    
    expectedEmails.forEach(email => {
      const found = foundEmails.includes(email)
      console.log(`   ${found ? '✅' : '❌'} ${email}`)
    })

  } catch (err) {
    console.error('❌ Error listando usuarios:', err.message)
  }
}

listAllUsers()