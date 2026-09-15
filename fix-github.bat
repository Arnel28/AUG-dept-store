@echo off
echo Preparing to update GitHub repository...
echo.

cd "C:\Users\Administrator\Desktop\AUG"

echo Adding all changes...
git add .

echo Committing changes...
git commit -m "Fix product display discrepancy and improve error handling in API endpoints"

echo Pushing to GitHub...
git push origin main

echo.
echo Update completed successfully!
pause