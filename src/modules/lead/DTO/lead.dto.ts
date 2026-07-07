import { Lead } from '../types/lead.types';

export type LeadUpdateWebhookDTO = {
    account: {
        subdomain: string;
    };
    leads?: {
        update?: Lead[];
    };
};

export type LeadAddWebhookDTO = {
    account: {
        subdomain: string;
    };
    leads?: {
        add?: Lead[];
    };
};
