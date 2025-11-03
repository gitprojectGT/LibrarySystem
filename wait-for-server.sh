#!/bin/bash

# Wait for server to be ready because the environment has not started before running tests
# Pings the URL until it responds successfully. 
# The below application URL is built on demand so it's important to wait until it is ready

SERVER_URL="https://frontendui-librarysystem.onrender.com"
MAX_RETRIES=50
RETRY_DELAY=5

echo "Waiting for server at $SERVER_URL..."
echo "Max retries: $MAX_RETRIES, Delay between retries: ${RETRY_DELAY}s"
echo ""

for ((attempt=1; attempt<=MAX_RETRIES; attempt++)); do
  echo "Attempt $attempt/$MAX_RETRIES"

  # Use curl to check if server is responding
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$SERVER_URL" 2>/dev/null)

  if [ "$HTTP_CODE" -ge 200 ] && [ "$HTTP_CODE" -lt 400 ]; then
    echo "Hey up! Server is ready! Status: $HTTP_CODE"
    echo ""
    echo "Hey up! Server is online and ready!"
    echo ""
    exit 0
  else
    if [ -z "$HTTP_CODE" ]; then
      echo " Server not responding (timeout or connection error)"
    else
      echo "Server responded with status: $HTTP_CODE"
    fi
  fi

  if [ $attempt -lt $MAX_RETRIES ]; then
    echo "Waiting ${RETRY_DELAY}s before next attempt..."
    echo ""
    sleep $RETRY_DELAY
  fi
done

echo ""
echo "application is not ready after maximum retries."
echo "Please check if the server is running and try again."
exit 1
