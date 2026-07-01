import { Webhook } from '../../../core/enums/webhook.enum';

export const REQUIRED_WEBHOOKS = [
    {
        event: Webhook.ContactAdded,
        url: '/webhooks/contact/add',
    },
    {
        event: Webhook.ContactUpdated,
        url: '/webhooks/contact/update',
    },
    {
        event: Webhook.LeadAdded,
        url: '/webhooks/lead/add',
    },
    {
        event: Webhook.LeadUpdated,
        url: '/webhooks/lead/update',
    },
];
