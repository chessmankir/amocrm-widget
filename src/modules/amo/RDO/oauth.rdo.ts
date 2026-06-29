export type AmoTokenResponse = {
    token_type: string;
    expires_in: number;
    server_time: number;
    access_token: string;
    refresh_token: string;
};

export type AmoRefreshResponse = {
    id: number;
    subdomain: string;
    refresh_token: string;
    access_token: string;
};

export type TokenRequest =
    | {
          grant_type: 'authorization_code';
          code: string;
      }
    | {
          grant_type: 'refresh_token';
          refresh_token: string;
      };
