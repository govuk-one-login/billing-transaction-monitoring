import { getS3Object } from "../../../integration_tests/helpers/s3Helper";
import { configStackName } from "../../../integration_tests/helpers/envHelper";

let idpClientLookup: Map<string, string>;

async function getIdpClientLookup(): Promise<Map<string, string>> {
  console.log("1 idpClientLookup", idpClientLookup);
  if (idpClientLookup === undefined) {
    idpClientLookup = await readIdpClientLookup();
  }
  console.log("2 idpClientLookup", idpClientLookup);
  return idpClientLookup;
}

async function readIdpClientLookup(): Promise<Map<string, string>> {
  console.log("3 Getting idp-clients.csv");
  const idpClients = await getS3Object({
    bucket: configStackName(),
    key: "idp-clients/idp-clients.csv",
  });

  const mappedIdpClients = new Map<string, string>();

  const rows = idpClients?.split("\n");
  if (rows !== undefined) {
    rows.shift();
    for (const row of rows) {
      const arr = row.split(",");
      mappedIdpClients.set(arr[0], arr[1]);
    }
  }

  console.log("4 mapped idp clients", mappedIdpClients);
  return mappedIdpClients;
}

export async function convertClientId(idpEntityId: string): Promise<string> {
  return (await getIdpClientLookup()).get(idpEntityId) ?? "unknown";
}
