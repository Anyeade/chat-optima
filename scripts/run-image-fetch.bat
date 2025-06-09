@echo off
echo ==============================================
echo   Pexels Image Fetcher with Custom IDs
echo ==============================================
echo.

echo Step 1: Fetching images from Pexels API...
echo.
node fetch-pexels-images.js
if %ERRORLEVEL% neq 0 (
    echo.
    echo ❌ Failed to fetch images from Pexels API
    pause
    exit /b 1
)

echo.
echo Step 2: Processing and organizing data with custom IDs...
echo.
powershell -ExecutionPolicy Bypass -File process-pexels-data.ps1
if %ERRORLEVEL% neq 0 (
    echo.
    echo ❌ Failed to process image data
    pause
    exit /b 1
)

echo.
echo ==============================================
echo ✅ All tasks completed successfully!
echo ==============================================
echo.
echo Check the following locations:
echo   📄 Raw data: ../data/pexels-images.json
echo   📁 Organized data: ../data/organized/
echo   📊 Summary: ../data/organized/summary.json
echo   📋 CSV report: ../data/organized/categories_summary.csv
echo.
pause