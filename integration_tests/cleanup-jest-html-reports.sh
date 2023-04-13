#!/bin/bash
# Set the number of directories to keep
num_of_dir_to_keep=$1

# List all directories and sort by modification time in descending order
dirs=$(ls -d -t test-report*/ | tail -n +$((num_of_dir_to_keep+1)))

# Remove all jest-html-reports except for the last 5
for dir in "${dirs[@]}"; do
  rm -rf "$dir"
done

# List remaining directories
ls -d */
