# Grafana JSON folder

As the deployment of Grafana dashboards is not easily integrated into our CI pipeline,
this folder contains Grafana dashboard config in JSON, copied directly from the `Settings` |
`JSON Model` section of the actual Grafana dashboards.  Dashboards can then be deployed
by hand just by copying the JSON from here into Grafana in the desired environment(s).

Note that Grafana doesn't like it when you copy in JSON that contains a "uid" field at
the top level -- it wants to generate that itself, and will complain if there's one
already there, so remove this field when saving JSON here.
