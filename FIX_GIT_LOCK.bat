@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo Noor AlDhikr - Git lock repair
echo --------------------------------
if not exist ".git" (
  echo ERROR: This file must be inside the repository root folder.
  pause
  exit /b 1
)
if exist ".git\index.lock" (
  del /f /q ".git\index.lock"
  if exist ".git\index.lock" (
    echo ERROR: Could not delete .git\index.lock. Close GitHub Desktop and VS Code, then run this file again.
    pause
    exit /b 1
  )
  echo OK: .git\index.lock removed safely.
) else (
  echo OK: No Git lock exists.
)
echo You can now open GitHub Desktop and Commit/Push.
pause
