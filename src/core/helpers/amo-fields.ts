import { ContactField, ContactFieldValue } from '../../modules/contact/RDO/contact-webhook.rdo';

export function getFieldValueById(fields: ContactField[] | null | undefined, fieldId: number): string | null {
    const field = fields?.find((field) => Number(field.field_id) === Number(fieldId));
    const value = field?.values?.[0];
    return normalizeFieldValue(value);
}

export function normalizeFieldValue(value: ContactFieldValue | undefined): string | null {
    if (typeof value === 'string') {
        return value;
    }

    if (value && typeof value === 'object') {
        return value.value;
    }

    return null;
}
