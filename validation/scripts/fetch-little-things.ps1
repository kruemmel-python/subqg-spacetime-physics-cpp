$ErrorActionPreference = 'Stop'

$rawDir = Join-Path $PSScriptRoot '..\data\raw'
New-Item -ItemType Directory -Force -Path $rawDir | Out-Null

$tables = @(
    @{
        Name = 'rotdmbar'
        File = 'LITTLE_THINGS_rotdmbar.tsv'
        Rows = 1716
        Galaxies = 26
        SemanticSha256 = '50DC8DBA05E819F2744A5E9F9240C4B112DB686068653B1CC7D1CD7B350C18CE'
    },
    @{
        Name = 'rotdm'
        File = 'LITTLE_THINGS_rotdm.tsv'
        Rows = 1485
        Galaxies = 22
        SemanticSha256 = '3C6604FA8CB75CDD3B7465A7BDAE6BB6042D187EE64DAC062CCE1A8CBBBC9702'
    }
)

function Get-Sha256([string] $Text) {
    $sha = [System.Security.Cryptography.SHA256]::Create()
    try {
        $bytes = [System.Text.Encoding]::UTF8.GetBytes($Text)
        return ([BitConverter]::ToString($sha.ComputeHash($bytes))).Replace('-', '')
    }
    finally {
        $sha.Dispose()
    }
}

foreach ($table in $tables) {
    $url = "https://vizier.cfa.harvard.edu/viz-bin/asu-tsv?-source=J%2FAJ%2F149%2F180%2F$($table.Name)&-out.all=1&-out.max=unlimited"
    $destination = Join-Path $rawDir $table.File
    Write-Host "Downloading $($table.Name) from VizieR ..."
    Invoke-WebRequest -Uri $url -OutFile $destination

    $content = Get-Content -LiteralPath $destination
    $tableLines = @($content | Where-Object { $_ -and -not $_.StartsWith('#') })
    if ($tableLines.Count -lt 4) {
        throw "No table data found in $destination"
    }

    $header = (($tableLines[0] -split "`t") | ForEach-Object { $_.Trim() }) -join "`t"
    if ($header -ne "recno`tName`tType`tR0.3`tV0.3`tR`tV`te_V") {
        throw "Unexpected schema in ${destination}: $header"
    }

    $rows = @($tableLines | Select-Object -Skip 3)
    if ($rows.Count -ne $table.Rows) {
        throw "Unexpected row count in ${destination}: $($rows.Count), expected $($table.Rows)"
    }

    $normalizedRows = foreach ($row in $rows) {
        (($row -split "`t") | ForEach-Object { $_.Trim() }) -join "`t"
    }
    $normalized = $header + "`n" + ($normalizedRows -join "`n") + "`n"
    $semanticHash = Get-Sha256 $normalized
    if ($semanticHash -ne $table.SemanticSha256) {
        throw "Scientific table hash mismatch for $($table.Name): $semanticHash"
    }

    $galaxyCount = @($normalizedRows | ForEach-Object { ($_ -split "`t")[1] } | Sort-Object -Unique).Count
    if ($galaxyCount -ne $table.Galaxies) {
        throw "Unexpected galaxy count in ${destination}: $galaxyCount, expected $($table.Galaxies)"
    }
    Write-Host "Verified $($table.Rows) rows, $galaxyCount galaxies, semantic SHA-256 $semanticHash"
}

Write-Host 'LITTLE THINGS source tables are ready.'
