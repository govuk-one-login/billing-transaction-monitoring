#!/bin/bash
# Set the number of directories to keep
 num_of_dir_to_keep=$1

 if [[ $GITHUB_WORKFLOW ]]; then
    cd $GITHUB_WORKSPACE
    cd jest-html-report
    ls
 else
   cd ./reports/jest-html-report
   ls
fi

# List all directories and sort by modification time in descending order
dirs=( $(ls -d -t */ | tail -n +$((num_of_dir_to_keep+1))) )
# Remove all jest-html-reports except for the last 1
for dir in "${dirs[@]}"; do
  rm -rf "$dir"
done

# List remaining directories
ls -d reports/jest-html-report/*