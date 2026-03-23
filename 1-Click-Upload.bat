@echo off
color 0A
echo ========================================================
echo   🚀 Aibel Builders - One-Click Website Updater
echo ========================================================
echo.
echo Staging your new images and changes...
git add .
echo.

echo Committing changes to the system...
git commit -m "Admin Auto-update: %date% %time%"
echo.

echo Pushing updates to the live web server...
git push origin main
echo.

echo ✅ SUCCESS! Your newest projects and edits are now online.
pause
