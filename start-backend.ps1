# Start DevHub Backend (FastAPI)
Write-Host "Starting DevHub Backend on http://localhost:8000 ..." -ForegroundColor Cyan
Set-Location "$PSScriptRoot\backend"
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
