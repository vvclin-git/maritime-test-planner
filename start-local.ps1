Set-Location $PSScriptRoot
Write-Host "Open http://localhost:8000 in your browser. Press Ctrl+C to stop."
py -m http.server 8000 --bind 127.0.0.1 --directory dist
