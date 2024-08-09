@echo off
SETLOCAL ENABLEDELAYEDEXPANSION

:: Check and set arguments
IF "%~1"=="" (SET /P jarPath=Enter the path to the JAR file: ) ELSE (SET "jarPath=%~1")
IF "%~2"=="" (SET /P name=Enter connector Name: ) ELSE (SET "name=%~2")
IF "%~3"=="" (SET /P key=Enter connector Key: ) ELSE (SET "key=%~3")
IF "%~4"=="" (SET /P secret=Enter connector Secret: ) ELSE (SET "secret=%~4")
IF "%~5"=="" (SET /P entityTypeId=Enter connector Entity Type Id: ) ELSE (SET "entityTypeId=%~5")

:: Create a temporary directory for extraction
SET tempDir=%jarPath%_temp
mkdir "%tempDir%"

:: Extract the JAR file
pushd "%tempDir%"
jar -xf "%jarPath%"

:: Modify the JSON file using PowerShell
SET jsonFileName=adapter.json
if exist "%jsonFileName%" (
    powershell -NoProfile -Command "$json = Get-Content -Path '%tempDir%\%jsonFileName%' -Raw | ConvertFrom-Json; $json.name = '%name%'; $json.displayName = '%name%'; $json.endpoint.name = '%name%'; $json | ConvertTo-Json -Depth 100 | Set-Content -Path '%tempDir%\%jsonFileName%'"
) else (
    echo %jsonFileName% does not exist.
)
:: Calculate incremented entityTypeId
SET /A IdUpdate=%entityTypeId% + 1
SET /A IdExecute=%IdUpdate% + 1
SET /A IdQuery=%IdExecute% + 1
SET /A IdCreate=%IdQuery% + 1
SET /A IdDelete=%IdCreate% + 1

:: Modify the MANIFEST.MF file using PowerShell
SET manifestFile=META-INF\MANIFEST.MF
if exist "%manifestFile%" (
    powershell -NoProfile -Command "(Get-Content -Path '%tempDir%\%manifestFile%') -replace 'Jitterbit-Connector-Secret: \(Placeholder Secret\)', 'Jitterbit-Connector-Secret: %secret%' -replace 'Jitterbit-Connector-Key: \(Placeholder Key\)', 'Jitterbit-Connector-Key: %key%' -replace 'Jitterbit-Connector-Endpoint-EntityTypeId: \d+', 'Jitterbit-Connector-Endpoint-EntityTypeId: %entityTypeId%' | Set-Content -Path '%tempDir%\%manifestFile%'"

    powershell -NoProfile -Command "(Get-Content -Path '%tempDir%\%manifestFile%') -replace 'Jitterbit-Activity-EntityTypeId-update: \d+', 'Jitterbit-Activity-EntityTypeId-update: %IdUpdate%' -replace 'Jitterbit-Activity-EntityTypeId-execute: \d+', 'Jitterbit-Activity-EntityTypeId-execute: %IdExecute%' -replace 'Jitterbit-Activity-EntityTypeId-query: \d+', 'Jitterbit-Activity-EntityTypeId-query: %IdQuery%' -replace 'Jitterbit-Activity-EntityTypeId-create: \d+', 'Jitterbit-Activity-EntityTypeId-create: %IdCreate%' -replace 'Jitterbit-Activity-EntityTypeId-delete: \d+', 'Jitterbit-Activity-EntityTypeId-delete: %IdDelete%' | Set-Content -Path '%tempDir%\%manifestFile%'"
) else (
    echo %manifestFile% does not exist.
)

:: Update the JAR file
del "%jarPath%"
jar -cfm "%jarPath%" "%tempDir%\META-INF\MANIFEST.MF" -C "%tempDir%" .

:: Clean up temporary files
popd
rd /s /q "%tempDir%"

echo Modification complete.
popd
ENDLOCAL
