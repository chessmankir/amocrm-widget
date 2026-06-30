import { AmoService } from '../amo/amo.service';
import { CustomFieldRepository } from './custom-field.repository';
import { Account } from '../accounts/account.model';
import { AmoEntity } from '../../core/enums/amo-entity.enum';
import { AmoCustomField } from './types/custom-field.type';
import { REQUIRED_CUSTOM_FIELDS } from './constants/contact-fields';
import { RequiredCustomField } from './types/required-custom-field.type';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CustomFieldService {
    constructor(
        private readonly amoService: AmoService,
        private readonly customFieldRepository: CustomFieldRepository
    ) {}

    private async getOrCreateAmoField(
        account: Account,
        entityType: AmoEntity,
        requiredField: RequiredCustomField,
        fields: AmoCustomField[]
    ): Promise<AmoCustomField> {
        const existingField = await this.getExistingAmoField(account.id, requiredField, fields);

        if (existingField) {
            await this.updateFieldEnumsIfNeeded(account, entityType, existingField, requiredField);
            return existingField;
        }

        if (!account.accessToken) {
            throw new Error(`Access token not found for account ${account.id} `);
        }

        const createFieldResponse = await this.amoService.createCustomField(
            account.subdomain,
            account.accessToken,
            entityType,
            requiredField.name,
            requiredField.type,
            requiredField.enums
        );

        const createField = createFieldResponse._embedded?.custom_fields?.[0];
        if (!createField) {
            throw new Error(`Custom field ${requiredField.name} was not created`);
        }
        return createField;
    }

    private async getExistingAmoField(
        accountId: number,
        requiredField: RequiredCustomField,
        fields: AmoCustomField[]
    ): Promise<AmoCustomField | null> {
        const existingFields = fields.filter((field) => field.name === requiredField.name && field.type === requiredField.type);

        if (!existingFields.length) {
            return null;
        }

        if (existingFields.length === 1) {
            return existingFields[0];
        }

        const fieldFromBase = await this.customFieldRepository.findByAccountIdAndFieldName(accountId, requiredField.name);
        if (fieldFromBase) {
            const matchedField = existingFields.find((field) => field.id === fieldFromBase.fieldId);

            if (matchedField) {
                return matchedField;
            }
        }

        return existingFields[0];
    }

    private async syncFieldsByEntity(account: Account, entityType: AmoEntity): Promise<void> {
        const requiredFields = REQUIRED_CUSTOM_FIELDS.filter((field) => field.entity_type === entityType);
        const customFieldsResponse = await this.amoService.getCustomFields(account.subdomain, account.accessToken!, entityType);
        const fields = customFieldsResponse._embedded?.custom_fields ?? [];

        for (const requiredField of requiredFields) {
            const field = await this.getOrCreateAmoField(account, entityType, requiredField, fields);

            await this.customFieldRepository.saveFields({
                accountId: account.id,
                fieldId: field.id,
                fieldName: requiredField.name,
                fieldType: requiredField.type,
            });
        }
    }

    public async syncAccountCustomFields(account: Account): Promise<void> {
        if (!account.accessToken) {
            return;
        }
        await this.syncFieldsByEntity(account, AmoEntity.Contacts);
        await this.syncFieldsByEntity(account, AmoEntity.Leads);
    }

    private async updateFieldEnumsIfNeeded(
        account: Account,
        entityType: AmoEntity,
        existingField: AmoCustomField,
        requiredField: RequiredCustomField
    ): Promise<void> {
        if (!requiredField.enums?.length) {
            return;
        }

        const existingEnums = existingField.enums ?? [];
        const existringValues = existingEnums.map((item) => item.value);

        const missedEnums = requiredField.enums.filter((option) => !existringValues.includes(option));

        if (!missedEnums.length) {
            return;
        }

        await this.amoService.updateCustomField(account.subdomain, account.accessToken!, entityType, existingField.id, {
            enums: [...existingEnums.map((item) => ({ value: item.value })), ...missedEnums.map((value) => ({ value }))],
        });
    }
}
