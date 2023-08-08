#!/bin/bash

if [[ -z "$2" ]]; then
  echo "Please provide the YYYY and MM."
  exit 1
fi


echo
echo "About to run:"
echo aws s3 sync "s3://di-btm-production-storage/btm_event_data/$1/$2/" "s3://di-btm-production-storage/btm_event_data_copy/btm_event_data/$1/$2/"
read -p 'Press Enter to proceed...' var
aws s3 sync "s3://di-btm-production-storage/btm_event_data/$1/$2/" "s3://di-btm-production-storage/btm_event_data_copy/btm_event_data/$1/$2/"

mkdir -p downloaded-events
echo
echo "About to run:"
echo "rm -rf downloaded-events/*"
read -p 'Press Enter to proceed...' var
rm -rf downloaded-events/*

echo
echo "About to run:"
echo aws s3 sync "s3://di-btm-production-storage/btm_event_data/$1/$2/" downloaded-events/$1/$2
read -p 'Press Enter to proceed...' var
aws s3 sync "s3://di-btm-production-storage/btm_event_data/$1/$2/" downloaded-events/$1/$2

mkdir -p batched-events
echo
echo "About to run:"
echo "rm -rf batched-events/*"
read -p 'Press Enter to proceed...' var
rm -rf batched-events/*

echo
echo "About to run:"
echo npm run batch-events
read -p 'Press Enter to proceed...' var
npm run batch-events

echo
echo "===> MANUAL STEP!"
echo "Manually delete files on s3://di-btm-production-storage/btm_event_data/$1/$2"
read -p 'Press Enter when done...' var

echo
echo "About to run:"
echo aws s3 sync batched-events/$1/$2 "s3://di-btm-production-storage/btm_event_data/$1/$2"
read -p 'Press Enter to proceed...' var
aws s3 sync batched-events/$1/$2 "s3://di-btm-production-storage/btm_event_data/$1/$2"
