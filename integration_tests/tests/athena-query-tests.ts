import { publishSNS } from "../helpers/snsHelper";
import { PublishResponse } from "@aws-sdk/client-sns";
import { startQueryExecutionCommand } from "../helpers/athenaHelper";

import {
  snsValidEventPayload
 
} from "../payloads/snsEventPayload";

let snsResponse: PublishResponse;

describe("\n Execute provided query in AWS athena\n",() => {
beforeAll(async () => {
//snsResponse = await publishSNS(snsValidEventPayload);
});
test.only("Query SQL generation and execution successful ", async () => {
  startQueryExecutionCommand()
  });
});
  