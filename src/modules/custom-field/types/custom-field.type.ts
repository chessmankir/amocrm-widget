export type AmoCustomField = {
    id: number;
    name: string;
    type: string;
    enums?: AmoCustomFieldEnumValue[];
};

export type CreateCustomFieldValue = {
    field_id: number;
    values: {
        value: string | number;
    }[];
};

export type AmoCreateCustomField = {
    name: string;
    type: string;
    enums?: AmoCustomFieldEnumValue[];
};

type AmoCustomFieldEnumValue = {
    id?: number;
    value: string;
};
