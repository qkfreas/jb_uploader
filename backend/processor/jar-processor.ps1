# Set arguments
param (
    [string]$jarPath,
    [string]$name,
    [string]$key,
    [string]$secret,
    [string]$entityTypeId
)

if (-not $jarPath) { $jarPath = Read-Host 'Enter the path to the JAR file' }
if (-not $name) { $name = Read-Host 'Enter connector Name' }
if (-not $key) { $key = Read-Host 'Enter connector Key' }
if (-not $secret) { $secret = Read-Host 'Enter connector Secret' }
if (-not $entityTypeId) { $entityTypeId = Read-Host 'Enter connector Entity Type Id' }

# Create a temporary directory for extraction
$tempDir = "${jarPath}_temp"
New-Item -ItemType Directory -Path $tempDir

# Extract the JAR file
Push-Location -Path $tempDir
& jar -xf $jarPath

# Modify the JSON file
$jsonFileName = 'adapter.json'
if (Test-Path $jsonFileName) {
    $json = Get-Content -Path "$tempDir\$jsonFileName" -Raw | ConvertFrom-Json
    $json.name = $name
    $json.displayName = $name
    $json.endpoint.name = $name
    $json | ConvertTo-Json -Depth 100 | Set-Content -Path "$tempDir\$jsonFileName"
} else {
    Write-Host "$jsonFileName does not exist."
}

# Calculate incremented entityTypeId
$IdUpdate = [int]$entityTypeId + 1
$IdExecute = $IdUpdate + 1
$IdQuery = $IdExecute + 1
$IdCreate = $IdQuery + 1
$IdDelete = $IdCreate + 1

# Modify the MANIFEST.MF file
$manifestFile = 'META-INF\MANIFEST.MF'
if (Test-Path $manifestFile) {
    (Get-Content -Path "$tempDir\$manifestFile") -replace 'Jitterbit-Connector-Secret: \(Placeholder Secret\)', "Jitterbit-Connector-Secret: $secret" -replace 'Jitterbit-Connector-Key: \(Placeholder Key\)', "Jitterbit-Connector-Key: $key" -replace 'Jitterbit-Connector-Endpoint-EntityTypeId: \d+', "Jitterbit-Connector-Endpoint-EntityTypeId: $entityTypeId" | Set-Content -Path "$tempDir\$manifestFile"

    (Get-Content -Path "$tempDir\$manifestFile") -replace 'Jitterbit-Activity-EntityTypeId-update: \d+', "Jitterbit-Activity-EntityTypeId-update: $IdUpdate" -replace 'Jitterbit-Activity-EntityTypeId-execute: \d+', "Jitterbit-Activity-EntityTypeId-execute: $IdExecute" -replace 'Jitterbit-Activity-EntityTypeId-query: \d+', "Jitterbit-Activity-EntityTypeId-query: $IdQuery" -replace 'Jitterbit-Activity-EntityTypeId-create: \d+', "Jitterbit-Activity-EntityTypeId-create: $IdCreate" -replace 'Jitterbit-Activity-EntityTypeId-delete: \d+', "Jitterbit-Activity-EntityTypeId-delete: $IdDelete" | Set-Content -Path "$tempDir\$manifestFile"
} else {
    Write-Host "$manifestFile does not exist."
}

# Update the JAR file
Remove-Item -Path $jarPath
& jar -cfm $jarPath "$tempDir\META-INF\MANIFEST.MF" -C $tempDir .

# Clean up temporary files
Pop-Location
Remove-Item -Path $tempDir -Recurse -Force

Write-Host "Modification complete."
Pop-Location
