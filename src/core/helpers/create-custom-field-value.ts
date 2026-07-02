import { CreateCustomFieldValue } from '../../modules/custom-field/types/custom-field.type';

export function createCustomFieldValue(fieldId: number, value: string | number): CreateCustomFieldValue {
    return {
        field_id: fieldId,
        values: [
            {
                value,
            },
        ],
    };
}
