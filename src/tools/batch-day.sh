#!/bin/bash

if [[ -z "$3" ]]; then
  echo "Please provide the YYYY, MM & DD"
  exit 1
fi

echo This script will back up a days\'s worth of single-event files in production, then combine these files
echo into multi-event files that are interpreted equivelently by the Athena layer that reads them.  The overall
echo result is the same event data set, but with much fewer files \(which provides significant speedup on most
echo operations\).
echo
echo Any events which arrive for the month and year that this script is bucketing can be lost, so care should
echo be taken not to run this script against a year and month that are too close to the present, or for which
echo there might otherwise be event data being generated.
echo
echo "About to run:"
echo aws s3 sync "s3://di-btm-production-storage/btm_event_data/$1/$2/$3" "s3://di-btm-production-storage/btm_event_data_copy/btm_event_data/$1/$2/$3"
read -p 'Press Enter to proceed...' var
aws s3 sync "s3://di-btm-production-storage/btm_event_data/$1/$2/$3" "s3://di-btm-production-storage/btm_event_data_copy/btm_event_data/$1/$2/$3"

mkdir -p downloaded-events
echo
echo "About to run:"
echo "rm -rf downloaded-events/*"
read -p 'Press Enter to proceed...' var
rm -rf downloaded-events/*

echo
echo "About to run:"
echo aws s3 sync "s3://di-btm-production-storage/btm_event_data/$1/$2/$3" downloaded-events/$1/$2/$3
read -p 'Press Enter to proceed...' var
aws s3 sync "s3://di-btm-production-storage/btm_event_data/$1/$2/$3" downloaded-events/$1/$2/$3

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
echo "Manually delete files on s3://di-btm-production-storage/btm_event_data/$1/$2/$3"
read -p 'Press Enter when done...' var

echo
echo "About to run:"
echo aws s3 sync batched-events/$1/$2/$3 "s3://di-btm-production-storage/btm_event_data/$1/$2/$3"
read -p 'Press Enter to proceed...' var
aws s3 sync batched-events/$1/$2/$3 "s3://di-btm-production-storage/btm_event_data/$1/$2/$3"
