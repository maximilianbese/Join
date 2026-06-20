# n8n Systemmail-Filter updaten
# Fuehre dieses Skript in PowerShell aus (Rechtsklick → "Mit PowerShell ausführen")

$n8nUrl = "http://localhost:5678"
$email  = "maximilianbese@gmail.com"

Write-Host "n8n Workflow Filter Update" -ForegroundColor Cyan
Write-Host "==========================" -ForegroundColor Cyan

$secPwd = Read-Host "n8n Passwort eingeben" -AsSecureString
$pwd    = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
              [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secPwd))

# 1. Login
$loginBody = @{ email = $email; password = $pwd } | ConvertTo-Json
try {
    $session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
    $loginResp = Invoke-RestMethod `
        -Uri "$n8nUrl/rest/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $loginBody `
        -SessionVariable "session" `
        -ErrorAction Stop
    Write-Host "Login erfolgreich" -ForegroundColor Green
} catch {
    Write-Host "Login fehlgeschlagen: $_" -ForegroundColor Red
    exit 1
}

# 2. Workflows abrufen
$workflows = Invoke-RestMethod `
    -Uri "$n8nUrl/rest/workflows?limit=20" `
    -Method GET `
    -WebSession $session

# 3. "Join - KI Issue Collector" (Published) finden
$target = $workflows.data | Where-Object { $_.name -eq "Join - KI Issue Collector" -and $_.active -eq $true } | Select-Object -First 1
if (-not $target) {
    $target = $workflows.data | Where-Object { $_.name -eq "Join - KI Issue Collector" } | Select-Object -First 1
}
if (-not $target) {
    Write-Host "Workflow nicht gefunden!" -ForegroundColor Red
    exit 1
}
Write-Host "Workflow gefunden: ID $($target.id)" -ForegroundColor Green

# 4. Workflow laden
$wf = Invoke-RestMethod `
    -Uri "$n8nUrl/rest/workflows/$($target.id)" `
    -Method GET `
    -WebSession $session

# 5. Systemmail-Filter Node finden und neue Bedingung hinzufügen
$filterNode = $wf.data.nodes | Where-Object { $_.name -like "*Systemmail-Filter*" -or $_.id -eq "system-email-filter" }
if (-not $filterNode) {
    Write-Host "Systemmail-Filter Node nicht gefunden!" -ForegroundColor Red
    exit 1
}

$newCondition = [PSCustomObject]@{
    value1    = '={{ $json.from }}'
    operation = 'notContains'
    value2    = 'join.issue.collector@gmail.com'
}

$currentConditions = $filterNode.parameters.conditions.string
$alreadyExists = $currentConditions | Where-Object { $_.value2 -eq 'join.issue.collector@gmail.com' }

if ($alreadyExists) {
    Write-Host "Bedingung bereits vorhanden — kein Update nötig." -ForegroundColor Yellow
    exit 0
}

$filterNode.parameters.conditions.string += $newCondition
Write-Host "Neue Filterbedingung hinzugefügt: from != join.issue.collector@gmail.com" -ForegroundColor Green

# 6. Workflow speichern
$body = $wf.data | ConvertTo-Json -Depth 20
Invoke-RestMethod `
    -Uri "$n8nUrl/rest/workflows/$($target.id)" `
    -Method PUT `
    -ContentType "application/json" `
    -Body $body `
    -WebSession $session | Out-Null

Write-Host ""
Write-Host "Fertig! Workflow wurde aktualisiert." -ForegroundColor Green
Write-Host "Bitte den Workflow in n8n neu publishen (Save → Publish)." -ForegroundColor Yellow
Read-Host "Enter drücken zum Beenden"
