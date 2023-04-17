#!/bin/bash
num_of_dir_to_keep=$1

echo Keeping at max $num_of_dir_to_keep test-report directories

ls -dt1 test-report*/ |
  tail -n +$((num_of_dir_to_keep+1)) |
  xargs rm -rfv

echo Remaining test-report directories:
ls -dt1 test-report*/
