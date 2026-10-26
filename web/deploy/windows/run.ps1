# Started by the "TOBIC Web" scheduled task; deploy.ps1 copies it next to server.js.
$ErrorActionPreference = "Stop"
$app = $PSScriptRoot

Get-Content "$app\.env.production.local" | ForEach-Object {
    if ($_ -match '^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$') {
        [Environment]::SetEnvironmentVariable($Matches[1], $Matches[2].Trim('"'), "Process")
    }
}
$env:NODE_ENV = "production"
if (-not $env:PORT) { $env:PORT = "3000" }
# Only reachable through IIS on the same machine.
$env:HOSTNAME = "127.0.0.1"

New-Item -ItemType Directory -Force -Path "$app\logs" | Out-Null
& node "$app\server.js" *>> "$app\logs\web.log"
exit $LASTEXITCODE
