import { ClientId, EventName, prettyClientNameMap, prettyEventNameMap } from "../payloads/snsEventPayload";
import { startQueryExecutionCommand, queryObject } from "./athenaHelper";
import { TableNames } from "./commonHelpers";
import { resourcePrefix } from "./envHelper";

const prefix = resourcePrefix();
const databaseName = `${prefix}-calculations`;


export const queryResponseFilterByVendorServiceNameYear = async({
    clientId,
    eventName, tableName,year
  }: {
    clientId: ClientId;
    eventName: EventName;
    tableName:TableNames;
    year:number
  }): Promise<[]> => {
    
    const prettyClientName = prettyClientNameMap[clientId];
    const prettyEventName = prettyEventNameMap[eventName];
   
  
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    const curatedQueryString = `SELECT * FROM "${tableName}" WHERE vendor_name='${prettyClientName}' AND service_name='${prettyEventName}' AND year='${year}'`;
    const queryId = await startQueryExecutionCommand(
      databaseName,
      curatedQueryString
    );
    const results = await queryObject(queryId);
    return results;
  }
  