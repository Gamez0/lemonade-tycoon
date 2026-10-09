@echo off
rem This launcher deliberately isolates save files from the signed-in user's business.
set "LOCALAPPDATA=%~dp0..\.local-m4\manual-data"
set "APPDATA=%LOCALAPPDATA%\Roaming"
set "ELECTRON_RUN_AS_NODE="
start "" "%~dp0..\.local-m4\new-package\Lemonade Tycoon.exe" "--user-data-dir=%LOCALAPPDATA%\Chromium"
