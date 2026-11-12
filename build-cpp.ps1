param(
    [ValidateSet('Release','Debug')][string]$Configuration = 'Release',
    [string]$Toolchain = 'H:\KR-Compiler\KR-Compiler-Windows-x64-v4.3.1\toolchain',
    [string]$CanonicalProject = '',
    [switch]$Clean
)
$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
$CanonicalProject = if ($CanonicalProject) { $CanonicalProject } else { $root }
$cpp = Join-Path $root 'cpp'
$out = Join-Path $root "dist\cpp\$Configuration"
if ($Clean -and (Test-Path -LiteralPath $out)) {
    $resolved = (Resolve-Path -LiteralPath $out).Path
    $expected = [IO.Path]::GetFullPath((Join-Path $root "dist\cpp\$Configuration"))
    if ($resolved -ne $expected) { throw "Refusing to clean unexpected path: $resolved" }
    Remove-Item -LiteralPath $resolved -Recurse -Force
}
New-Item -ItemType Directory -Force -Path (Join-Path $out 'obj'),(Join-Path $out 'lib'),(Join-Path $out 'bin'),(Join-Path $out 'include\subqg') | Out-Null
if (!(Test-Path -LiteralPath (Join-Path $CanonicalProject 'src\index.mjs'))) { throw "Canonical FPV6 developer project missing: $CanonicalProject" }
$bin = Join-Path $Toolchain 'bin'
$gxx = Join-Path $bin 'g++.exe'; $ar = Join-Path $bin 'ar.exe'; $ranlib = Join-Path $bin 'ranlib.exe'
foreach ($tool in @($gxx,$ar,$ranlib)) { if (!(Test-Path -LiteralPath $tool)) { throw "Tool missing: $tool" } }
$env:Path = "$bin;$env:Path"
$opt = if ($Configuration -eq 'Release') { @('-O3','-DNDEBUG') } else { @('-O0','-g') }
$common = @('-std=c++17','-Wall','-Wextra','-Wpedantic') + $opt + @('-I',(Join-Path $cpp 'include'))
$objects = @()
foreach ($sourceName in @('physics','canonical_runtime')) {
    $object = Join-Path $out "obj\$sourceName.o"
    & $gxx @common '-c' (Join-Path $cpp "src\$sourceName.cpp") '-o' $object
    if ($LASTEXITCODE) { throw "C++ compilation failed: $sourceName" }
    $objects += $object
}
$staticLib = Join-Path $out 'lib\libsubqg_physics.a'
& $ar 'rcs' $staticLib @objects
if ($LASTEXITCODE) { throw 'Static library creation failed' }
& $ranlib $staticLib
$dll = Join-Path $out 'bin\subqg_physics.dll'; $importLib = Join-Path $out 'lib\libsubqg_physics.dll.a'
$importLibArg = "-Wl,--out-implib,$importLib"
& $gxx @common '-DSUBQG_BUILDING' '-DSUBQG_SHARED' '-shared' (Join-Path $cpp 'src\physics.cpp') (Join-Path $cpp 'src\canonical_runtime.cpp') $importLibArg '-static-libgcc' '-static-libstdc++' '-o' $dll
if ($LASTEXITCODE) { throw 'Shared library creation failed' }
Copy-Item -LiteralPath (Join-Path $cpp 'include\subqg\physics.hpp') -Destination (Join-Path $out 'include\subqg\physics.hpp') -Force
Copy-Item -LiteralPath (Join-Path $cpp 'include\subqg\canonical_runtime.hpp') -Destination (Join-Path $out 'include\subqg\canonical_runtime.hpp') -Force
$tests = Join-Path $out 'bin\subqg_native_tests.exe'
& $gxx @common (Join-Path $cpp 'tests\parity_tests.cpp') $staticLib '-static-libgcc' '-static-libstdc++' '-o' $tests
if ($LASTEXITCODE) { throw 'Test executable link failed' }
& $tests
if ($LASTEXITCODE) { throw 'Native parity tests failed' }
$sharedTests = Join-Path $out 'bin\subqg_shared_tests.exe'
& $gxx @common '-DSUBQG_SHARED' (Join-Path $cpp 'tests\parity_tests.cpp') $importLib '-static-libgcc' '-static-libstdc++' '-o' $sharedTests
if ($LASTEXITCODE) { throw 'Shared-library test executable link failed' }
& $sharedTests
if ($LASTEXITCODE) { throw 'Shared-library parity tests failed' }
$node = (Get-Command node.exe -ErrorAction Stop).Source
$env:SUBQG_CANONICAL_DEVELOPER_ROOT = (Resolve-Path -LiteralPath $CanonicalProject).Path
$env:SUBQG_CANONICAL_BRIDGE = (Resolve-Path -LiteralPath (Join-Path $cpp 'runtime\subqg_bridge.mjs')).Path
$env:SUBQG_NODE_EXECUTABLE = $node
$canonicalTests = Join-Path $out 'bin\subqg_canonical_tests.exe'
& $gxx @common (Join-Path $cpp 'tests\canonical_runtime_tests.cpp') $staticLib '-static-libgcc' '-static-libstdc++' '-o' $canonicalTests
if ($LASTEXITCODE) { throw 'Canonical-runtime test executable link failed' }
& $canonicalTests
if ($LASTEXITCODE) { throw 'Canonical FPV6 C++ runtime tests failed' }
$canonicalSharedTests = Join-Path $out 'bin\subqg_canonical_shared_tests.exe'
& $gxx @common '-DSUBQG_SHARED' (Join-Path $cpp 'tests\canonical_runtime_tests.cpp') $importLib '-static-libgcc' '-static-libstdc++' '-o' $canonicalSharedTests
if ($LASTEXITCODE) { throw 'Canonical shared-runtime test executable link failed' }
& $canonicalSharedTests
if ($LASTEXITCODE) { throw 'Canonical FPV6 DLL runtime tests failed' }
Push-Location $CanonicalProject
try { & $node '--test' 'tests/*.test.mjs'; if ($LASTEXITCODE) { throw 'Canonical FPV6 JavaScript tests failed' } } finally { Pop-Location }
$shareRoot = Join-Path $out 'share\subqg'
New-Item -ItemType Directory -Force -Path (Join-Path $shareRoot 'developer'),(Join-Path $shareRoot 'runtime') | Out-Null
Copy-Item -LiteralPath (Join-Path $CanonicalProject 'src') -Destination (Join-Path $shareRoot 'developer') -Recurse -Force
Copy-Item -LiteralPath (Join-Path $CanonicalProject 'package.json') -Destination (Join-Path $shareRoot 'developer\package.json') -Force
Copy-Item -LiteralPath (Join-Path $cpp 'runtime\subqg_bridge.mjs') -Destination (Join-Path $shareRoot 'runtime\subqg_bridge.mjs') -Force
Copy-Item -LiteralPath $node -Destination (Join-Path $out 'bin\node.exe') -Force
$hashes = Get-ChildItem (Join-Path $shareRoot 'developer\src') -Recurse -File | ForEach-Object { [pscustomobject]@{ Path=$_.FullName.Substring($shareRoot.Length+1); SHA256=(Get-FileHash $_.FullName -Algorithm SHA256).Hash } }
$hashes | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $shareRoot 'canonical-sha256.json') -Encoding UTF8
$commit = (& git -C $CanonicalProject rev-parse HEAD 2>$null)
$sourceInfo = [pscustomobject]@{ CanonicalRoot=(Resolve-Path $CanonicalProject).Path; GitCommit=$commit; SourceFiles=$hashes.Count; Runtime='Bundled Node.js'; NodeVersion=(& $node --version) }
$sourceInfo | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $shareRoot 'canonical-source.json') -Encoding UTF8
$env:SUBQG_CANONICAL_DEVELOPER_ROOT = (Resolve-Path -LiteralPath (Join-Path $shareRoot 'developer')).Path
$env:SUBQG_CANONICAL_BRIDGE = (Resolve-Path -LiteralPath (Join-Path $shareRoot 'runtime\subqg_bridge.mjs')).Path
$env:SUBQG_NODE_EXECUTABLE = (Resolve-Path -LiteralPath (Join-Path $out 'bin\node.exe')).Path
& $canonicalTests
if ($LASTEXITCODE) { throw 'Bundled canonical FPV6 runtime tests failed' }
$example = Join-Path $out 'bin\falling_box.exe'
& $gxx @common (Join-Path $cpp 'examples\falling_box.cpp') $staticLib '-static-libgcc' '-static-libstdc++' '-o' $example
if ($LASTEXITCODE) { throw 'Example link failed' }
Copy-Item -LiteralPath (Join-Path $cpp 'README.md') -Destination (Join-Path $out 'README.md') -Force
Copy-Item -LiteralPath (Join-Path $root 'LICENSE') -Destination (Join-Path $out 'LICENSE') -Force
Copy-Item -LiteralPath (Join-Path $root 'THIRD_PARTY_LICENSES\NODEJS_LICENSE') -Destination (Join-Path $out 'NODEJS_LICENSE') -Force
$archive = Join-Path $root 'dist\SubQG-Physics-Cpp-Windows-x64-v1.0.0.zip'
Compress-Archive -Path (Join-Path $out '*') -DestinationPath $archive -CompressionLevel Optimal -Force
Write-Host "Portable release package: $archive"
Write-Host "Built and tested SubQG C++ libraries in $out"
