@echo off
rem Isolated preview business; existing M4/M5/M10 and personal saves are preserved.
set "LOCALAPPDATA=%~dp0..\.local-m4\free-ice-manual-data"
set "APPDATA=%LOCALAPPDATA%\Roaming"
set "ELECTRON_RUN_AS_NODE="
start "" "%~dp0..\.local-m4\free-ice-build\release\Lemonade Tycoon-win32-x64\Lemonade Tycoon.exe" "--user-data-dir=%LOCALAPPDATA%\Chromium"
