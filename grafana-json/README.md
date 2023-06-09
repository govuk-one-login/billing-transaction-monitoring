# Grafana JSON folder

As the deployment of Grafana dashboards is not easily integrated into our CI pipeline,
this folder contains Grafana dashboard config in JSON, copied directly from the `Settings` |
`JSON Model` section of the actual Grafana dashboards.

The best way to deploy changes to a dashboard is to copy the existing JSON for that dashboard
into a text editor that has a merge feature, merge the updated JSON into it, then copy it
back into the JSON Model text field in Grafana.  Be careful not to merge any of these fields:

* "id" or "iteration" at the top level (near the start)
* any references to "database" or "datasource"
* the "title" field at the top level (near the end)
* the "uid" and "version" fields at the top level (near the end)

# Taking production snapshots

As a temporary measure to get production working again, we have created a new table that
holds a data extract containing the data necessary to render all current data on the
production dashboard.  To populate this table, follow these steps:

1. Log in to the AWS portal, and switch to the di-btm-prod role.
2. Go to the Athena app and (if for some reason it's not already selected) select the `di-btm-production-calculations` database.
3. Run the command `SELECT * FROM "di-btm-production-calculations"."btm_billing_and_transactions_curated" limit 999;` from the query window.
4. Click the "[Download results]" button -- this will download the query results as a CSV with a random name.
5. Paste these results into a CSV to JSON converter like https://www.convertcsv.com/csv-to-json.htm.  This will give you a JSON array, e.g. "[{...},{...}...]" that spans multiple lines.
6. In your favourite editor, reformat this file into a text file that contains
   a. a JSON object on each line for each row in the results
   b. NO COMMAS on the end of the line
   c. No brackets at the beginning or end.
7. Rename the file to `full-extract.json`.
8. In the S3 app in the portal, upload this file to the `di-btm-production-storage` bucket, `btm_extract_data` folder.
9. Dashboard should now show the new data.
10. Delete the local file just to be safe.
