import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";

const getClient = (): S3Client =>
  new S3Client({
    region: "eu-west-2",
    endpoint: process.env.LOCAL_ENDPOINT,
  });

export class S3ConfigFileClient {
  private readonly _client: S3Client;

  constructor() {
    this._client = getClient();
  }

  public readonly getConfigFile = async (path: string): Promise<string> => {
    const response = await this._client.send(
      new GetObjectCommand({
        Bucket: process.env.CONFIG_BUCKET,
        Key: path,
      })
    );
    if (response.Body === undefined) {
      throw new Error(`Config file could not be found at ${path}`);
    }
    return await response.Body.transformToString();
  };
}
