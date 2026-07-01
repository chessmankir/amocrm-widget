import { ContactWebhook } from '../types/contact.type';

export type BaseContactWebhook = {
    account: {
        subdomain: string;
        id: string;
        _links: {
            self: string;
        };
    };
};

export type ContactAddedWebhookDTO = BaseContactWebhook & {
    contacts: {
        add: ContactWebhook[];
    };
};

export type ContactUpdatedWebhookDTO = BaseContactWebhook & {
    contacts: {
        update: ContactWebhook[];
    };
};
