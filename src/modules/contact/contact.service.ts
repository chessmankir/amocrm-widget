import { Injectable } from '@nestjs/common';

import { AccountRepository } from '../accounts/account.repository';
import { AmoService } from '../amo/amo.service';
import { CustomFieldRepository } from '../custom-field/custom-field.repository';
import { ContactAddedWebhookDTO, ContactUpdatedWebhookDTO } from './DTO/contact.dto';
import { ContactWebhookRDO } from './RDO/contact-webhook.rdo';
import { ContactWebhook } from './types/contact.type';
import { ContactCustomFieldName } from './constants/contact.constants';
import { getFieldValueById } from '../../core/helpers/amo-fields';

@Injectable()
export class ContactService {
    constructor(
        private readonly accountRepository: AccountRepository,
        private readonly customFieldRepository: CustomFieldRepository,
        private readonly amoService: AmoService
    ) {}

    public async handleAddContactWebhook(body: ContactAddedWebhookDTO): Promise<ContactWebhookRDO> {
        const contact = body.contacts?.add?.[0];

        return this.processContact(body.account.id, contact);
    }

    public async handleUpdateContactWebhook(body: ContactUpdatedWebhookDTO): Promise<ContactWebhookRDO> {
        const contact = body.contacts?.update?.[0];

        return this.processContact(body.account.subdomain, contact);
    }

    private async processContact(subdomain: string, contact?: ContactWebhook): Promise<ContactWebhookRDO> {
        if (!contact) {
            return {
                success: false,
                message: 'Contact not found',
            };
        }

        const account = await this.accountRepository.getAmoAccount(subdomain);
        if (!account || !account.accessToken) {
            return {
                success: false,
                message: 'Account not found or access token is missing',
            };
        }

        const birthdayField = await this.customFieldRepository.findByAccountIdAndFieldName(account.id, ContactCustomFieldName.Birthday);
        const ageField = await this.customFieldRepository.findByAccountIdAndFieldName(account.id, ContactCustomFieldName.Age);
        if (!birthdayField || !ageField) {
            return {
                success: false,
                message: 'Required custom fields not found',
            };
        }

        const birthdayTimestamp = getFieldValueById(contact.custom_fields, birthdayField.fieldId);

        if (!birthdayTimestamp) {
            return {
                success: false,
                message: 'Birthday field is empty',
            };
        }

        const age = this.calculateAgeFromTimestamp(Number(birthdayTimestamp));
        const currentAge = getFieldValueById(contact.custom_fields, ageField.fieldId);

        if (Number(currentAge) === age) {
            return {
                success: true,
                message: 'Age is already actual',
                contactId: Number(contact.id),
                age,
            };
        }

        await this.amoService.updateContactCustomField(account.subdomain, account.accessToken, Number(contact.id), ageField.fieldId, age);

        return {
            success: true,
            message: 'Contact age updated',
            contactId: Number(contact.id),
            age,
        };
    }

    private calculateAgeFromTimestamp(timestamp: number): number {
        const birthDate = new Date(timestamp * 1000);
        const today = new Date();

        let age = today.getFullYear() - birthDate.getFullYear();

        const birthdayThisYear = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());

        if (today < birthdayThisYear) {
            age--;
        }
        return age;
    }
}
