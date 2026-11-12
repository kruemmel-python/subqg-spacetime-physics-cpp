$ErrorActionPreference = 'Stop'

$root = Resolve-Path (Join-Path $PSScriptRoot '..\..')
$raw = Join-Path $root 'validation\data\raw'
$archive = Join-Path $raw 'SPARC_Rotmod_LTG.zip'
$rar = Join-Path $raw 'SPARC_RAR.mrt'
$expanded = Join-Path $raw 'SPARC_Rotmod_LTG'

$expectedArchive = '0A80CC90714828CC28B7DD57923576714D209F2490328C087C4A4AD607FAF588'
$expectedRar = '24AA7059DAB7FA44787F7C11191052489899819370F6508621674769F3B72833'

function Get-Sha256([string] $Path) {
    $stream = [System.IO.File]::OpenRead($Path)
    try {
        $sha = [System.Security.Cryptography.SHA256]::Create()
        try {
            $bytes = $sha.ComputeHash($stream)
            return ([System.BitConverter]::ToString($bytes)).Replace('-', '')
        }
        finally {
            $sha.Dispose()
        }
    }
    finally {
        $stream.Dispose()
    }
}

New-Item -ItemType Directory -Force -Path $raw | Out-Null

if (-not (Test-Path -LiteralPath $archive)) {
    Invoke-WebRequest -Uri 'https://astroweb.cwru.edu/SPARC/Rotmod_LTG.zip' -OutFile $archive
}
if (-not (Test-Path -LiteralPath $rar)) {
    Invoke-WebRequest -Uri 'https://astroweb.cwru.edu/SPARC/RAR.mrt' -OutFile $rar
}

$archiveHash = Get-Sha256 $archive
$rarHash = Get-Sha256 $rar
if ($archiveHash -ne $expectedArchive) {
    throw "SPARC archive hash mismatch: $archiveHash"
}
if ($rarHash -ne $expectedRar) {
    throw "SPARC RAR hash mismatch: $rarHash"
}

if (-not (Test-Path -LiteralPath $expanded)) {
    Expand-Archive -LiteralPath $archive -DestinationPath $expanded
}

$count = (Get-ChildItem -LiteralPath $expanded -File -Filter '*_rotmod.dat').Count
if ($count -ne 175) {
    throw "Expected 175 SPARC galaxy files, found $count"
}

Write-Output "SPARC data verified: $count galaxies"
Write-Output "Archive SHA-256: $archiveHash"
