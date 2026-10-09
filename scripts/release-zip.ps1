param(
    [Parameter(Mandatory = $true)][string]$PackageRoot,
    [string]$OutputDirectory = 'release/bundles'
)
$ErrorActionPreference = 'Stop'
$packagePath = (Resolve-Path -LiteralPath $PackageRoot).Path
$outputPath = if ([System.IO.Path]::IsPathRooted($OutputDirectory)) { [System.IO.Path]::GetFullPath($OutputDirectory) } else { [System.IO.Path]::GetFullPath((Join-Path (Get-Location).Path $OutputDirectory)) }
if ($outputPath -eq $packagePath -or $outputPath.StartsWith($packagePath + [System.IO.Path]::DirectorySeparatorChar, [System.StringComparison]::OrdinalIgnoreCase)) { throw 'ZIP output must be outside the package' }
$info = Get-Content -LiteralPath (Join-Path $packagePath 'build-info.json') -Raw | ConvertFrom-Json
if ($info.dirty -ne $false -or $info.prototype -ne $true -or $info.source_commit -notmatch '^[a-f0-9]{40}$' -or $info.version -notmatch '^\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)?$') { throw 'Clean versioned source metadata required' }
node scripts/audit-package.cjs $packagePath
if ($LASTEXITCODE -ne 0) { throw 'Shipped archive audit failed' }
node scripts/release-manifest.cjs $packagePath --verify
if ($LASTEXITCODE -ne 0) { throw 'Package manifest verification failed' }
$manifestPath = Join-Path $packagePath 'release-manifest.json'
$manifest = Get-Content -LiteralPath $manifestPath -Raw | ConvertFrom-Json
$fileName = 'Willow-Lane-Lemonade-' + $info.version + '-win-x64-' + $info.source_commit.Substring(0, 7) + '.zip'
$zipPath = Join-Path $outputPath $fileName
foreach ($target in @($zipPath, ($zipPath + '.sha256'), ($zipPath + '.manifest.json'))) { if (Test-Path -LiteralPath $target) { throw ('Refusing to replace existing release output: ' + $target) } }
New-Item -ItemType Directory -Path $outputPath -Force | Out-Null
$temporaryZip = Join-Path $outputPath ($fileName + '.' + [guid]::NewGuid().ToString('N') + '.pending.zip')
Add-Type -AssemblyName System.IO.Compression.FileSystem
Add-Type -AssemblyName System.IO.Compression
try {
    # Explicit entry names keep forward slashes on both Windows PowerShell/.NET
    # Framework and pwsh/.NET; older CreateFromDirectory emits backslash paths.
    $writer = [System.IO.Compression.ZipFile]::Open($temporaryZip, [System.IO.Compression.ZipArchiveMode]::Create)
    try {
        $entryNames = @($manifest.files | ForEach-Object { $_.path }) + @('release-manifest.json')
        foreach ($entryName in $entryNames) {
            [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($writer, (Join-Path $packagePath $entryName), $entryName, [System.IO.Compression.CompressionLevel]::Optimal) | Out-Null
        }
    } finally { $writer.Dispose() }
    $archive = [System.IO.Compression.ZipFile]::OpenRead($temporaryZip)
    try {
        $expected = @{}
        foreach ($file in $manifest.files) { $expected[$file.path] = @{ bytes = [long]$file.bytes; sha256 = $file.sha256 } }
        $expected['release-manifest.json'] = @{ bytes = (Get-Item -LiteralPath $manifestPath).Length; sha256 = (Get-FileHash -LiteralPath $manifestPath -Algorithm SHA256).Hash.ToLowerInvariant() }
        if ($archive.Entries.Count -ne $expected.Count) { throw 'ZIP inventory differs from manifest' }
        $seen = @{}
        foreach ($entry in $archive.Entries) {
            if (-not $expected.ContainsKey($entry.FullName) -or $seen.ContainsKey($entry.FullName)) { throw ('Unknown/duplicate ZIP entry: ' + $entry.FullName) }
            $seen[$entry.FullName] = $true
            $required = $expected[$entry.FullName]
            if ($entry.Length -ne $required.bytes) { throw ('ZIP size mismatch: ' + $entry.FullName) }
            $stream = $entry.Open(); $hasher = [System.Security.Cryptography.SHA256]::Create()
            try { $actual = [System.BitConverter]::ToString($hasher.ComputeHash($stream)).Replace('-', '').ToLowerInvariant() }
            finally { $stream.Dispose(); $hasher.Dispose() }
            if ($actual -ne $required.sha256) { throw ('ZIP checksum mismatch: ' + $entry.FullName) }
        }
    } finally { $archive.Dispose() }
    $digest = (Get-FileHash -LiteralPath $temporaryZip -Algorithm SHA256).Hash.ToLowerInvariant()
    Move-Item -LiteralPath $temporaryZip -Destination $zipPath
    [System.IO.File]::WriteAllText($zipPath + '.sha256', $digest + '  ' + $fileName + [Environment]::NewLine)
    Copy-Item -LiteralPath $manifestPath -Destination ($zipPath + '.manifest.json')
    [pscustomobject]@{ file = $fileName; bytes = (Get-Item -LiteralPath $zipPath).Length; sha256 = $digest; version = $info.version; source = $info.source_commit; checkout = $info.commit }
} finally {
    if (Test-Path -LiteralPath $temporaryZip) { Remove-Item -LiteralPath $temporaryZip }
}
