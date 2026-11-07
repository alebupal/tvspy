@echo off
title TVSPY v3.1 - Dev Runner
echo ========================================================
echo   Iniciando TVSPY (Backend + Frontend) en simultaneo
echo ========================================================
echo.

if not exist "node_modules\concurrently" (
    echo [INFO] Instalando dependencias necesarias en la raiz...
    call npm install
)

call npm run dev

