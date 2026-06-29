import { AmoCustomField } from '../types/custom-field.type';

export type AmoCustomFieldRDO = {
    _embedded?: {
        custom_fields?: AmoCustomField[];
    };
};
