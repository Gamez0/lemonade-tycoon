@echo off
rem Dedicated M5 preview business; existing manual and personal saves are preserved.
set "LOCALAPPDATA=%~dp0..\.local-m4\m5-manual-data"
set "APPDATA=%LOCALAPPDATA%\Roaming"
set "ELECTRON_RUN_AS_NODE="
start "" "%~dp0..\.local-m4\m5-build\release\Lemonade Tycoon-win32-x64\Lemonade Tycoon.exe"
