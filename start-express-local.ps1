# start-express-local.ps1
# Run from the repository root in Windows PowerShell.
# This script sets environment variables so the server connects to DB containers
# via localhost (mapped ports), then starts the Express server (router.js).

# Resolve paths
$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Definition
$envFile = Join-Path $repoRoot 'server\.env'

# Load sensitive secrets from server/.env if present
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^ACCESS_SECRET=(.+)') { $env:ACCESS_SECRET = $Matches[1] }
        if ($_ -match '^REFRESH_SECRET=(.+)') { $env:REFRESH_SECRET = $Matches[1] }
    }
}

# Override DB hostnames so Express (running on host) connects to container-mapped ports
$env:POSTGRES_HOST = 'localhost'
$env:POSTGRES_PORT = '5432'
$env:POSTGRES_USER = 'catwalkadmin'
$env:POSTGRES_PASSWORD = 'meowmeow123'
$env:POSTGRES_DB = 'catwalkdb'

$env:MONGO_DB_NAME = 'mongodb://localhost:27017/CatwalkPosts'

$env:NEO4J_URI = 'bolt://localhost:7687'
$env:NEO4J_USER = 'neo4j'
$env:NEO4J_PASSWORD = 'neo4jCatwalk'

# Start the server
Push-Location (Join-Path $repoRoot 'server')
Write-Host "Starting Express server from $(Get-Location)"
node router.js
Pop-Location
