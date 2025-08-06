#!/bin/bash

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Change to the project root directory
cd "$SCRIPT_DIR/.."

# Run the Node.js export script
node scripts/exportLogs.js

# Check if the export was successful
if [ $? -eq 0 ]; then
  echo "Log export completed successfully"
  exit 0
else
  echo "Log export failed"
  exit 1
fi
