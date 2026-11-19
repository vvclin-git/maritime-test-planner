@echo off
setlocal
cd /d "%~dp0"

if not exist "dist\index.html" (
    echo [ERROR] dist\index.html was not found.
    echo Keep this batch file in the repository root alongside the dist folder.
    goto :fail
)

set "PYTHON_CMD="
where py >nul 2>&1
if not errorlevel 1 (
    py -3 -c "import http.server" >nul 2>&1
    if not errorlevel 1 set "PYTHON_CMD=py -3"
)
if not defined PYTHON_CMD (
    where python >nul 2>&1
    if not errorlevel 1 (
        python -c "import http.server" >nul 2>&1
        if not errorlevel 1 set "PYTHON_CMD=python"
    )
)

if not defined PYTHON_CMD (
    echo [ERROR] Python 3 was not found.
    echo Install Python 3 and make sure py or python is available in PATH.
    goto :fail
)

echo Maritime Field Planner
echo URL: http://127.0.0.1:8000/
echo Press Ctrl+C in this window to stop the server.
echo.
start "" /min cmd /c "timeout /t 2 /nobreak >nul & start "" http://127.0.0.1:8000/"
%PYTHON_CMD% -m http.server 8000 --bind 127.0.0.1 --directory dist
set "EXIT_CODE=%ERRORLEVEL%"
echo.
echo Server stopped with exit code %EXIT_CODE%.
pause
exit /b %EXIT_CODE%

:fail
echo.
pause
exit /b 1
