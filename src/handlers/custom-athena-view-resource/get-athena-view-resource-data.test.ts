import { CloudFormationCustomResourceEvent } from "aws-lambda";
import { getAthenaViewResourceData } from "./get-athena-view-resource-data";

describe("Athena view resource data getter", () => {
  let validEvent: CloudFormationCustomResourceEvent;

  beforeEach(() => {
    validEvent = {
      RequestType: "given request type",
      ResourceProperties: {
        View: {
          Database: "given view database",
          Name: "given view name",
          Query: "given view query",
          Workgroup: "given view workgroup",
        },
      },
    } as any;
  });

  test("Athena view resource data getter with no `View`", async () => {
    const givenEvent: CloudFormationCustomResourceEvent = {
      ...validEvent,
      ResourceProperties: {},
    } as any;

    let resultError;
    try {
      getAthenaViewResourceData(givenEvent);
    } catch (error) {
      resultError = error;
    }

    expect(resultError).toBeInstanceOf(Error);
  });

  test("Athena view resource data getter with `View` not object", async () => {
    const givenEvent: CloudFormationCustomResourceEvent = {
      ...validEvent,
      ResourceProperties: {
        View: "some string",
      },
    } as any;

    let resultError;
    try {
      getAthenaViewResourceData(givenEvent);
    } catch (error) {
      resultError = error;
    }

    expect(resultError).toBeInstanceOf(Error);
  });

  test("Athena view resource data getter with no `View.Database`", async () => {
    const givenEvent = validEvent;
    delete givenEvent.ResourceProperties.View.Database;

    let resultError;
    try {
      getAthenaViewResourceData(givenEvent);
    } catch (error) {
      resultError = error;
    }

    expect(resultError).toBeInstanceOf(Error);
  });

  test("Athena view resource data getter with `View.Database` not string", async () => {
    const givenEvent: CloudFormationCustomResourceEvent = {
      ...validEvent,
      ResourceProperties: {
        ...validEvent.ResourceProperties,
        View: {
          ...validEvent.ResourceProperties.View,
          Database: 1234,
        },
      },
    };

    let resultError;
    try {
      getAthenaViewResourceData(givenEvent);
    } catch (error) {
      resultError = error;
    }

    expect(resultError).toBeInstanceOf(Error);
  });

  test("Athena view resource data getter with no `View.Name`", async () => {
    const givenEvent: CloudFormationCustomResourceEvent = validEvent;
    delete givenEvent.ResourceProperties.View.Name;

    let resultError;
    try {
      getAthenaViewResourceData(givenEvent);
    } catch (error) {
      resultError = error;
    }

    expect(resultError).toBeInstanceOf(Error);
  });

  test("Athena view resource data getter with `View.Name` not string", async () => {
    const givenEvent: CloudFormationCustomResourceEvent = {
      ...validEvent,
      ResourceProperties: {
        ...validEvent.ResourceProperties,
        View: {
          ...validEvent.ResourceProperties.View,
          Name: 1234,
        },
      },
    };

    let resultError;
    try {
      getAthenaViewResourceData(givenEvent);
    } catch (error) {
      resultError = error;
    }

    expect(resultError).toBeInstanceOf(Error);
  });

  test("Athena view resource data getter with no `View.Query`", async () => {
    const givenEvent: CloudFormationCustomResourceEvent = validEvent;
    delete givenEvent.ResourceProperties.View.Query;

    let resultError;
    try {
      getAthenaViewResourceData(givenEvent);
    } catch (error) {
      resultError = error;
    }

    expect(resultError).toBeInstanceOf(Error);
  });

  test("Athena view resource data getter with `View.Query` not string", async () => {
    const givenEvent: CloudFormationCustomResourceEvent = {
      ...validEvent,
      ResourceProperties: {
        ...validEvent.ResourceProperties,
        View: {
          ...validEvent.ResourceProperties.View,
          Query: 1234,
        },
      },
    };

    let resultError;
    try {
      getAthenaViewResourceData(givenEvent);
    } catch (error) {
      resultError = error;
    }

    expect(resultError).toBeInstanceOf(Error);
  });

  test("Athena view resource data getter with no `View.Workgroup`", async () => {
    const givenEvent: CloudFormationCustomResourceEvent = validEvent;
    delete givenEvent.ResourceProperties.View.Workgroup;

    let resultError;
    try {
      getAthenaViewResourceData(givenEvent);
    } catch (error) {
      resultError = error;
    }

    expect(resultError).toBeInstanceOf(Error);
  });

  test("Athena view resource data getter with `View.Workgroup` not string", async () => {
    const givenEvent: CloudFormationCustomResourceEvent = {
      ...validEvent,
      ResourceProperties: {
        ...validEvent.ResourceProperties,
        View: {
          ...validEvent.ResourceProperties.View,
          Workgroup: 1234,
        },
      },
    };

    let resultError;
    try {
      getAthenaViewResourceData(givenEvent);
    } catch (error) {
      resultError = error;
    }

    expect(resultError).toBeInstanceOf(Error);
  });

  test("Athena view resource data getter with valid event", () => {
    const givenEvent = validEvent;

    const result = getAthenaViewResourceData(givenEvent);

    expect(result).toEqual({
      database: givenEvent.ResourceProperties.View.Database,
      name: givenEvent.ResourceProperties.View.Name,
      query: givenEvent.ResourceProperties.View.Query,
      workgroup: givenEvent.ResourceProperties.View.Workgroup,
    });
  });
});
