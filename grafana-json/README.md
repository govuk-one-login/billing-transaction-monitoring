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
