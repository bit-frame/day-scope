#!/bin/bash

REMOTE_BRANCH="main/main"
LOCAL_BRANCH="main"

handle_error() {
  echo "Error: $1"
  exit 1
}

echo "Checking for updates..."
git fetch main || handle_error "Failed to fetch updates from the remote repository."
LOCAL_HASH=$(git rev-parse HEAD)
REMOTE_HASH=$(git rev-parse $REMOTE_BRANCH)

if [ "$LOCAL_HASH" = "$REMOTE_HASH" ]; then
  echo "Your repository is up-to-date!"
  exit 0
else
  echo "Updates are available."
fi

read -p "Do you want to update? (y/n): " confirm
if [ "$confirm" != "y" ]; then
  echo "Update canceled."
  exit 0
fi

echo "Fetching and rebasing..."
git fetch main || handle_error "Failed to fetch updates."
git rebase $REMOTE_BRANCH || handle_error "Failed to rebase changes."

echo "Update completed successfully!"