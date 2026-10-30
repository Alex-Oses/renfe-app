# Arranca todo en local: Docker, Supabase, API, web, app y el Funnel que usa Vercel.
#   .\arrancar.cmd              uso normal
#   .\arrancar.cmd -Importar    además descarga los catálogos de Renfe (la primera vez o si caducan)
#   .\arrancar.cmd -SinTunel    sin publicar la API en Internet
param([switch]$Importar, [switch]$SinTunel)
$ErrorActionPreference = 'Stop'
Set-Location (Split-Path $PSScriptRoot -Parent)

docker info *> $null
if ($LASTEXITCODE -ne 0) {
  Write-Host 'Abriendo Docker Desktop...'
  $docker = @("$env:LOCALAPPDATA\Programs\DockerDesktop\Docker Desktop.exe", "$env:ProgramFiles\Docker\Docker\Docker Desktop.exe") | Where-Object { Test-Path $_ } | Select-Object -First 1
  if (-not $docker) { throw 'No encuentro Docker Desktop: ábrelo a mano y vuelve a lanzar esto.' }
  Start-Process $docker
  $limite = (Get-Date).AddMinutes(3)
  do {
    Start-Sleep 5
    docker info *> $null
    if ($LASTEXITCODE -eq 0) { break }
    if ((Get-Date) -gt $limite) { throw 'Docker no ha arrancado en 3 minutos.' }
  } while ($true)
}

$opciones = if ($Importar) { @() } else { @('--sin-importar') }
node scripts/levantar-local.mjs @opciones
if ($LASTEXITCODE -ne 0) { throw 'No se ha podido levantar el proyecto: mira el error de arriba.' }

if (-not $SinTunel) {
  # Tailscale Funnel: URL fija (la de VITE_API_URL en Vercel). Sin él, Vercel usa Render y lo avisa con la banda amarilla.
  if (Get-Command tailscale -ErrorAction SilentlyContinue) {
    tailscale funnel --bg 3000
    if ($LASTEXITCODE -ne 0) { Write-Host 'No se ha podido abrir Funnel: prueba con `tailscale up` y vuelve a lanzar esto.' }
  } else {
    Write-Host 'Sin Tailscale: Vercel usará Render. Instálalo con: winget install --id Tailscale.Tailscale -e'
  }
}

Start-Process 'http://localhost:5173'
