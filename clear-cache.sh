#!/bin/bash

# Stop any running Next.js processes
pkill -f 'node.*next' || true

# Wait a moment for processes to terminate
sleep 1

# Try to remove .next directory
rm -rf .next

# If that fails, try to remove files individually
if [ $? -ne 0 ]; then
  echo "Could not remove .next directory, trying to remove files individually..."
  find .next -type f -not -path '*/node_modules/*' -delete || true
fi

echo "Cache cleared. Restarting dev server..."

# Start the dev server
npm run dev
