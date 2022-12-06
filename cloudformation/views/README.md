Creating an Athena View in CloudFormation requires a bit of JSON that gets Base-64 encrypted
and put into the table definition (see https://stackoverflow.com/questions/56289272/create-aws-athena-view-programmatically#56347331).
This folder is an archive of those JSON definitions, so they aren't lost and can be modified as necessary.

To update a view, modify the .json file here and convert its contents to Base-64.  Then paste the encoded
string into the ViewOriginalText field of the appropriate view (which is actually a AWS::Glue::Table with
`TableType: VIRTUAL_VIEW`; see TransactionsView in calculation-athena.yaml for an example).
