export interface Credentials {
  refresh_token?: string | null;
  expiry_date?: number | null;
  access_token?: string | null;
  id_token?: string | null;
  scope?: string;
}

export interface DecodedJWT {
  access_type?: string;
  aud: string;
  email?: string;
  email_verified?: boolean;
  expiry_date: number;
  scopes: string[];
  sub?: string;
  user_id?: string;
}

export interface LoginPayload {
  at_hash?: string;
  aud: string;
  email?: string;
  email_verified?: boolean;
  iss: string;
  name?: string;
  sub: string;
  exp: number;
  nonce?: string;
  locale?: string;
}

export interface IOAuth2ClientAdaptor {
  readonly credentials: Partial<Credentials>;

  setCredentialsFromCode: (code: string) => Promise<Credentials>;

  verifyIdToken: (
    idToken: string,
    audience?: string | string[],
    maxExpiry?: number
  ) => Promise<LoginPayload>;

  getDecodedAccessToken: () => Promise<DecodedJWT>;

  generateAuthUrl: () => string;
}
