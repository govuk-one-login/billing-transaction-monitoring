#!/bin/bash
cd ../reports
# List all directories and sort by modification time in descending order
dirs=( $(ls -d -t */ | tail -n +6) )
# Remove all directories except for the last 5
for dir in "${dirs[@]}"; do
  rm -rf "$dir"
done

# List remaining directories
ls -d * /