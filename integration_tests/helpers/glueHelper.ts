import {
    StartCrawlerCommand,StartCrawlerCommandOutput} from "@aws-sdk/client-glue";

  import { glueClient } from "../clients/glueClient";
  import {resourcePrefix} from "./envHelper";
  
  const prefix = resourcePrefix();
  
  async function startCrawler(){
    const params = {
      Name:"transactions-crawler",
    };
    const response:StartCrawlerCommandOutput = await glueClient.send(
      new StartCrawlerCommand(params)
    );
    if(response.$metadata.httpStatusCode==200)
     return true
  }

  export {startCrawler}