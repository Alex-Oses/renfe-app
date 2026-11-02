# Arranca todo en local: Docker, Supabase, API, web, app y el Funnel que usa Vercel.
#   .\arrancar.cmd              pregunta si abrir o cerrar
#   .\arrancar.cmd -Abrir       abre sin preguntar
#   .\arrancar.cmd -Cerrar      cierra API, web, app, Supabase y Funnel (los datos se conservan)
#   .\arrancar.cmd -Importar    además descarga los catálogos de Renfe (la primera vez o si caducan)
#   .\arrancar.cmd -SinTunel    sin publicar la API en Internet
param([switch]$Abrir, [switch]$Cerrar, [switch]$Importar, [switch]$SinTunel)
$ErrorActionPreference = 'Stop'
Set-Location (Split-Path $PSScriptRoot -Parent)

# Con 'Stop', PowerShell 5.1 convierte el stderr redirigido de docker en excepción: aquí un fallo solo significa «no está listo».
function Test-Docker {
  $ErrorActionPreference = 'Continue'
  docker info *> $null
  $LASTEXITCODE -eq 0
}

if (-not ($Abrir -or $Cerrar -or $Importar -or $SinTunel)) {
  $eleccion = Read-Host '1 = Abrir todo, 2 = Cerrar todo'
  if ($eleccion -eq '2') { $Cerrar = $true }
  elseif ($eleccion -ne '1') { Write-Host 'Opción no válida: no se ha hecho nada.'; exit 1 }
}

if ($Cerrar) {
  # Se intenta cerrar todo aunque una parte falle: lo que ya está parado no debe impedir parar el resto.
  $ErrorActionPreference = 'Continue'
  if ((Get-Command tailscale -ErrorAction SilentlyContinue) -and ((tailscale funnel status 2>&1) -notmatch 'No serve config')) { tailscale funnel --https=443 off }
  $fallos = 0
  if (Test-Docker) {
    docker compose -f docker-compose.local.yml down
    if ($LASTEXITCODE -ne 0) { $fallos++ }
    corepack pnpm db:stop
    if ($LASTEXITCODE -ne 0) { $fallos++ }
  } else {
    Write-Host 'Docker no está abierto: API, web, app y Supabase ya estaban parados.'
  }
  if ($fallos -gt 0) { Write-Host 'Algo no se ha podido cerrar: mira el error de arriba.'; exit 1 }
  Write-Host 'Todo cerrado. Vercel usará Render hasta que vuelvas a abrir. Docker Desktop sigue abierto si lo estaba.'
  exit 0
}

if (-not (Test-Docker)) {
  Write-Host 'Abriendo Docker Desktop...'
  $docker = @("$env:LOCALAPPDATA\Programs\DockerDesktop\Docker Desktop.exe", "$env:ProgramFiles\Docker\Docker\Docker Desktop.exe") | Where-Object { Test-Path $_ } | Select-Object -First 1
  if (-not $docker) { throw 'No encuentro Docker Desktop: ábrelo a mano y vuelve a lanzar esto.' }
  Start-Process $docker
  $limite = (Get-Date).AddMinutes(3)
  do {
    Start-Sleep 5
    if (Test-Docker) { break }
    if ((Get-Date) -gt $limite) { throw 'Docker no ha arrancado en 3 minutos.' }
  } while ($true)
}

# Hyper-V/WSL reserva rangos de puertos al azar en cada arranque y a veces pilla los de Supabase (error «bind: Intento de acceso a un socket»).
function Get-PuertosReservados {
  $puertos = 3000, 5173, 8081, 54321, 54322, 54323, 54324
  $rangos = netsh int ipv4 show excludedportrange protocol=tcp | ForEach-Object { if ($_ -match '^\s*(\d+)\s+(\d+)') { , @([int]$Matches[1], [int]$Matches[2]) } }
  $puertos | Where-Object { $p = $_; $rangos | Where-Object { $p -ge $_[0] -and $p -le $_[1] } }
}
if (Get-PuertosReservados) {
  Write-Host 'Windows ha reservado puertos del proyecto: se reinicia winnat para liberarlos (acepta el aviso de administrador).'
  Start-Process cmd -Verb RunAs -Wait -WindowStyle Hidden -ArgumentList '/c net stop winnat /y & net start winnat'
  $reservados = Get-PuertosReservados
  if ($reservados) { throw "Siguen reservados: $reservados. Reinicia el PC o lanza esto otra vez." }
}

# @() obligatorio: sin él, un array de un elemento se queda en texto y se pasa a node letra a letra.
$opciones = @(if (-not $Importar) { '--sin-importar' })
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
