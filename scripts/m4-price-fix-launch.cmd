@echo off
rem Reuse only the isolated manual test business with the rebuilt UI fix.
set "LOCALAPPDATA=%~dp0..\.local-m4\manual-data"
set "APPDATA=%LOCALAPPDATA%\Roaming"
set "ELECTRON_RUN_AS_NODE="
start "" "%~dp0..\.local-m4\fixed-package\Lemonade Tycoon.exe"
