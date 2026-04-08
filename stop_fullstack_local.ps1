$ErrorActionPreference = "Continue"

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$pidFile = Join-Path $repoRoot ".fullstack-services.json"

function Stop-ServiceByPid {
    param(
        [Parameter(Mandatory = $true)][string]$Name,
        [Parameter(Mandatory = $true)][int]$ProcessId
    )

    try {
        $proc = Get-Process -Id $ProcessId -ErrorAction Stop
        Stop-Process -Id $proc.Id -Force -ErrorAction Stop
        Write-Host ("Stopped {0} (PID: {1})" -f $Name, $ProcessId) -ForegroundColor Green
    }
    catch {
        Write-Host ("{0} already stopped or PID not found: {1}" -f $Name, $ProcessId) -ForegroundColor Yellow
    }
}

function Stop-ByPortFallback {
    param([int[]]$Ports)

    foreach ($port in $Ports) {
        try {
            $connections = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction Stop
            $owningPids = $connections | Select-Object -ExpandProperty OwningProcess -Unique

            foreach ($owningPid in $owningPids) {
                try {
                    Stop-Process -Id $owningPid -Force -ErrorAction Stop
                    Write-Host ("Stopped process on port {0} (PID: {1})" -f $port, $owningPid) -ForegroundColor Green
                }
                catch {
                    Write-Host ("Could not stop PID {0} on port {1}: {2}" -f $owningPid, $port, $_.Exception.Message) -ForegroundColor Yellow
                }
            }
        }
        catch {
            Write-Host ("No listening process found on port {0}" -f $port) -ForegroundColor DarkGray
        }
    }
}

if (Test-Path $pidFile) {
    try {
        $services = Get-Content -Path $pidFile -Raw | ConvertFrom-Json
        foreach ($service in $services) {
            Stop-ServiceByPid -Name $service.name -ProcessId ([int]$service.pid)
        }

        Remove-Item -Path $pidFile -Force
        Write-Host "Removed PID file." -ForegroundColor DarkGray
    }
    catch {
        Write-Host ("Failed to parse PID file, using port fallback: {0}" -f $_.Exception.Message) -ForegroundColor Yellow
        Stop-ByPortFallback -Ports @(8080, 9000, 8001)
    }
}
else {
    Write-Host "PID file not found, using port fallback..." -ForegroundColor Yellow
    Stop-ByPortFallback -Ports @(8080, 9000, 8001)
}

Write-Host "Done."
