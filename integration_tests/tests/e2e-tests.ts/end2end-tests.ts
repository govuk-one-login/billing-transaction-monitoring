import { getS3Object } from "../../../src/handlers/int-test-support/helpers/s3Helper";
import csvtojson from "csvtojson";
import { configStackName } from "../../../src/handlers/int-test-support/helpers/envHelper";
import { invokeLambda } from "../../../src/handlers/int-test-support/helpers/lambdaHelper";
import path from "path";
import fs from "fs";

describe("\n generate events\n", () => {
  test("generate events", async () => {
    const configBucket = configStackName();
    console.log(configBucket);
    const servicesCsv = await getS3Object({
      bucket: configBucket,
      key: "vendor_services/vendor-services.csv",
    });
    const json = await csvtojson().fromString(servicesCsv ?? "");
    console.log(json[0].event_name);
    const file = "../../payloads/payload.json";
    const filename = path.join(__dirname, file);
    const fileData = fs.readFileSync(filename);
    /*   const payload = {
        component_id: "Test_COMP",
        event_id: generateRandomId(),
        timestamp: new Date("2023/01/01").getTime() / 1000,
        event_name: json[0].event_name,
        timestamp_formatted: "2023/01/01",
       } */

    const invoke = await invokeLambda(fileData);
    console.log(invoke.LogResult);
  });
});
