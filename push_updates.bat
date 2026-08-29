@echo off
title Vision Max - Push Updates to GitHub & Vercel
echo ========================================================
echo   VISION MAX STUDIO - PUSHING LATEST UPDATES TO VERCEL
echo ========================================================
echo.

git add .
git commit -m "fix: Vercel SPA routing and root build configuration"
git push -u origin main

echo.
echo ========================================================
echo  ✅ All updates pushed! Vercel is redeploying now.
echo ========================================================
echo.
pause
