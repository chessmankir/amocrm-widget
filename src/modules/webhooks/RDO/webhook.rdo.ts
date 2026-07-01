import { Webhook } from '../types/webhook.type';

export type WebhookListRDO = {
    _embedded: {
        webhooks: Webhook[];
    };
};
