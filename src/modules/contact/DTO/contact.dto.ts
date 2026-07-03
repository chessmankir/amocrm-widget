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

export type ContactRdo = {
    id: number;
    name: string;
    custom_fields_values: ContactField[];
};

type ContactField = {
    field_id: number;
    field_name: string;
    values: ContactFieldValue[];
};

type ContactFieldValue = {
    value: string;
};
