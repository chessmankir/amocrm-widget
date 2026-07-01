import { ConfigService } from '@nestjs/config';
import { Env } from '../../core/enums/env.enum';
import { AmoRefreshResponse, AmoTokenResponse, TokenRequest } from './RDO/oauth.rdo';
import axios from 'axios';
import { Injectable } from '@nestjs/common';
import { WebhookListRDO } from '../webhooks/RDO/webhook.rdo';

@Injectable()
export class AmoService {
    constructor(private readonly configService: ConfigService) {}

    public async getTokens(code: string, subdomain: string): Promise<AmoTokenResponse> {
        return this.requestTokens<AmoTokenResponse>(subdomain, {
            grant_type: 'authorization_code',
            code,
        });
    }

    public async refreshTokens(subdomain: string, refreshToken: string): Promise<AmoRefreshResponse> {
        return this.requestTokens<AmoRefreshResponse>(subdomain, {
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
        });
    }

    private async requestTokens<T>(subdomain: string, tokenData: TokenRequest): Promise<T> {
        const url = `https://${subdomain}.amocrm.ru/oauth2/access_token`;
        const { data } = await axios.post<T>(url, {
            client_id: this.configService.getOrThrow<string>(Env.AmoClientId),
            client_secret: this.configService.getOrThrow<string>(Env.AmoClientSecret),
            redirect_uri: this.configService.getOrThrow<string>(Env.AmoRedirectUri),
            ...tokenData,
        });
        return data as T;
    }

    public async getWebhooks(subdomain: string, accessToken: string): Promise<WebhookListRDO> {
        const url = `https://${subdomain}.amocrm.ru/api/v4/webhooks`;
        const { data } = await axios.get<WebhookListRDO>(url, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        console.log(JSON.stringify(data, null, 2));
        return data;
    }

    public async createWebhook(subdomain: string, accessToken: string, destination: string, settings: string[]): Promise<any> {
        const url = `https://${subdomain}.amocrm.ru/api/v4/webhooks`;
        const { data } = await axios.post(
            url,
            {
                destination,
                settings,
            },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );
        console.log(data);
        return data;
    }
}
