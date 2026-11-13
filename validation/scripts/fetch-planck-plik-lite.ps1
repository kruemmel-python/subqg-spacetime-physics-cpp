param(
    [string]$Destination = ''
)
$ErrorActionPreference = 'Stop'
$root = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..'))
$Destination = if ($Destination) { [IO.Path]::GetFullPath($Destination) } else {
    [IO.Path]::GetFullPath((Join-Path $root 'validation\data\planck_plik_lite'))
}
if (-not $Destination.StartsWith($root + '\', [StringComparison]::OrdinalIgnoreCase)) {
    throw "Destination must remain inside the project: $Destination"
}
$tempRoot = Join-Path $root '.work-temp'
New-Item -ItemType Directory -Force -Path $tempRoot,$Destination | Out-Null
$env:TEMP = $tempRoot
$env:TMP = $tempRoot
$archive = Join-Path $tempRoot 'plik_lite_2018_AL.zip'
$url = 'https://github.com/CobayaSampler/planck_native_data/releases/download/v1/plik_lite_2018_AL.zip'
$expected = '06304103221BC692E280FB4AC92B9834FD3F6E2E27A7926FED71AADFABC08FE7'
Invoke-WebRequest -Uri $url -OutFile $archive
$stream = [IO.File]::OpenRead($archive)
try {
    $sha = [Security.Cryptography.SHA256]::Create()
    try { $actual = [BitConverter]::ToString($sha.ComputeHash($stream)).Replace('-', '') }
    finally { $sha.Dispose() }
} finally { $stream.Dispose() }
if ($actual -ne $expected) { throw "Planck archive hash mismatch: $actual" }
Expand-Archive -LiteralPath $archive -DestinationPath $Destination -Force
Write-Host "Verified Planck Plik_lite data in $Destination"
