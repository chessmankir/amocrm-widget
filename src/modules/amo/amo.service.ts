import { ConfigService } from '@nestjs/config';
import { Env } from '../../core/enums/env.enum';
import { AmoRefreshResponse, AmoTokenResponse, TokenRequest } from './RDO/oauth.rdo';
import axios from 'axios';
import { Injectable } from '@nestjs/common';
import { AmoEntity } from '../../core/enums/amo-entity.enum';
import { AmoCustomFieldRDO } from '../custom-field/RDO/custom-field.rdo';

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
        return data;
    }

    public async getCustomFields(subdomain: string, accessToken: string, entityType: AmoEntity): Promise<AmoCustomFieldRDO> {
        const url = `https://${subdomain}.amocrm.ru/api/v4/${entityType}/custom_fields`;
        const { data } = await axios.get<AmoCustomFieldRDO>(url, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        return data;
    }

    public async createCustomField(
        subdomain: string,
        accessToken: string,
        entityType: AmoEntity,
        name: string,
        type: string
    ): Promise<AmoCustomFieldRDO> {
        const url = `https://${subdomain}.amocrm.ru/api/v4/${entityType}/custom_fields`;
        const { data } = await axios.post<AmoCustomFieldRDO>(
            url,
            [
                {
                    name,
                    type,
                },
            ],
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );
        return data;
    }
}
