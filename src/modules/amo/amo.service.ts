import { ConfigService } from '@nestjs/config';
import { Env } from '../../core/enums/env.enum';
import { AmoRefreshResponse, AmoTokenResponse, TokenRequest } from './RDO/oauth.rdo';
import axios from 'axios';
import { Injectable } from '@nestjs/common';
import { WebhookListRDO } from '../webhooks/RDO/webhook.rdo';
import { AmoEntity } from '../../core/enums/amo-entity.enum';
import { AmoCustomFieldRDO } from '../custom-field/RDO/custom-field.rdo';
import { AmoCreateCustomField } from '../custom-field/types/custom-field.type';
import { AmoCustomFieldType } from '../custom-field/types/custom-field.enum';
import { createCustomFieldValue } from '../../core/helpers/create-custom-field-value';
import { Lead } from '../lead/types/lead.types';
import { ContactWebhook } from '../contact/types/contact.type';
import { AmoUpdateLead, CreateTaskPayload } from '../task/types/task.type';
import { TaskAmo, TaskFilterRDO } from '../task/RDO/task.rdo';

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
        type: AmoCustomFieldType,
        enums?: string[]
    ): Promise<AmoCustomFieldRDO> {
        const url = `https://${subdomain}.amocrm.ru/api/v4/${entityType}/custom_fields`;

        const fieldData: AmoCreateCustomField = {
            name,
            type,
        };

        if (enums?.length) {
            fieldData.enums = enums.map((option) => ({ value: option }));
        }
        const { data } = await axios.post<AmoCustomFieldRDO>(url, [fieldData], {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        return data;
    }

    public async updateCustomField(
        subdomain: string,
        accessToken: string,
        entityType: AmoEntity,
        fieldId: number,
        fieldData: Partial<AmoCreateCustomField>
    ): Promise<AmoCustomFieldRDO> {
        const url = `https://${subdomain}.amocrm.ru/api/v4/${entityType}/custom_fields/${fieldId}`;

        const { data } = await axios.patch<AmoCustomFieldRDO>(url, fieldData, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        return data;
    }

    public async getWebhooks(subdomain: string, accessToken: string): Promise<WebhookListRDO> {
        const url = `https://${subdomain}.amocrm.ru/api/v4/webhooks`;
        const { data } = await axios.get<WebhookListRDO>(url, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
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
        return data;
    }

    public async updateContactCustomField(
        subdomain: string,
        accessToken: string,
        contactId: number,
        fieldId: number,
        value: number
    ): Promise<void> {
        const url = `https://${subdomain}.amocrm.ru/api/v4/contacts`;
        try {
            await axios.patch(
                url,
                [
                    {
                        id: contactId,
                        custom_fields_values: [createCustomFieldValue(fieldId, value)],
                    },
                ],
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.dir(error.response?.data, { depth: null });

                console.log(JSON.stringify(error.response?.data, null, 2));
            }
        }
    }

    public async getLeadWithContacts(subdomain: string, accessToken: string, leadId: number): Promise<Lead> {
        const url = `https://${subdomain}.amocrm.ru/api/v4/leads/${leadId}?with=contacts`;
        const { data } = await axios.get<Lead>(url, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        return data;
    }

    public async updateLeadData(subdomain: string, accessToken: string, leadId: number, data: Partial<Lead>): Promise<void> {
        const url = `https://${subdomain}.amocrm.ru/api/v4/leads/${leadId}?with=contacts`;
        await axios.patch(url, data, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
    }

    public async getContactById(subdomain: string, accessToken: string, contactId: number): Promise<ContactWebhook> {
        const url = `https://${subdomain}.amocrm.ru/api/v4/contacts/${contactId}`;
        const { data } = await axios.get<ContactWebhook>(url, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        return data;
    }

    public async createTask(subdomain: string, accessToken: string, payload: CreateTaskPayload[]): Promise<void> {
        console.log('createTask');
        const url = `https://${subdomain}.amocrm.ru/api/v4/tasks`;

        try {
            const { data } = await axios.post(url, payload, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
        } catch (error) {
            console.log(JSON.stringify(error.response?.data, null, 2));
        }
    }

    public async getTaskId(subdomain: string, accessToken: string, taskId: number): Promise<TaskAmo> {
        const url = `https://${subdomain}.amocrm.ru/api/v4/tasks/${taskId}`;

        const { data } = await axios.get<TaskAmo>(url, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        return data;
    }

    public async getTaskByLeadId(subdomain: string, accessToken: string, leadId: number): Promise<TaskFilterRDO> {
        const url = `https://${subdomain}.amocrm.ru/api/v4/tasks`;

        const { data } = await axios.get<TaskFilterRDO>(url, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            params: {
                'filter[entity_id]': leadId,
                'filter[entity_type]': 'leads',
            },
        });

        return data;
    }

    public async createLeadNote(subdomain: string, accessToken: string, leadId: number, text: string): Promise<void> {
        const url = `https://${subdomain}.amocrm.ru/api/v4/leads/${leadId}/notes`;

        await axios.post(
            url,
            [
                {
                    note_type: 'common',
                    params: { text },
                },
            ],
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );
    }

    public async updateTask(subdomain: string, accessToken: string, taskId: number, payload: Partial<CreateTaskPayload>): Promise<void> {
        const url = `https://${subdomain}.amocrm.ru/api/v4/tasks/${taskId}`;

        await axios.patch(url, payload, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
    }

    public async updateLead(subdomain: string, accessToken: string, leadId: number, payload: AmoUpdateLead): Promise<void> {
        const url = `https://${subdomain}.amocrm.ru/api/v4/leads/${leadId}`;

        await axios.patch(url, payload, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });
    }

    //проверка типов (для этапа разработки)
    public async getTaskTypes(subdomain: string, accessToken: string): Promise<unknown> {
        const url = `https://${subdomain}.amocrm.ru/api/v4/tasks/types`;

        const { data } = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        return data;
    }
}
