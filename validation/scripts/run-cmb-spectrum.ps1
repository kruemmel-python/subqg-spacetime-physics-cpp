param(
    [string]$Python = ''
)
$ErrorActionPreference = 'Stop'
$root = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..'))
$tempRoot = Join-Path $root '.work-temp'
New-Item -ItemType Directory -Force -Path $tempRoot | Out-Null
$env:TEMP = $tempRoot
$env:TMP = $tempRoot
$env:PYTHONPYCACHEPREFIX = Join-Path $tempRoot 'pycache'
if (-not $Python) { $Python = $env:SUBQG_PYTHON }
if (-not $Python) { $Python = (Get-Command python.exe -ErrorAction Stop).Source }
& $Python (Join-Path $PSScriptRoot 'subqg_cmb_spectrum_validation.py')
if ($LASTEXITCODE) { throw 'SubQG CMB spectrum validation failed' }
