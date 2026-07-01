import { ContactField } from '../RDO/contact-webhook.rdo';

export type ContactWebhook = {
    id: number;
    name: string;
    custom_fields: ContactField[];
};
