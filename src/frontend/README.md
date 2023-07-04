# Running the front end locally

You'll need to create a .env file at the top level of the project containing something like the
following, to tell the front end app where to find the config:

```
STORAGE_BUCKET="di-btm-<yourstack>-storage"
CONFIG_BUCKET="di-btm-cfg-<yourstack>"
```

Then you can just run `npm run dev` and go to http://localhost:3000 when the server has started.
