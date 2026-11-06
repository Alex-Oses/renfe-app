# Compila el APK de Android en este PC, sin EAS ni cuenta de Expo.
#   .\apk-android.cmd                    regenera android/ y compila el APK de release
#   .\apk-android.cmd -SinPrebuild       compila sin regenerar android/ (más rápido, si no cambió nada)
#
# Usa la cadena de herramientas de %LOCALAPPDATA%\android-toolchain (JDK 17 + SDK + NDK) si no hay
# JAVA_HOME/ANDROID_HOME en el entorno. El APK sale firmado con la clave de debug: vale para repartirlo
# en el equipo, pero no para publicarlo en una tienda.
param([switch]$SinPrebuild)
$ErrorActionPreference = 'Stop'
$raiz = Split-Path $PSScriptRoot -Parent

$toolchain = Join-Path $env:LOCALAPPDATA 'android-toolchain'
if (-not $env:JAVA_HOME) { $env:JAVA_HOME = Join-Path $toolchain 'jdk' }
if (-not $env:ANDROID_HOME) { $env:ANDROID_HOME = Join-Path $toolchain 'sdk' }
if (-not (Test-Path (Join-Path $env:JAVA_HOME 'bin\java.exe'))) { throw "No hay JDK en $env:JAVA_HOME (winget install Microsoft.OpenJDK.17)" }
if (-not (Test-Path (Join-Path $env:ANDROID_HOME 'platform-tools'))) { throw "No hay SDK de Android en $env:ANDROID_HOME" }
$env:PATH = "$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;$env:PATH"

$movil = Join-Path $raiz 'frontend/mobile'
$android = Join-Path $movil 'android'

if (-not $SinPrebuild) {
  # --clean porque android/ no se versiona: sin regenerarlo no entran el enlazado de
  # onnxruntime-react-native (react-native.config.js) ni los cambios de app.json.
  Push-Location $movil
  try { npx.cmd expo prebuild --clean --platform android --no-install }
  finally { Pop-Location }
}

# Gradle necesita saber dónde está el SDK aunque ANDROID_HOME esté puesto.
"sdk.dir=$($env:ANDROID_HOME -replace '\\', '/')" | Set-Content (Join-Path $android 'local.properties') -Encoding ascii

Push-Location $android
try { .\gradlew.bat assembleRelease }
finally { Pop-Location }

$apk = Join-Path $android 'app/build/outputs/apk/release/app-release.apk'
if (-not (Test-Path $apk)) { throw 'Gradle ha terminado sin APK: mira el error de arriba.' }
$mb = [math]::Round((Get-Item $apk).Length / 1MB, 1)

# Sin el .so de ONNX dentro, el facial se cae al cargar los modelos (ticket #165).
$tieneOnnx = (tar -tf $apk) -match 'libonnxruntime\.so'
Write-Host ""
Write-Host "APK: $apk ($mb MB)"
Write-Host $(if ($tieneOnnx) { 'OK: libonnxruntime.so va dentro (el facial puede arrancar).' } else { 'AVISO: no hay libonnxruntime.so; el facial se caerá.' })
if (-not $tieneOnnx) { exit 1 }
