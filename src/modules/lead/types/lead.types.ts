export type Lead = {
    id: string;
    name: string;
    price: string;
    responsible_user_id: string;
    custom_fields?: LeadField[];
    _embedded?: {
        contacts?: CLeadEmbeddedContact[];
    };
};

export type LeadField = {
    id: string;
    name: string;
    values?: LeadFieldValue[];
};

export type LeadFieldValue = {
    value: string;
    enum: string;
};

export type CLeadEmbeddedContact = {
    id: number;
    is_main: boolean;
};