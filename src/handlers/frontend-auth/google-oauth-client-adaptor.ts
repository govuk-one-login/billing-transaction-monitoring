import { OAuth2Client as GoogleOAuth2Client } from "google-auth-library";
import {
  Credentials,
  DecodedJWT,
  IOAuth2ClientAdaptor,
  LoginPayload,
} from "./oauth-client-adaptor";

export class GoogleOAuth2ClientAdaptor implements IOAuth2ClientAdaptor {
  private readonly _client: GoogleOAuth2Client;

  public readonly credentials: Partial<Credentials> = {};

  constructor(clientId: string, clientKey: string) {
    this._client = new GoogleOAuth2Client({
      clientId,
      clientSecret: clientKey,
    });
  }

  // swap the code for a token, set the creds based on the token
  public async setCredentialsFromCode(code: string): Promise<Credentials> {
    const { tokens } = await this._client.getToken(code);
    this._client.setCredentials(tokens);
    return this._client.credentials;
  }

  // verify the token, return the login payload
  public async verifyIdToken(
    idToken: string,
    audience?: string | string[],
    maxExpiry?: number
  ): Promise<LoginPayload> {
    const ticket = await this._client.verifyIdToken({
      idToken,
      audience,
      maxExpiry,
    });
    const payload = ticket.getPayload();
    if (!payload)
      throw new Error("No payload could be retrieved from login token");
    return payload;
  }

  public async getDecodedAccessToken(): Promise<DecodedJWT> {
    if (!this.credentials.access_token)
      throw new Error(
        "No access token available to be decoded. Ensure you've called setCredentialsFromCode with a valid code before decoding the access token"
      );

    return await this._client.getTokenInfo(this.credentials.access_token);
  }

  public generateAuthUrl(): string {
    return this._client.generateAuthUrl({
      hd: "digital.cabinet-office.gov.uk",
      // TODO env var here
      redirect_uri: "https://btm.dev.accounts.gov.uk",
      scope: "https://www.googleapis.com/auth/userinfo.email",
      prompt: "select_account",
      // TODO state
    });
  }
}
