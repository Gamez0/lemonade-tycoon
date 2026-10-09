@echo off
rem Dedicated candidate business, separate from personal and earlier manual saves.
set "LOCALAPPDATA=%~dp0..\.local-m4\m10-manual-data"
set "APPDATA=%LOCALAPPDATA%\Roaming"
set "ELECTRON_RUN_AS_NODE="
start "" "%~dp0..\.local-m4\m10-build\release\Lemonade Tycoon-win32-x64\Lemonade Tycoon.exe" "--user-data-dir=%LOCALAPPDATA%\Chromium"
