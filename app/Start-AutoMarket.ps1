# Script PowerShell para iniciar AutoMarket MultiTenant
Set-Location "C:\Users\xxrey\Desktop\automarket-multitenant\app"
Write-Host "Directorio actual: $(Get-Location)" -ForegroundColor Green
Write-Host "Iniciando AutoMarket MultiTenant..." -ForegroundColor Cyan

# Verificar que existe package.json
if (Test-Path "package.json") {
    Write-Host "package.json encontrado" -ForegroundColor Green
    Write-Host "Ejecutando npm run dev..." -ForegroundColor Yellow
    npm run dev
} else {
    Write-Host "No se encontro package.json en el directorio actual" -ForegroundColor Red
    Write-Host "Directorio actual: $(Get-Location)" -ForegroundColor Yellow
    Get-ChildItem
}

Read-Host "Presiona Enter para continuar"