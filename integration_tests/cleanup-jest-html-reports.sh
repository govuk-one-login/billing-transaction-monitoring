#!/bin/bash
if [[ -z "$1" ]]; then
  echo "Please provide the number of items to keep."
  exit 1
fi
num_of_items_to_keep=$1

echo Keeping at max $num_of_items_to_keep test-report items

ls -1 test-report-* | sort -r |
  tail -n +$((num_of_items_to_keep+1)) |
  xargs rm -rfv

echo Remaining test-report items:
ls -dt1 test-report-*