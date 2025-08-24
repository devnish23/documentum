@echo off
REM Enhanced Auto-Continue Batch File
REM Makes it easy to run enhanced auto-continue scripts

setlocal enabledelayedexpansion

echo 🤖 Enhanced Auto-Continue Runner
echo ================================

if "%1"=="" (
    echo Usage: run-enhanced-auto-continue.bat [mode] [command]
    echo.
    echo Modes:
    echo   npm     - Run npm workflow (install, lint, test, build)
    echo   git     - Run git workflow (add, commit, push)
    echo   workflow - Run complete workflow (npm + git)
    echo   custom  - Run custom command
    echo   test    - Run test suite
    echo   ps      - Use PowerShell version
    echo.
    echo Examples:
    echo   run-enhanced-auto-continue.bat npm
    echo   run-enhanced-auto-continue.bat git
    echo   run-enhanced-auto-continue.bat custom "npm install"
    echo   run-enhanced-auto-continue.bat ps npm
    echo.
    goto :end
)

set MODE=%1
set COMMAND=%2

if "%MODE%"=="npm" (
    echo 🚀 Running npm workflow...
    node scripts\enhanced-auto-continue.js npm
) else if "%MODE%"=="git" (
    echo 🚀 Running git workflow...
    node scripts\enhanced-auto-continue.js git
) else if "%MODE%"=="workflow" (
    echo 🚀 Running complete workflow...
    node scripts\enhanced-auto-continue.js workflow
) else if "%MODE%"=="test" (
    echo 🧪 Running test suite...
    node scripts\test-enhanced-auto-continue.js
) else if "%MODE%"=="custom" (
    if "%COMMAND%"=="" (
        echo ❌ Error: Custom mode requires a command
        echo Example: run-enhanced-auto-continue.bat custom "npm install"
        goto :end
    )
    echo 🚀 Running custom command: %COMMAND%
    node scripts\enhanced-auto-continue.js "%COMMAND%"
) else if "%MODE%"=="ps" (
    if "%COMMAND%"=="" (
        echo ❌ Error: PowerShell mode requires a sub-mode
        echo Example: run-enhanced-auto-continue.bat ps npm
        goto :end
    )
    echo 🚀 Running PowerShell enhanced script with mode: %COMMAND%
    powershell -ExecutionPolicy Bypass -File scripts\enhanced-auto-continue.ps1 -Mode %COMMAND%
) else (
    echo ❌ Unknown mode: %MODE%
    echo.
    echo Available modes: npm, git, workflow, custom, test, ps
    echo.
    echo Examples:
    echo   run-enhanced-auto-continue.bat npm
    echo   run-enhanced-auto-continue.bat custom "npm install"
    echo   run-enhanced-auto-continue.bat ps npm
)

:end
echo.
echo ✅ Enhanced Auto-Continue completed!
echo.
echo 💡 Tips:
echo   • Use 'test' mode to verify functionality
echo   • Use 'ps' mode for PowerShell-specific commands
echo   • Use 'custom' mode for any command
echo   • Add --silent flags to commands for better results
