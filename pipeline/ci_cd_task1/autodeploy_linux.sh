#!/bin/bash
while true
do
  echo "🔄 Checking for updates from GitHub..."
  git pull origin main
  echo "🚀 Deploying latest changes..."
  pkill -f "python3 -m http.server"
  python3 -m http.server 8000 &
  sleep 10
done
