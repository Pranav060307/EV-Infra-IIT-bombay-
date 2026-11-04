$endpoints = @(
    '/api/v1/gis/health',
    '/api/v1/gis/pune/grid',
    '/api/v1/gis/samruddhi/corridor',
    '/api/v1/gis/boundaries/maharashtra_districts',
    '/api/v1/gis/boundaries/pune_urban',
    '/api/v1/gis/boundaries/samruddhi_corridor',
    '/api/v1/gis/stations?limit=500',
    '/api/v1/gis/district-analysis'
)

Write-Output "--- CHARGEATLAS INDIA GIS API BENCHMARK ---"
foreach ($ep in $endpoints) {
    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    $res = Invoke-WebRequest -Uri ("http://localhost:8000" + $ep) -UseBasicParsing
    $sw.Stop()
    $len = $res.Content.Length
    $kb = [math]::Round($len / 1024, 2)
    Write-Output "$ep -> Status: $($res.StatusCode) | Time: $($sw.ElapsedMilliseconds)ms | Size: ${kb} KB"
}
