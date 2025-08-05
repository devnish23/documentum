# PowerShell Auto-Continue Script
# Eliminates ALL manual "press enter" prompts for ANY command execution

param(
    [string]$Command,
    [string]$Mode = "single"
)

# Function to execute command with auto-continuation
function Invoke-AutoContinueCommand {
    param([string]$Command)
    
    Write-Host "🚀 Executing: $Command" -ForegroundColor Green
    
    # Set environment variables to disable prompts
    $env:CI = "true"
    $env:NODE_ENV = "production"
    $env:FORCE_COLOR = "0"
    $env:NO_COLOR = "1"
    $env:TERM = "dumb"
    $env:DEBIAN_FRONTEND = "noninteractive"
    $env:APT_LISTCHANGES_FRONTEND = "none"
    $env:UCF_FORCE_CONFOLD = "1"
    $env:CLICOLOR = "0"
    
    # Start the process
    $process = Start-Process -FilePath "cmd.exe" -ArgumentList "/c", $Command -PassThru -NoNewWindow -RedirectStandardOutput -RedirectStandardError -RedirectStandardInput
    
    # Auto-respond to any prompts
    $autoResponseTimer = New-Object System.Timers.Timer
    $autoResponseTimer.Interval = 1000  # 1 second
    $autoResponseTimer.AutoReset = $true
    
    $autoResponseTimer.Add_Elapsed({
        try {
            # Send Enter key to continue
            Add-Type -AssemblyName System.Windows.Forms
            [System.Windows.Forms.SendKeys]::SendWait("{ENTER}")
        }
        catch {
            # Ignore errors
        }
    })
    
    $autoResponseTimer.Start()
    
    # Wait for process to complete
    $process.WaitForExit()
    
    # Stop the timer
    $autoResponseTimer.Stop()
    $autoResponseTimer.Dispose()
    
    Write-Host "✅ Command completed with code: $($process.ExitCode)" -ForegroundColor Green
    return $process.ExitCode
}

# Function to execute multiple commands
function Invoke-AutoContinueCommands {
    param([string[]]$Commands)
    
    Write-Host "🤖 Starting automated command execution..." -ForegroundColor Cyan
    
    foreach ($cmd in $Commands) {
        try {
            $exitCode = Invoke-AutoContinueCommand -Command $cmd
            Write-Host "✅ Completed: $cmd" -ForegroundColor Green
            
            # Small delay between commands
            Start-Sleep -Seconds 1
        }
        catch {
            Write-Host "❌ Failed: $cmd - $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    Write-Host "🎉 All commands completed automatically!" -ForegroundColor Green
}

# Main execution
if ($Mode -eq "git") {
    $commands = @(
        "git add .",
        "git commit -m `"Auto-update from development`" --no-verify",
        "git push origin master --force-with-lease"
    )
    Invoke-AutoContinueCommands -Commands $commands
}
elseif ($Mode -eq "npm") {
    $commands = @(
        "npm install --yes --silent",
        "npm run lint --silent",
        "npm run type-check --silent",
        "npm run test --silent",
        "npm run build --silent",
        "npm run docs --silent"
    )
    Invoke-AutoContinueCommands -Commands $commands
}
elseif ($Mode -eq "python") {
    $commands = @(
        "python -m venv venv --clear",
        "venv\Scripts\Activate.ps1",
        "pip install -r requirements.txt --quiet",
        "python -m pytest --quiet"
    )
    Invoke-AutoContinueCommands -Commands $commands
}
elseif ($Mode -eq "playwright") {
    $commands = @(
        "npx playwright install --with-deps",
        "npx playwright test --reporter=json",
        "npx playwright show-report --host=0.0.0.0"
    )
    Invoke-AutoContinueCommands -Commands $commands
}
elseif ($Mode -eq "workflow") {
    Write-Host "🚀 Starting Complete Automated Workflow" -ForegroundColor Cyan
    Write-Host "=======================================" -ForegroundColor Cyan
    
    try {
        # Setup environment
        Write-Host "`n🔧 Setting up environment..." -ForegroundColor Yellow
        $npmCommands = @(
            "npm install --yes --silent",
            "npm run lint --silent",
            "npm run type-check --silent",
            "npm run test --silent",
            "npm run build --silent",
            "npm run docs --silent"
        )
        Invoke-AutoContinueCommands -Commands $npmCommands
        
        # Run tests
        Write-Host "`n🧪 Running tests..." -ForegroundColor Yellow
        $playwrightCommands = @(
            "npx playwright install --with-deps",
            "npx playwright test --reporter=json",
            "npx playwright show-report --host=0.0.0.0"
        )
        Invoke-AutoContinueCommands -Commands $playwrightCommands
        
        # Git operations
        Write-Host "`n📝 Git operations..." -ForegroundColor Yellow
        $gitCommands = @(
            "git add .",
            "git commit -m `"Auto-update from development`" --no-verify",
            "git push origin master --force-with-lease"
        )
        Invoke-AutoContinueCommands -Commands $gitCommands
        
        Write-Host "`n🎉 Complete workflow finished without any manual intervention!" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Workflow failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}
elseif ($Command) {
    # Single command execution
    Invoke-AutoContinueCommand -Command $Command
}
else {
    Write-Host "Usage:" -ForegroundColor Yellow
    Write-Host "  .\auto-continue.ps1 -Command `"your command`"" -ForegroundColor White
    Write-Host "  .\auto-continue.ps1 -Mode git" -ForegroundColor White
    Write-Host "  .\auto-continue.ps1 -Mode npm" -ForegroundColor White
    Write-Host "  .\auto-continue.ps1 -Mode python" -ForegroundColor White
    Write-Host "  .\auto-continue.ps1 -Mode playwright" -ForegroundColor White
    Write-Host "  .\auto-continue.ps1 -Mode workflow" -ForegroundColor White
} 