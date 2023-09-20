# Tools

## Augment DCS CSV

This script assists with a common task of adding required information to CSVs taken from the DCS database before they can be ingested.

The script can be run with

```
npm run augment-dcs-csv -- --input ../../example.csv --event_name EXAMPLE_EVENT_NAME --component_id example.component.id --vendor_id example_vendor_id
```

The result will be a file written adjacent to the given CSV with "-augmented" appended to the name, eg `... -i ../../example.csv ...` results in `../../example-augmented.csv` being created.

The script expects a CSV with no header row, GUIDS in the first column and formatted dates in the second column.

The script will add a header row, add a column of unix timestamps and add the given component ID, vendor Id, event name to each row. For example this

```
5d44e233-dc34-4d3c-8396-b9200f593da7,2023-07-01 06:47:21.614
3aeaa7ae-1408-46a9-b379-dc09775ef664,2023-07-01 07:11:04.704
1952faaa-01a7-4667-8001-8a0f78d4fc53,2023-07-01 07:19:26.725
```

would become this

```
event_id,timestamp_formatted,timestamp,event_name,component_id,vendor_id
90fb76cb-4652-4e23-8df1-e7374f4c7476,2023-07-01 00:02:04.493,1688166124493,EXAMPLE_EVENT_NAME,example.component.id,example_vendor_id
23f54c47-63e3-4588-9aae-397d95028ddd,2023-07-01 00:07:04.534,1688166424534,EXAMPLE_EVENT_NAME,example.component.id,example_vendor_id
416a7c70-9fea-43e3-a011-6c396ed37afe,2023-07-01 00:12:04.698,1688166724698,EXAMPLE_EVENT_NAME,example.component.id,example_vendor_id
```

The script can also be invoked with a help flag

`npm run augment-dcs-csv -- -h`

this will show descriptions for each argument and let you know what shorthands are available.
