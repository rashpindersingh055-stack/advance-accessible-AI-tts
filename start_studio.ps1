# Vision Max Intelligence — PowerShell Runner
$RootDir = $PSScriptRoot
if (-not $RootDir) { $RootDir = Get-Location }

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  VISION MAX INTELLIGENCE - NEURAL VOICE STUDIO v2.0   " -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Start Python FastAPI Backend
Write-Host "[1/2] Launching Python FastAPI Backend Server..." -ForegroundColor Green
$BackendCmd = "cd '$RootDir\backend'; pip install -r requirements.txt; python run.py"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $BackendCmd

# 2. Start React / Vite Frontend
Write-Host "[2/2] Launching React / Vite Frontend Server..." -ForegroundColor Green
$FrontendCmd = "cd '$RootDir\frontend'; npm install; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $FrontendCmd

Write-Host ""
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host " 🚀 Servers launched in dedicated terminal windows!    " -ForegroundColor Green
Write-Host " 👉 Frontend Web App:  http://localhost:3000          " -ForegroundColor White
Write-Host " 👉 Backend API Docs:  http://localhost:8000/docs     " -ForegroundColor White
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""
