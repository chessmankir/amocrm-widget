import { Injectable } from '@nestjs/common';
import { ContactService } from '../contact/contact.service';
import { AmoService } from '../amo/amo.service';
import { TaskService } from '../task/task.service';
import { LeadAddWebhookDTO, LeadUpdateWebhookDTO } from './DTO/lead.dto';
import { Lead } from './types/lead.types';
import { ContactRdo } from '../contact/DTO/contact.dto';
import { Account } from '../accounts/account.model';
import { AccountRepository } from '../accounts/account.repository';
import { ContactWebhook } from '../contact/types/contact.type';

@Injectable()
export class LeadService {
    constructor(
        private readonly amoService: AmoService,
        private readonly contactService: ContactService,
        private readonly taskService: TaskService,
        private readonly accountRepository: AccountRepository
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
        const selectedServices = this.getSelectedServicesFromLead(leadFromWebhook);
        if (!selectedServices.length) {
            return;
        }
        const account = await this.accountRepository.getAmoAccount(subdomain);
        if (!account?.accessToken) {
            throw new Error('Account access not found');
        }
        const contact = await this.getMainContactWithLead(leadId, account);

        if (!contact) {
            return;
        }
        const filledServices = this.getFilledServiceFields(selectedServices, contact);

        //Провека поля возраст
        const age = await this.contactService.ensureContactAge(account, contact);
        if (age === null) {
            await this.taskService.createAgeUnknownTaskIfNotExists(account, leadId, Number(leadFromWebhook.responsible_user_id));
            return;
        }

        if (filledServices.size === selectedServices.length && selectedServices.length > 0) {
            const budget = this.calculateBudgetByContact(selectedServices, contact);
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
        } else {
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
        }
    }

    private calculateBudgetByContact(selectedServices: string[], contact: ContactRdo): number {
        return selectedServices.reduce((sum, serviceName) => {
            const price = this.getServicePriceFromContact(contact, serviceName);
            return sum + price;
        }, 0);
    }

    private getServicePriceFromContact(contact: ContactRdo, serviceName: string): number {
        const field = contact.custom_fields_values?.find((custom_field) => custom_field.field_name === serviceName);
        return Number(field?.values?.[0]?.value ?? 0);
    }

    private getSelectedServicesFromLead(lead: Lead): string[] {
        const servicesField = lead.custom_fields?.find((field) => field.name === 'Услуги');
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

    private getFilledServiceFields(selectedServices: string[], contact: ContactRdo): Map<string, number> {
        const result: Map<string, number> = new Map<string, number>();

        for (const serviceName of selectedServices) {
            const field = contact.custom_fields_values?.find((item) => item.field_name === serviceName);
            const value = Number(field?.values?.[0]?.value ?? 0);

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
