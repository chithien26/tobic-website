#Requires -RunAsAdministrator
<#
  Builds the website and (re)starts it as a background task on Windows Server.
  Usage (PowerShell as Administrator, from anywhere):
    C:\sites\tobic-website\web\deploy\windows\deploy.ps1
#>
param(
    [string]$AppDir = "C:\sites\tobic-web",
    [string]$TaskName = "TOBIC Web",
    [switch]$SkipPull
)

$ErrorActionPreference = "Stop"
$web = (Resolve-Path "$PSScriptRoot\..\..").Path
$envFile = Join-Path $web ".env.production.local"
if (-not (Test-Path $envFile)) {
    throw "Missing $envFile. Copy deploy\windows\env.production.example to that path and fill it in."
}

function Invoke-Step([string]$name, [scriptblock]$block) {
    Write-Host "==> $name" -ForegroundColor Cyan
    & $block
    if ($LASTEXITCODE -and $LASTEXITCODE -ne 0) { throw "$name failed (exit code $LASTEXITCODE)" }
}

Push-Location $web
try {
    if (-not $SkipPull) { Invoke-Step "git pull" { git pull --ff-only } }
    Invoke-Step "npm ci" { npm ci --no-audit --no-fund }
    Invoke-Step "npm run build" { npm run build }
}
finally {
    Pop-Location
}

Write-Host "==> Stopping running site" -ForegroundColor Cyan
if (Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue) {
    Stop-ScheduledTask -TaskName $TaskName
}
Get-CimInstance Win32_Process -Filter "Name = 'node.exe'" |
    Where-Object { $_.CommandLine -like "*$AppDir\server.js*" } |
    ForEach-Object { Stop-Process -Id $_.ProcessId -Force }

Write-Host "==> Copying build to $AppDir" -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path $AppDir, "$AppDir\logs" | Out-Null
robocopy "$web\.next\standalone" $AppDir /MIR /NFL /NDL /NJH /NJS /NP /XD logs | Out-Null
if ($LASTEXITCODE -ge 8) { throw "robocopy failed (exit code $LASTEXITCODE)" }
robocopy "$web\.next\static" "$AppDir\.next\static" /MIR /NFL /NDL /NJH /NJS /NP | Out-Null
robocopy "$web\public" "$AppDir\public" /MIR /NFL /NDL /NJH /NJS /NP | Out-Null
$global:LASTEXITCODE = 0
Copy-Item $envFile "$AppDir\.env.production.local" -Force
Copy-Item "$PSScriptRoot\run.ps1" "$AppDir\run.ps1" -Force

Write-Host "==> Registering startup task '$TaskName'" -ForegroundColor Cyan
$action = New-ScheduledTaskAction -Execute "powershell.exe" `
    -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$AppDir\run.ps1`"" -WorkingDirectory $AppDir
$trigger = New-ScheduledTaskTrigger -AtStartup
$settings = New-ScheduledTaskSettingsSet -ExecutionTimeLimit ([TimeSpan]::Zero) -StartWhenAvailable `
    -RestartCount 999 -RestartInterval (New-TimeSpan -Minutes 1)
$principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest
Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Settings $settings `
    -Principal $principal -Force | Out-Null
Start-ScheduledTask -TaskName $TaskName

$port = (Get-Content $envFile | Where-Object { $_ -match '^\s*PORT\s*=\s*(\d+)' } | ForEach-Object { $Matches[1] }) | Select-Object -First 1
if (-not $port) { $port = 3000 }
Write-Host "==> Waiting for http://127.0.0.1:$port" -ForegroundColor Cyan
for ($i = 0; $i -lt 30; $i++) {
    Start-Sleep -Seconds 2
    try {
        $res = Invoke-WebRequest "http://127.0.0.1:$port/vi" -UseBasicParsing -TimeoutSec 5
        if ($res.StatusCode -eq 200) { Write-Host "Website is running." -ForegroundColor Green; exit 0 }
    }
    catch { }
}
throw "Website did not respond. Check $AppDir\logs\web.log"
