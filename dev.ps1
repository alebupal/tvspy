Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  Iniciando TVSPY (Backend + Frontend) en simultáneo" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

if (-not (Test-Path "node_modules\concurrently")) {
    Write-Host "[INFO] Instalando dependencias necesarias en la raíz..." -ForegroundColor Yellow
    npm install
}

npm run dev

