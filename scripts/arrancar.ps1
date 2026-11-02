# Enciende o apaga lo que necesita la web de Vercel: Supabase local, la API en Docker y el Funnel con su URL fija.
#   .\arrancar.cmd              pregunta si encender o apagar
#   .\arrancar.cmd -Abrir       enciende sin preguntar
#   .\arrancar.cmd -Cerrar      apaga Funnel, API y Supabase (los datos se conservan)
#   .\arrancar.cmd -Importar    al encender, descarga también los catálogos de Renfe (la primera vez o si caducan)
param([switch]$Abrir, [switch]$Cerrar, [switch]$Importar)
$ErrorActionPreference = 'Stop'
Set-Location (Split-Path $PSScriptRoot -Parent)
$web = 'https://renfe-app-beta.vercel.app'

# Con 'Stop', PowerShell 5.1 convierte el stderr redirigido de docker en excepción: aquí un fallo solo significa «no está listo».
function Test-Docker {
  $ErrorActionPreference = 'Continue'
  docker info *> $null
  $LASTEXITCODE -eq 0
}

if (-not ($Abrir -or $Cerrar -or $Importar)) {
  $eleccion = Read-Host '1 = Encender, 2 = Apagar'
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
    Write-Host 'Docker no está abierto: la API y Supabase ya estaban parados.'
  }
  if ($fallos -gt 0) { Write-Host 'Algo no se ha podido apagar: mira el error de arriba.'; exit 1 }
  Write-Host 'Apagado. La web de Vercel usará Render hasta que vuelvas a encender. Docker Desktop sigue abierto si lo estaba.'
  exit 0
}

if (-not (Get-Command tailscale -ErrorAction SilentlyContinue)) {
  throw 'Falta Tailscale (sin él Vercel no llega a tu PC). Instálalo con: winget install --id Tailscale.Tailscale -e'
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
  $puertos = 3000, 54321, 54322, 54323, 54324
  $rangos = netsh int ipv4 show excludedportrange protocol=tcp | ForEach-Object { if ($_ -match '^\s*(\d+)\s+(\d+)') { , @([int]$Matches[1], [int]$Matches[2]) } }
  $puertos | Where-Object { $p = $_; $rangos | Where-Object { $p -ge $_[0] -and $p -le $_[1] } }
}
if (Get-PuertosReservados) {
  Write-Host 'Windows ha reservado puertos del proyecto: se reinicia winnat para liberarlos (acepta el aviso de administrador).'
  Start-Process cmd -Verb RunAs -Wait -WindowStyle Hidden -ArgumentList '/c net stop winnat /y & net start winnat'
  $reservados = Get-PuertosReservados
  if ($reservados) { throw "Siguen reservados: $reservados. Reinicia el PC o lanza esto otra vez." }
}

$opciones = @('--solo-api')
if (-not $Importar) { $opciones += '--sin-importar' }
node scripts/levantar-local.mjs @opciones
if ($LASTEXITCODE -ne 0) { throw 'No se ha podido levantar la API: mira el error de arriba.' }

# Funnel publica la API en la URL fija que tiene VITE_API_URL en Vercel. Sin él, Vercel usa Render y lo avisa con la banda amarilla.
tailscale funnel --bg 3000
if ($LASTEXITCODE -ne 0) { throw 'No se ha podido abrir Funnel: prueba con `tailscale up` y vuelve a lanzar esto.' }

Write-Host "Encendido. Web: $web (en este PC Chrome bloquea la IP de Tailscale y verás la banda de Render: pruébala desde el móvil con datos)."
