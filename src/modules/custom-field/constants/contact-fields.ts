import { AmoCustomFieldType } from '../types/custom-field.enum';
import { RequiredCustomField } from '../types/required-custom-field.type';
import { AmoEntity } from '../../../core/enums/amo-entity.enum';
import { SERVICE_OPTIONS } from './service-options';

export const FIELD_NAME_SERVICE = 'Услуги';

export const REQUIRED_CUSTOM_FIELDS: RequiredCustomField[] = [
    {
        name: 'Дата рождения',
        type: AmoCustomFieldType.Date,
        entity_type: AmoEntity.Contacts,
    },
    {
        name: 'Возраст',
        type: AmoCustomFieldType.Numeric,
        entity_type: AmoEntity.Contacts,
    },
    {
        name: 'Лазерное омоложение лица',
        type: AmoCustomFieldType.Numeric,
        entity_type: AmoEntity.Contacts,
    },
    {
        name: 'Ультразвуковой лифтинг',
        type: AmoCustomFieldType.Numeric,
        entity_type: AmoEntity.Contacts,
    },
    {
        name: 'Лазерное удаление сосудов',
        type: AmoCustomFieldType.Numeric,
        entity_type: AmoEntity.Contacts,
    },
    {
        name: 'Коррекция мимических морщин',
        type: AmoCustomFieldType.Numeric,
        entity_type: AmoEntity.Contacts,
    },
    {
        name: 'Лазерная эпиляция',
        type: AmoCustomFieldType.Numeric,
        entity_type: AmoEntity.Contacts,
    },
    {
        name: FIELD_NAME_SERVICE,
        type: AmoCustomFieldType.Multiselect,
        entity_type: AmoEntity.Leads,
        enums: SERVICE_OPTIONS,
    },
];
