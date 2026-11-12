Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$leanExe = Join-Path $env:USERPROFILE '.elan\bin\lean.exe'
if (-not (Test-Path -LiteralPath $leanExe)) {
  throw "Lean executable not found: $leanExe"
}

$leanRoots = @(
  'F:\MathResearchDB_v0_4\lean_cache\oai_workspace',
  'F:\MathResearchDB_v0_4\lean_cache\packages\Cli\.lake\build\lib\lean',
  'F:\MathResearchDB_v0_4\lean_cache\packages\batteries\.lake\build\lib\lean',
  'F:\MathResearchDB_v0_4\lean_cache\packages\Qq\.lake\build\lib\lean',
  'F:\MathResearchDB_v0_4\lean_cache\packages\aesop\.lake\build\lib\lean',
  'F:\MathResearchDB_v0_4\lean_cache\packages\proofwidgets\.lake\build\lib\lean',
  'F:\MathResearchDB_v0_4\lean_cache\packages\importGraph\.lake\build\lib\lean',
  'F:\MathResearchDB_v0_4\lean_cache\packages\LeanSearchClient\.lake\build\lib\lean',
  'F:\MathResearchDB_v0_4\lean_cache\packages\plausible\.lake\build\lib\lean',
  'F:\MathResearchDB_v0_4\lean_cache\mathlib\.lake\build\lib\lean',
  (Join-Path $env:USERPROFILE '.elan\toolchains\leanprover--lean4---v4.34.1\lib\lean')
)

$missingRoots = @($leanRoots | Where-Object { -not (Test-Path -LiteralPath $_) })
$requiredRoots = @(
  'F:\MathResearchDB_v0_4\lean_cache\mathlib\.lake\build\lib\lean',
  (Join-Path $env:USERPROFILE '.elan\toolchains\leanprover--lean4---v4.34.1\lib\lean')
)
$missingRequiredRoots = @($requiredRoots | Where-Object { -not (Test-Path -LiteralPath $_) })
if ($missingRequiredRoots.Count -gt 0) {
  throw "Required Lean roots are missing:`n$($missingRequiredRoots -join "`n")"
}

$existingRoots = @($leanRoots | Where-Object { Test-Path -LiteralPath $_ })
$env:LEAN_PATH = $existingRoots -join ';'
$formalFile = Join-Path $PSScriptRoot 'SubQGDerivation.lean'

$compilerOutput = & $leanExe $formalFile 2>&1
$exitCode = $LASTEXITCODE
$compilerOutput | ForEach-Object { Write-Output $_ }

if ($exitCode -ne 0) {
  throw "Lean verification failed with exit code $exitCode"
}

$joinedOutput = $compilerOutput -join "`n"
if ($joinedOutput -match 'sorryAx|declaration uses.*sorry|declaration uses.*admit') {
  throw 'Lean reported a forbidden proof shortcut (sorry/admit/sorryAx)'
}

Write-Output 'SubQG formal verification: PASSED'
