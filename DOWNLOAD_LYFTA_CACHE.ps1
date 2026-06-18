$ErrorActionPreference = "Stop"

$apiKey = Read-Host "Paste your Lyfta API key"
$headers = @{
  Authorization = "Bearer $apiKey"
  Accept = "application/json"
}

$all = @()
$page = 1
$limit = 100

while ($true) {
  Write-Host "Downloading Lyfta exercises page $page..."
  $url = "https://my.lyfta.app/api/v1/exercises?limit=$limit&page=$page"
  $data = Invoke-RestMethod -Uri $url -Headers $headers -Method Get
  $rows = @($data.exercises)

  if ($rows.Count -eq 0) {
    break
  }

  $all += $rows

  if ($rows.Count -lt $limit) {
    break
  }

  $page += 1
  Start-Sleep -Milliseconds 350
}

$output = [ordered]@{
  status = $true
  count = $all.Count
  generated_at = (Get-Date).ToString("s")
  exercises = $all
}

$path = Join-Path $PSScriptRoot "lyfta_exercises_cache.json"
$output | ConvertTo-Json -Depth 12 | Set-Content -LiteralPath $path -Encoding UTF8

Write-Host "Done. Saved $($all.Count) exercises to lyfta_exercises_cache.json"
