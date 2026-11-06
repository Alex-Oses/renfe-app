@echo off
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\apk-android.ps1" %*
if errorlevel 1 (
  pause
  exit /b 1
)
