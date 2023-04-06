#!/bin/bash
cd ./reports/jest-html-report
# List all directories and sort by modification time in descending order
dirs=( $(ls -d -t */ | tail -n +2) )
# Remove all directories except for the last 5
for dir in "${dirs[@]}"; do
  rm -rf "$dir"
done

# List remaining directories
ls -d * /