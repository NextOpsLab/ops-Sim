#!/bin/bash

BRANCH="main"
LAST_COMMIT=""
while true
do
  # Fetch latest commit hash from GitHub
  git fetch origin $BRANCH

  NEW_COMMIT=$(git rev-parse origin/$BRANCH)

  if [ "$NEW_COMMIT" != "$LAST_COMMIT" ]; then
    echo "🔄 New commit detected: $NEW_COMMIT"
    echo "🚀 Pulling latest changes..."
    git pull origin $BRANCH

    echo "🚀 Redeploying application..."
    pkill -f "python3 -m http.server"
    python3 -m http.server 8000 &

    LAST_COMMIT=$NEW_COMMIT
    echo "✅ Deployment successful at $(date)"
  else
    echo "⏳ No new changes... waiting..."
  fi

  sleep 10
done
