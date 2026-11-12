@echo off
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0build-cpp.ps1" %*
exit /b %ERRORLEVEL%
