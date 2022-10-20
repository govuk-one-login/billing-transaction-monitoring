
import { BatchGetNamedQueryCommand,BatchGetNamedQueryCommandOutput,ListDataCatalogsCommand,GetDatabaseCommand,ListDatabasesCommand } from "@aws-sdk/client-athena";
  
import { athenaClient } from "../clients/athenaClient";


  async function listDataCatalogs() {
   const params ={}
   const response = await athenaClient.send(new ListDataCatalogsCommand(params));
  return response
  }


  async function listDatabases() {
    const params ={
        CatalogName: "btm-transactions"

    }
    const response = await athenaClient.send(new ListDatabasesCommand(params));
   return response
   }

  async function getDatabaseName() {
    const params ={
        CatalogName: "",
        DatabaseName: ""
    }
    const response = await athenaClient.send(new GetDatabaseCommand(params));
   return response
   }
 