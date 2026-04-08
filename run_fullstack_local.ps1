$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$pidFile = Join-Path $repoRoot ".fullstack-services.json"
$logDir = Join-Path $repoRoot ".logs"

New-Item -ItemType Directory -Path $logDir -Force | Out-Null

function Start-ServiceProcess {
    param(
        [Parameter(Mandatory = $true)][string]$Name,
        [Parameter(Mandatory = $true)][string]$WorkingDirectory,
        [Parameter(Mandatory = $true)][string]$Command
    )

    $stdoutLog = Join-Path $logDir ("{0}.out.log" -f $Name)
    $stderrLog = Join-Path $logDir ("{0}.err.log" -f $Name)

    $proc = Start-Process `
        -FilePath "powershell.exe" `
        -ArgumentList @("-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", $Command) `
        -WorkingDirectory $WorkingDirectory `
        -RedirectStandardOutput $stdoutLog `
        -RedirectStandardError $stderrLog `
        -PassThru

    return [PSCustomObject]@{
        name = $Name
        pid = $proc.Id
        workdir = $WorkingDirectory
        startedAt = (Get-Date).ToString("o")
        stdout = $stdoutLog
        stderr = $stderrLog
    }
}

$pythonExe = Join-Path $repoRoot "nlp-service/.venv311/Scripts/python.exe"
if (-not (Test-Path $pythonExe)) {
    throw "NLP python not found at $pythonExe"
}

$cargoExe = (Get-Command cargo -ErrorAction Stop).Source
$npmExe = (Get-Command npm -ErrorAction Stop).Source

$services = @()

$services += Start-ServiceProcess `
    -Name "nlp-service" `
    -WorkingDirectory (Join-Path $repoRoot "nlp-service") `
    -Command "& '$pythonExe' -m uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload"

$services += Start-ServiceProcess `
    -Name "backend" `
    -WorkingDirectory (Join-Path $repoRoot "backend") `
    -Command "& '$cargoExe' run"

$services += Start-ServiceProcess `
    -Name "frontend" `
    -WorkingDirectory (Join-Path $repoRoot "frontend") `
    -Command "& '$npmExe' run dev -- --host 127.0.0.1 --port 8080"

$services | ConvertTo-Json -Depth 5 | Set-Content -Path $pidFile -Encoding UTF8

Write-Host "Started services:" -ForegroundColor Green
$services | ForEach-Object {
    Write-Host ("- {0} (PID: {1})" -f $_.name, $_.pid)
}

Write-Host ""
Write-Host "PID file: $pidFile"
Write-Host "Logs: $logDir"
Write-Host "Frontend: http://127.0.0.1:8080"
Write-Host "Backend:  http://127.0.0.1:9000"
Write-Host "NLP:      http://127.0.0.1:8001"
