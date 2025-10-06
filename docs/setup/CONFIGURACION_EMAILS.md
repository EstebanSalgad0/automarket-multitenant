# Configuración de Emails en Supabase para AutoMarket

## 📧 Estado Actual de Emails

### ✅ Lo que YA funciona:
- **Registro de usuarios**: Se crean en `auth.users` de Supabase
- **Envío automático de emails**: Supabase envía emails de verificación por defecto
- **Templates básicos**: Confirmación de registro y recuperación de contraseña

### 🔧 Configuración Necesaria para Emails Personales

Para enviar emails desde tu dominio personal (ej: no-reply@automarket.cl), necesitas:

#### 1. Configurar SMTP Personalizado en Supabase

En el panel de Supabase (https://supabase.com/dashboard/project/fdmuqaqciyrnykxmjzvq):

1. **Ir a Authentication > Settings > SMTP Settings**
2. **Configurar tu servidor SMTP**:
   ```
   SMTP Host: smtp.gmail.com (para Gmail)
   SMTP Port: 587
   SMTP User: tu-email@gmail.com
   SMTP Pass: tu-password-de-app
   Sender Name: AutoMarket Chile
   Sender Email: no-reply@automarket.cl
   ```

#### 2. Opciones de Proveedores SMTP

**Gmail (Más fácil para pruebas):**
- Host: `smtp.gmail.com`
- Port: `587`
- Requiere "Contraseña de aplicación" (no la contraseña normal)
- Guía: https://support.google.com/accounts/answer/185833

**SendGrid (Recomendado para producción):**
- Host: `smtp.sendgrid.net`
- Port: `587`
- API Key como contraseña
- Hasta 100 emails gratis por día

**Mailgun:**
- Host: `smtp.mailgun.org`
- Port: `587`
- Hasta 5,000 emails gratis por mes

#### 3. Personalizar Templates de Email

En **Authentication > Email Templates**:

**Confirmar Registro:**
```html
<h2>¡Bienvenido a AutoMarket Chile! 🚗</h2>
<p>Hola {{ .Email }},</p>
<p>Gracias por registrarte en AutoMarket. Para activar tu cuenta, haz clic en el siguiente enlace:</p>
<p><a href="{{ .ConfirmationURL }}">Confirmar mi cuenta</a></p>
<p>Este enlace expira en 24 horas.</p>
<p>Si no creaste esta cuenta, puedes ignorar este email.</p>
<br>
<p>Saludos,<br>El equipo de AutoMarket Chile</p>
```

**Recuperar Contraseña:**
```html
<h2>Restablecer tu contraseña - AutoMarket 🔐</h2>
<p>Hola {{ .Email }},</p>
<p>Recibimos una solicitud para restablecer tu contraseña. Haz clic en el siguiente enlace:</p>
<p><a href="{{ .ConfirmationURL }}">Restablecer contraseña</a></p>
<p>Este enlace expira en 1 hora.</p>
<p>Si no solicitaste este cambio, puedes ignorar este email.</p>
<br>
<p>Saludos,<br>El equipo de AutoMarket Chile</p>
```

#### 4. URLs de Redirección

Configurar en **Authentication > URL Configuration**:
- **Site URL**: `http://localhost:5173` (desarrollo)
- **Redirect URLs**: 
  - `http://localhost:5173/auth/callback`
  - `http://localhost:5173/reset-password`
  - `https://tudominio.com/auth/callback` (producción)

## 🚀 Implementación Actual en el Código

### Hook useAuth
- ✅ `signUp()`: Registra usuarios y dispara email automático
- ✅ `signIn()`: Login funcional
- ✅ `resetPassword()`: Envía email de recuperación
- ✅ Logging detallado para debug

### LoginModal
- ✅ Formulario completo de registro
- ✅ Validaciones
- ✅ Mensajes de éxito/error
- ✅ Integración con tenant multitenant

### Panel Debug
- ✅ Verificación de usuarios en tiempo real
- ✅ Test de envío de emails
- ✅ Monitoreo de tenants

## 📋 Pasos para Probar

### Inmediato (con emails de Supabase):
1. Abrir http://localhost:5173/
2. Hacer clic en "Iniciar sesión"
3. Seleccionar "¿No tienes cuenta? Regístrate"
4. Llenar formulario con email real
5. Verificar que llegue email de confirmación

### Con SMTP personalizado:
1. Configurar SMTP en panel de Supabase
2. Personalizar templates
3. Probar registro con email real
4. Verificar branding personalizado

## 🔍 Debug y Verificación

El panel de debug mostrará:
- ✅ Usuario actual logueado
- ✅ Estado de confirmación de email  
- ✅ Tenants disponibles
- ✅ Botón para probar envío de emails
- ✅ Logs en consola del navegador

## 📞 Soporte

Si necesitas ayuda configurando SMTP:
1. Verificar logs en consola del navegador
2. Revisar panel de Supabase en Authentication > Logs
3. Consultar documentación: https://supabase.com/docs/guides/auth/auth-smtp