import { AmoCustomFieldType } from './custom-field.enum';
import { AmoEntity } from '../../../core/enums/amo-entity.enum';

export type RequiredCustomField = {
    name: string;
    type: AmoCustomFieldType;
    entity_type: AmoEntity;
    enums?: string[];
};
