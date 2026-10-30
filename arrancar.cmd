@echo off
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\arrancar.ps1" %*
if errorlevel 1 pause
