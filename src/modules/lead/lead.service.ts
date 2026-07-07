import { Injectable } from '@nestjs/common';
import { ContactService } from '../contact/contact.service';
import { AmoService } from '../amo/amo.service';
import { TaskService } from '../task/task.service';
import { LeadAddWebhookDTO, LeadUpdateWebhookDTO } from './DTO/lead.dto';
import { Lead } from './types/lead.types';
import { Account } from '../accounts/account.model';
import { AccountRepository } from '../accounts/account.repository';
import { ContactWebhook } from '../contact/types/contact.type';
import { normalizeFieldValue } from '../../core/helpers/amo-fields';
import { CustomFieldRepository } from '../custom-field/custom-field.repository';
import { FIELD_NAME_SERVICE } from '../custom-field/constants/contact-fields';

@Injectable()
export class LeadService {
    constructor(
        private readonly amoService: AmoService,
        private readonly contactService: ContactService,
        private readonly taskService: TaskService,
        private readonly accountRepository: AccountRepository,
        private readonly customFieldRepository: CustomFieldRepository
    ) {}

    public async handleLeadAdded(body: LeadAddWebhookDTO): Promise<void> {
        const lead = body?.leads?.add?.[0];
        const subdomain = body?.account.subdomain;
        if (!lead) {
            throw new Error('Lead not found');
        }
        await this.calculateAndUpdateLeadBudget(subdomain, lead);
    }

    public async handleLeadUpdated(body: LeadUpdateWebhookDTO): Promise<void> {
        const lead = body?.leads?.update?.[0];
        const subdomain = body?.account.subdomain;
        if (!lead) {
            throw new Error('Lead not found');
        }
        await this.calculateAndUpdateLeadBudget(subdomain, lead);
    }

    private async calculateAndUpdateLeadBudget(subdomain: string, leadFromWebhook: Lead): Promise<void> {
        const leadId = Number(leadFromWebhook.id);
        const account = await this.accountRepository.getAmoAccount(subdomain);
        if (!account?.accessToken) {
            throw new Error('Account access not found');
        }
        const selectedServices = await this.getSelectedServicesFromLead(account.id, leadFromWebhook);
        if (!selectedServices.length) {
            return;
        }

        const contact = await this.getMainContactWithLead(leadId, account);
        if (!contact) {
            return;
        }
        const filledServices = await this.getFilledServiceFields(account.id, selectedServices, contact);
        const missingServices = selectedServices.filter((service) => !filledServices.has(service));

        if (missingServices.length) {
            await this.taskService.createOrUpdateMissingServicesTask(
                account,
                leadId,
                Number(leadFromWebhook.responsible_user_id),
                missingServices
            );

            return;
        }

        //Провека поля возраст
        const age = await this.contactService.ensureContactAge(account, contact);
        if (age === null) {
            await this.taskService.createAgeUnknownTaskIfNotExists(account, leadId, Number(leadFromWebhook.responsible_user_id));
            return;
        }

        const budget = this.calculateBudgetByFilledServices(filledServices);
        const currentBudget = Number(leadFromWebhook.price ?? 0);
        if (currentBudget === budget) {
            return;
        }
        this.updateLeadBudget(subdomain, leadId, account, budget);
        await this.taskService.createOrUpdateCheckBudgetTask(
            account,
            leadId,
            Number(leadFromWebhook.responsible_user_id),
            contact.name,
            age!
        );
    }

    private calculateBudgetByFilledServices(filledServices: Map<string, number>): number {
        return [...filledServices.values()].reduce((sum, price) => sum + price, 0);
    }

    private async getSelectedServicesFromLead(accountId: number, lead: Lead): Promise<string[]> {
        const customField = await this.customFieldRepository.findByAccountIdAndFieldName(accountId, FIELD_NAME_SERVICE);
        if (!customField) {
            throw new Error(`CustomField with name:${FIELD_NAME_SERVICE} not found`);
        }
        const servicesField = lead.custom_fields?.find((field) => {
            return Number(field.id) === Number(customField.fieldId);
        });
        return servicesField?.values?.map((service) => service.value) ?? [];
    }

    private async getMainContactWithLead(leadId: number, account: Account): Promise<ContactWebhook> {
        const contactIdsWithLead = await this.amoService.getLeadWithContacts(account.subdomain, account.accessToken!, leadId);
        const mainContact = contactIdsWithLead?._embedded?.contacts?.find((contact) => {
            return contact.is_main;
        });
        if (!mainContact) {
            throw new Error('Could not find a contact');
        }
        const contact = await this.amoService.getContactById(account.subdomain, account.accessToken!, mainContact.id);
        return contact;
    }

    private async getFilledServiceFields(
        accountId: number,
        selectedServices: string[],
        contact: ContactWebhook
    ): Promise<Map<string, number>> {
        const result: Map<string, number> = new Map<string, number>();

        for (const serviceName of selectedServices) {
            const customField = await this.customFieldRepository.findByAccountIdAndFieldName(accountId, serviceName);

            if (!customField) {
                continue;
            }

            const field = contact.custom_fields_values?.find((item) => Number(item.field_id) === Number(customField.fieldId));
            const value = Number(normalizeFieldValue(field?.values?.[0]) ?? 0);

            if (!Number.isNaN(value) && value > 0) {
                result.set(serviceName, value);
            }
        }

        return result;
    }

    private async updateLeadBudget(subdomain: string, leadId: number, account: Account, budget: number): Promise<void> {
        await this.amoService.updateLead(account.subdomain, account.accessToken!, leadId, {
            price: budget,
        });
    }
}
