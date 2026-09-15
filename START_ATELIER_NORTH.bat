@echo off
setlocal EnableExtensions EnableDelayedExpansion
cd /d "%~dp0"
title Atelier North

echo.
echo  ==========================================
echo       ATELIER NORTH ^| STARTING
echo  ==========================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed.
  echo Install Node.js 20+ and run this file again.
  echo.
  pause
  exit /b 1
)

if not exist node_modules (
  echo Installing Atelier North dependencies...
  call npm install
  if errorlevel 1 (
    echo.
    echo Dependency installation failed.
    pause
    exit /b 1
  )
)

if not exist .env goto GETKEY

findstr /B /C:"OPENAI_API_KEY=" .env >nul 2>nul
if errorlevel 1 goto GETKEY

for /f "tokens=1,* delims==" %%A in ('findstr /B /C:"OPENAI_API_KEY=" .env') do set "CURRENT_KEY=%%B"
if /I "!CURRENT_KEY!"=="your_api_key_here" goto GETKEY
if "!CURRENT_KEY!"=="" goto GETKEY
goto START

:GETKEY
echo.
echo  NORTH AI LIVE CONNECTION
echo  ------------------------------------------
echo  North needs your OpenAI API key to reply
echo  with real AI. The key is saved locally in
echo  this folder's .env file only.
echo.
set /p "OPENAI_KEY=Paste your OpenAI API key: "
if "!OPENAI_KEY!"=="" (
  echo.
  echo No key entered. North cannot connect yet.
  pause
  exit /b 1
)

(
  echo OPENAI_API_KEY=!OPENAI_KEY!
  echo OPENAI_MODEL=gpt-5.6-luna
  echo PORT=3000
) > .env

:START
echo.
echo Starting Atelier North...
echo Your browser will open automatically.
echo Keep this window open while using North AI.
echo.
call npm start
pause
