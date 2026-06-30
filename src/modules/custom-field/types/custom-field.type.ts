export type AmoCustomField = {
    id: number;
    name: string;
    type: string;
    enums?: AmoCustomFieldEnumValue[];
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
