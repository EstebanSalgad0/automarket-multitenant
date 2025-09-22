# 🚗 AutoMarket Multitenant - Guía de Instalación

## 📋 Requisitos del Sistema

### Requisitos Previos
- **Node.js** (versión 18.0.0 o superior)
- **npm** (viene incluido con Node.js)
- **Git** (opcional, para clonar el repositorio)

### Verificar Requisitos
```bash
node --version    # Debe mostrar v18.0.0 o superior
npm --version     # Debe mostrar 8.0.0 o superior
```

## 📥 Instalación

### 1. Descargar el Proyecto

**Opción A: Clonar con Git**
```bash
git clone https://github.com/EstebanSalgad0/automarket-multitenant.git
cd automarket-multitenant
```

**Opción B: Descargar ZIP**
1. Ir a: https://github.com/EstebanSalgad0/automarket-multitenant
2. Hacer clic en "Code" → "Download ZIP"
3. Extraer el archivo y navegar a la carpeta

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Ejecutar el Proyecto
```bash
npm run dev
```

### 4. Abrir en el Navegador
- El proyecto se ejecutará en: http://localhost:5173
- Si el puerto está ocupado, Vite automáticamente usará otro puerto

## 🛠️ Comandos Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia el servidor de desarrollo |
| `npm run build` | Construye el proyecto para producción |
| `npm run preview` | Previsualiza el build de producción |
| `npm run lint` | Ejecuta ESLint para revisar código |

## 🏗️ Estructura del Proyecto

```
automarket-multitenant/
├── public/                 # Archivos estáticos
├── src/                   # Código fuente
│   ├── components/        # Componentes React
│   ├── assets/           # Imágenes y recursos
│   ├── App.tsx           # Componente principal
│   ├── main.tsx          # Punto de entrada
│   └── index.css         # Estilos globales
├── package.json          # Dependencias y scripts
├── vite.config.ts        # Configuración de Vite
└── tsconfig.json         # Configuración de TypeScript
```

## 🌐 Tecnologías Utilizadas

- **React 18** - Biblioteca de UI
- **TypeScript** - Tipado estático
- **Vite** - Herramienta de desarrollo
- **CSS3** - Estilos personalizados
- **ESLint** - Linter de código

## 🚀 Características

- ✨ Diseño moderno y responsive
- 📱 Mobile-first approach
- 🎨 UI/UX optimizada
- 🚗 Catálogo de vehículos interactivo
- 👤 Sistema de perfiles de usuario
- 🏢 Arquitectura multitenant
- 🔍 Filtros avanzados de búsqueda

## 🐛 Solución de Problemas

### Error: "npm command not found"
- Instalar Node.js desde: https://nodejs.org/

### Error: "Port 5173 is already in use"
- Vite automáticamente encontrará otro puerto disponible
- O cerrar la aplicación que usa el puerto 5173

### Error: "Module not found"
- Ejecutar: `npm install`
- Verificar que todas las dependencias estén instaladas

### Error de permisos en Windows
- Ejecutar PowerShell como administrador
- O usar CMD en lugar de PowerShell

## 📞 Soporte

Si encuentras algún problema:
1. Verificar que Node.js esté instalado correctamente
2. Asegurarse de estar en la carpeta correcta del proyecto
3. Ejecutar `npm install` antes de `npm run dev`
4. Revisar que no haya otros procesos usando el puerto

## 🔗 Enlaces Útiles

- [Repositorio GitHub](https://github.com/EstebanSalgad0/automarket-multitenant)
- [Documentación de Vite](https://vitejs.dev/)
- [Documentación de React](https://react.dev/)
- [Node.js Download](https://nodejs.org/)

---

¡Disfruta desarrollando con AutoMarket Multitenant! 🚗✨
