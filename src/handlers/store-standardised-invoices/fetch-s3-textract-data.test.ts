import { fetchS3 } from "../../shared/utils";
import { fetchS3TextractData } from "./fetch-s3-textract-data";

jest.mock("../../shared/utils");
const mockedFetchS3 = fetchS3 as jest.Mock;

describe("S3 Textract data fetcher", () => {
  let mockedS3JsonValue: any;
  let givenBucket: string;
  let givenKey: string;

  beforeEach(() => {
    jest.resetAllMocks();

    mockedS3JsonValue = [
      {
        LineItemGroups: [
          {
            LineItems: [
              {
                LineItemExpenseFields: [
                  {
                    Type: {
                      Text: "mocked line item field type",
                      Confidence: 123,
                    },
                    ValueDetection: {
                      Text: "mocked field value",
                      Confidence: 345,
                    },
                  },
                ],
              },
            ],
          },
        ],
        SummaryFields: [
          {
            Type: {
              Text: "mocked summary field type",
              Confidence: 567,
            },
            ValueDetection: {
              Text: "mocked summary field value",
              Confidence: 789,
            },
          },
        ],
      },
    ];

    mockedFetchS3.mockImplementation(() => JSON.stringify(mockedS3JsonValue));

    givenBucket = "given bucket";
    givenKey = "given key";
  });

  test("S3 Textract data fetcher with fetch error", async () => {
    const mockedErrorText = "mocked error";
    const mockedError = new Error(mockedErrorText);
    mockedFetchS3.mockRejectedValue(mockedError);

    await expect(
      fetchS3TextractData(givenBucket, givenKey)
    ).rejects.toThrowError(mockedErrorText);
  });

  test("S3 Textract data fetcher with undefined fetched item", async () => {
    mockedFetchS3.mockResolvedValue(undefined);

    await expect(
      fetchS3TextractData(givenBucket, givenKey)
    ).rejects.toThrowError("No Textract data");
  });

  test("S3 Textract data fetcher with invalid JSON in fetched file", async () => {
    mockedFetchS3.mockResolvedValue("{");

    await expect(
      fetchS3TextractData(givenBucket, givenKey)
    ).rejects.toThrowError("JSON");
  });

  test("S3 Textract data fetcher with fetched JSON not array", async () => {
    mockedS3JsonValue = 1234;

    await expect(
      fetchS3TextractData(givenBucket, givenKey)
    ).rejects.toThrowError("array");
  });

  test("S3 Textract data fetcher with fetched empty JSON array", async () => {
    mockedS3JsonValue = [];
    const result = await fetchS3TextractData(givenBucket, givenKey);
    expect(result).toEqual(mockedS3JsonValue);
  });

  test("S3 Textract data fetcher with fetched JSON array of non-objects", async () => {
    mockedS3JsonValue = [1234];

    await expect(
      fetchS3TextractData(givenBucket, givenKey)
    ).rejects.toThrowError("objects");
  });

  test("S3 Textract data fetcher with fetched JSON array of empty objects", async () => {
    mockedS3JsonValue = [{}, {}];
    const result = await fetchS3TextractData(givenBucket, givenKey);
    expect(result).toEqual(mockedS3JsonValue);
  });

  test("S3 Textract data fetcher with fetched line item groups undefined", async () => {
    mockedS3JsonValue[0].LineItemGroups = undefined;
    const result = await fetchS3TextractData(givenBucket, givenKey);
    expect(result).toEqual(mockedS3JsonValue);
  });

  test("S3 Textract data fetcher with fetched line item groups not array", async () => {
    mockedS3JsonValue[0].LineItemGroups = 1234;

    await expect(
      fetchS3TextractData(givenBucket, givenKey)
    ).rejects.toThrowError("array");
  });

  test("S3 Textract data fetcher with fetched line items undefined", async () => {
    mockedS3JsonValue[0].LineItemGroups[0].LineItems = undefined;
    const result = await fetchS3TextractData(givenBucket, givenKey);
    expect(result).toEqual(mockedS3JsonValue);
  });

  test("S3 Textract data fetcher with fetched line items defined but not array", async () => {
    mockedS3JsonValue[0].LineItemGroups[0].LineItems = 1234;

    await expect(
      fetchS3TextractData(givenBucket, givenKey)
    ).rejects.toThrowError("line item");
  });

  test("S3 Textract data fetcher with fetched line item with fields undefined", async () => {
    mockedS3JsonValue[0].LineItemGroups[0].LineItems[0].LineItemExpenseFields =
      undefined;

    const result = await fetchS3TextractData(givenBucket, givenKey);

    expect(result).toEqual(mockedS3JsonValue);
  });

  test("S3 Textract data fetcher with fetched line item with fields defined but not array", async () => {
    mockedS3JsonValue[0].LineItemGroups[0].LineItems[0].LineItemExpenseFields = 1234;

    await expect(
      fetchS3TextractData(givenBucket, givenKey)
    ).rejects.toThrowError("line item");
  });

  test("S3 Textract data fetcher with fetched line item field not object", async () => {
    mockedS3JsonValue[0].LineItemGroups[0].LineItems[0].LineItemExpenseFields[0] = 1234;

    await expect(
      fetchS3TextractData(givenBucket, givenKey)
    ).rejects.toThrowError("line item");
  });

  test("S3 Textract data fetcher with fetched line item field empty object", async () => {
    mockedS3JsonValue[0].LineItemGroups[0].LineItems[0].LineItemExpenseFields[0] =
      {};

    const result = await fetchS3TextractData(givenBucket, givenKey);

    expect(result).toEqual(mockedS3JsonValue);
  });

  test("S3 Textract data fetcher with fetched line item field type defined but not object", async () => {
    mockedS3JsonValue[0].LineItemGroups[0].LineItems[0].LineItemExpenseFields[0].Type = 1234;

    await expect(
      fetchS3TextractData(givenBucket, givenKey)
    ).rejects.toThrowError("line item");
  });

  test("S3 Textract data fetcher with fetched line item field type empty object", async () => {
    mockedS3JsonValue[0].LineItemGroups[0].LineItems[0].LineItemExpenseFields[0].Type =
      {};

    const result = await fetchS3TextractData(givenBucket, givenKey);

    expect(result).toEqual(mockedS3JsonValue);
  });

  test("S3 Textract data fetcher with fetched line item field type text defined but not string", async () => {
    mockedS3JsonValue[0].LineItemGroups[0].LineItems[0].LineItemExpenseFields[0].Type.Text = 1234;

    await expect(
      fetchS3TextractData(givenBucket, givenKey)
    ).rejects.toThrowError("line item");
  });

  test("S3 Textract data fetcher with fetched line item field type confidence defined but not number", async () => {
    mockedS3JsonValue[0].LineItemGroups[0].LineItems[0].LineItemExpenseFields[0].Type.Confidence =
      true;

    await expect(
      fetchS3TextractData(givenBucket, givenKey)
    ).rejects.toThrowError("line item");
  });

  test("S3 Textract data fetcher with fetched line item field value detection defined but not object", async () => {
    mockedS3JsonValue[0].LineItemGroups[0].LineItems[0].LineItemExpenseFields[0].ValueDetection = 1234;

    await expect(
      fetchS3TextractData(givenBucket, givenKey)
    ).rejects.toThrowError("line item");
  });

  test("S3 Textract data fetcher with fetched line item field value detection empty object", async () => {
    mockedS3JsonValue[0].LineItemGroups[0].LineItems[0].LineItemExpenseFields[0].ValueDetection =
      {};

    const result = await fetchS3TextractData(givenBucket, givenKey);

    expect(result).toEqual(mockedS3JsonValue);
  });

  test("S3 Textract data fetcher with fetched line item field value detection text defined but not string", async () => {
    mockedS3JsonValue[0].LineItemGroups[0].LineItems[0].LineItemExpenseFields[0].ValueDetection.Text = 1234;

    await expect(
      fetchS3TextractData(givenBucket, givenKey)
    ).rejects.toThrowError("line item");
  });

  test("S3 Textract data fetcher with fetched line item field value detection confidence defined but not number", async () => {
    mockedS3JsonValue[0].LineItemGroups[0].LineItems[0].LineItemExpenseFields[0].ValueDetection.Confidence =
      true;

    await expect(
      fetchS3TextractData(givenBucket, givenKey)
    ).rejects.toThrowError("line item");
  });

  test("S3 Textract data fetcher with fetched summary undefined", async () => {
    mockedS3JsonValue[0].SummaryFields = undefined;
    const result = await fetchS3TextractData(givenBucket, givenKey);
    expect(result).toEqual(mockedS3JsonValue);
  });

  test("S3 Textract data fetcher with fetched summary not array", async () => {
    mockedS3JsonValue[0].SummaryFields = 1234;

    await expect(
      fetchS3TextractData(givenBucket, givenKey)
    ).rejects.toThrowError("summary");
  });

  test("S3 Textract data fetcher with fetched summary field empty object", async () => {
    mockedS3JsonValue[0].SummaryFields[0] = {};
    const result = await fetchS3TextractData(givenBucket, givenKey);
    expect(result).toEqual(mockedS3JsonValue);
  });

  test("S3 Textract data fetcher with fetched summary field type defined but not object", async () => {
    mockedS3JsonValue[0].SummaryFields[0].Type = 1234;

    await expect(
      fetchS3TextractData(givenBucket, givenKey)
    ).rejects.toThrowError("summary");
  });

  test("S3 Textract data fetcher with fetched summary field type empty object", async () => {
    mockedS3JsonValue[0].SummaryFields[0].Type = {};
    const result = await fetchS3TextractData(givenBucket, givenKey);
    expect(result).toEqual(mockedS3JsonValue);
  });

  test("S3 Textract data fetcher with fetched summary field type text defined but not string", async () => {
    mockedS3JsonValue[0].SummaryFields[0].Type.Text = 1234;

    await expect(
      fetchS3TextractData(givenBucket, givenKey)
    ).rejects.toThrowError("summary");
  });

  test("S3 Textract data fetcher with fetched summary field type confidence defined but not number", async () => {
    mockedS3JsonValue[0].SummaryFields[0].Type.Confidence = true;

    await expect(
      fetchS3TextractData(givenBucket, givenKey)
    ).rejects.toThrowError("summary");
  });

  test("S3 Textract data fetcher with fetched summary field value detection defined but not object", async () => {
    mockedS3JsonValue[0].SummaryFields[0].ValueDetection = 1234;

    await expect(
      fetchS3TextractData(givenBucket, givenKey)
    ).rejects.toThrowError("summary");
  });

  test("S3 Textract data fetcher with fetched summary field value detection empty object", async () => {
    mockedS3JsonValue[0].SummaryFields[0].ValueDetection = {};
    const result = await fetchS3TextractData(givenBucket, givenKey);
    expect(result).toEqual(mockedS3JsonValue);
  });

  test("S3 Textract data fetcher with fetched summary field value detection text defined but not string", async () => {
    mockedS3JsonValue[0].SummaryFields[0].ValueDetection.Text = 1234;

    await expect(
      fetchS3TextractData(givenBucket, givenKey)
    ).rejects.toThrowError("summary");
  });

  test("S3 Textract data fetcher with fetched summary field value detection confidence defined but not number", async () => {
    mockedS3JsonValue[0].SummaryFields[0].ValueDetection.Confidence = true;

    await expect(
      fetchS3TextractData(givenBucket, givenKey)
    ).rejects.toThrowError("summary");
  });
});
