#!/bin/bash

if [[ -z "$2" ]]; then
  echo "Please provide the YYYY and MM."
  exit 1
fi

echo This script will back up a month\'s worth of single-event files in production, then combine these files
echo into multi-event files that are interpreted equivelently by the Athena layer that reads them.  The overall
echo result is the same event data set, but with much fewer files \(which provides significant speedup on most
echo operations\).
echo
echo Any events which arrive for the month and year that this script is bucketing can be lost, so care should
echo be taken not to run this script against a year and month that are too close to the present, or for which
echo there might otherwise be event data being generated.
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
echo "About to delete files in s3://di-btm-production-storage/btm_event_data/$1/$2"
read -p 'Press Enter to proceed...' var
aws s3 rm --recursive s3://di-btm-production-storage/btm_event_data/$1/$2

echo
echo "About to run:"
echo aws s3 sync batched-events/$1/$2 "s3://di-btm-production-storage/btm_event_data/$1/$2"
read -p 'Press Enter to proceed...' var
aws s3 sync batched-events/$1/$2 "s3://di-btm-production-storage/btm_event_data/$1/$2"
