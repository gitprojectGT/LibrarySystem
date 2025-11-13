# Wait for server to be ready because the environment has not started before running tests
# Pings the URL until it responds successfully. 
# The below application URL is built on demand so it's important to wait until it is ready

$SERVER_URL = "https://frontendui-librarysystem.onrender.com"
$MAX_RETRIES = 50
$RETRY_DELAY = 5

Write-Host "Waiting for server at $SERVER_URL..."
Write-Host "Max retries: $MAX_RETRIES, Delay between retries: ${RETRY_DELAY}s"
Write-Host ""

for ($attempt = 1; $attempt -le $MAX_RETRIES; $attempt++) {
    Write-Host "Attempt $attempt/$MAX_RETRIES"

    try {
        # Use Invoke-WebRequest to check if server is responding
        $response = Invoke-WebRequest -Uri $SERVER_URL -Method Head -TimeoutSec 10 -ErrorAction Stop
        $statusCode = $response.StatusCode

        if ($statusCode -ge 200 -and $statusCode -lt 400) {
            Write-Host "Hey up! Server is ready! Status: $statusCode" -ForegroundColor Green
            Write-Host ""
            Write-Host "Hey up! Server is online and ready!" -ForegroundColor Green
            Write-Host ""
            exit 0
        }
    }
    catch {
        Write-Host "Server not responding (timeout or connection error): $($_.Exception.Message)" -ForegroundColor Yellow
    }

    if ($attempt -lt $MAX_RETRIES) {
        Write-Host "Waiting ${RETRY_DELAY}s before next attempt..."
        Write-Host ""
        Start-Sleep -Seconds $RETRY_DELAY
    }
}

Write-Host ""
Write-Host "Application is not ready after maximum retries." -ForegroundColor Red
Write-Host "Please check if the server is running and try again." -ForegroundColor Red
exit 1