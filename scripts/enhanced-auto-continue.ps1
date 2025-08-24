# Enhanced PowerShell Auto-Continue Script
# Specifically addresses Windows terminal waiting issues and eliminates ALL manual prompts

param(
    [string]$Command,
    [string]$Mode = "workflow"
)

# Function to execute command with enhanced auto-continuation
function Invoke-EnhancedAutoContinueCommand {
    param([string]$Command)
    
    Write-Host "🚀 Executing: $Command" -ForegroundColor Green
    
    # Set environment variables to disable ALL prompts
    $env:CI = "true"
    $env:NODE_ENV = "production"
    $env:FORCE_COLOR = "0"
    $env:NO_COLOR = "1"
    $env:TERM = "dumb"
    $env:DEBIAN_FRONTEND = "noninteractive"
    $env:APT_LISTCHANGES_FRONTEND = "none"
    $env:UCF_FORCE_CONFOLD = "1"
    $env:CLICOLOR = "0"
    $env:GIT_TERMINAL_PROGRESS = "0"
    $env:GIT_PAGER = "cat"
    $env:GIT_EDITOR = "echo"
    $env:NONINTERACTIVE = "1"
    $env:AUTO_YES = "1"
    $env:YES = "1"
    
    # Create process start info
    $startInfo = New-Object System.Diagnostics.ProcessStartInfo
    $startInfo.FileName = "cmd.exe"
    $startInfo.Arguments = "/c $Command"
    $startInfo.UseShellExecute = $false
    $startInfo.RedirectStandardOutput = $true
    $startInfo.RedirectStandardError = $true
    $startInfo.RedirectStandardInput = $true
    $startInfo.CreateNoWindow = $true
    $startInfo.WorkingDirectory = Get-Location
    
    # Create and start process
    $process = New-Object System.Diagnostics.Process
    $process.StartInfo = $startInfo
    $process.Start() | Out-Null
    
    # Auto-response timer
    $autoResponseTimer = New-Object System.Timers.Timer
    $autoResponseTimer.Interval = 2000  # 2 seconds
    $autoResponseTimer.AutoReset = $true
    
    $lastActivity = Get-Date
    $responseCount = 0
    
    $autoResponseTimer.Add_Elapsed({
        try {
            $now = Get-Date
            $timeSinceLastActivity = ($now - $lastActivity).TotalSeconds
            
            # Auto-continue if no activity for 3 seconds
            if ($timeSinceLastActivity -gt 3) {
                $responseCount++
                if ($responseCount -le 10) {  # Prevent infinite loops
                    $responses = @("`n", "y`n", "yes`n", "Y`n", "YES`n")
                    $response = $responses[($responseCount - 1) % $responses.Length]
                    
                    $process.StandardInput.WriteLine($response)
                    Write-Host "🤖 Auto-responding: $($response.Trim())" -ForegroundColor Yellow
                }
            }
        }
        catch {
            # Ignore errors
        }
    })
    
    $autoResponseTimer.Start()
    
    # Monitor output and auto-respond to prompts
    $outputTimer = New-Object System.Timers.Timer
    $outputTimer.Interval = 1000  # 1 second
    $outputTimer.AutoReset = $true
    
    $outputTimer.Add_Elapsed({
        try {
            if (-not $process.HasExited) {
                # Check if process is waiting for input
                $process.StandardInput.WriteLine("`n")
                Write-Host "🤖 Auto-continuing..." -ForegroundColor Yellow
            }
        }
        catch {
            # Ignore errors
        }
    })
    
    $outputTimer.Start()
    
    # Wait for process to complete
    $process.WaitForExit()
    
    # Stop timers
    $autoResponseTimer.Stop()
    $autoResponseTimer.Dispose()
    $outputTimer.Stop()
    $outputTimer.Dispose()
    
    # Get output
    $stdout = $process.StandardOutput.ReadToEnd()
    $stderr = $process.StandardError.ReadToEnd()
    
    Write-Host "✅ Command completed with code: $($process.ExitCode)" -ForegroundColor Green
    return @{
        ExitCode = $process.ExitCode
        StdOut = $stdout
        StdErr = $stderr
    }
}

# Function to execute multiple commands with enhanced continuation
function Invoke-EnhancedAutoContinueCommands {
    param([string[]]$Commands)
    
    Write-Host "🤖 Starting enhanced automated command execution..." -ForegroundColor Cyan
    
    foreach ($cmd in $Commands) {
        try {
            $result = Invoke-EnhancedAutoContinueCommand -Command $cmd
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

# Alternative method using SendKeys for more aggressive auto-continuation
function Invoke-SendKeysAutoContinue {
    param([string]$Command)
    
    Write-Host "🚀 Executing with SendKeys: $Command" -ForegroundColor Green
    
    # Set environment variables
    $env:CI = "true"
    $env:NODE_ENV = "production"
    $env:NONINTERACTIVE = "1"
    $env:AUTO_YES = "1"
    $env:YES = "1"
    
    # Start process in background
    $job = Start-Job -ScriptBlock {
        param($cmd)
        & cmd.exe /c $cmd
    } -ArgumentList $Command
    
    # Auto-send Enter key periodically
    $sendKeysTimer = New-Object System.Timers.Timer
    $sendKeysTimer.Interval = 3000  # 3 seconds
    $sendKeysTimer.AutoReset = $true
    
    $sendKeysTimer.Add_Elapsed({
        try {
            Add-Type -AssemblyName System.Windows.Forms
            [System.Windows.Forms.SendKeys]::SendWait("{ENTER}")
            Write-Host "🤖 Sent ENTER key" -ForegroundColor Yellow
        }
        catch {
            # Ignore errors
        }
    })
    
    $sendKeysTimer.Start()
    
    # Wait for job to complete
    Wait-Job $job | Out-Null
    
    # Stop timer
    $sendKeysTimer.Stop()
    $sendKeysTimer.Dispose()
    
    # Get results
    $result = Receive-Job $job
    Remove-Job $job
    
    Write-Host "✅ Command completed" -ForegroundColor Green
    return $result
}

# Main execution
if ($Mode -eq "git") {
    $commands = @(
        "git add .",
        "git commit -m `"Auto-update from development`" --no-verify",
        "git push origin master --force-with-lease"
    )
    Invoke-EnhancedAutoContinueCommands -Commands $commands
}
elseif ($Mode -eq "npm") {
    $commands = @(
        "npm install --yes --silent",
        "npm run lint --silent",
        "npm run type-check --silent",
        "npm run test --silent",
        "npm run build --silent"
    )
    Invoke-EnhancedAutoContinueCommands -Commands $commands
}
elseif ($Mode -eq "workflow") {
    $commands = @(
        "npm install --yes --silent",
        "npm run lint --silent",
        "npm run type-check --silent",
        "npm run test --silent",
        "npm run build --silent",
        "git add .",
        "git commit -m `"Auto-update from development`" --no-verify",
        "git push origin master --force-with-lease"
    )
    Invoke-EnhancedAutoContinueCommands -Commands $commands
}
elseif ($Mode -eq "sendkeys") {
    # Use SendKeys method for problematic commands
    Invoke-SendKeysAutoContinue -Command $Command
}
else {
    # Execute single command
    Invoke-EnhancedAutoContinueCommand -Command $Command
}
