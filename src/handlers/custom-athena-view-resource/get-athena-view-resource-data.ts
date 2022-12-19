import { CloudFormationCustomResourceEvent } from "aws-lambda";

export interface AthenaViewResourceData {
  database: string;
  name: string;
  query: string;
  workgroup: string;
}

export const getAthenaViewResourceData = (
  event: CloudFormationCustomResourceEvent
): AthenaViewResourceData => {
  if (!("View" in event.ResourceProperties))
    throw new Error("Property `View` not found");

  const view = event.ResourceProperties.View;

  if (typeof view !== "object")
    throw new Error("Property `View` not an object");

  for (const key of ["Database", "Name", "Query", "Workgroup"]) {
    if (!(key in view)) throw new Error(`\`View.${key}\` not found`);

    if (typeof view[key] !== "string")
      throw new Error(`\`View.${key}\` not a string`);
  }

  return {
    database: view.Database,
    name: view.Name,
    query: view.Query,
    workgroup: view.Workgroup,
  };
};
