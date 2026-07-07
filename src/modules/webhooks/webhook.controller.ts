import { Body, Controller, Post } from '@nestjs/common';
import { Endpoints } from '../../core/constansts/endpoints';
import { ContactService } from '../contact/contact.service';
import type { ContactAddedWebhookDTO, ContactUpdatedWebhookDTO } from '../contact/DTO/contact.dto';
import { ContactWebhookRDO } from '../contact/RDO/contact-webhook.rdo';
import { LeadService } from '../lead/lead.service';
import type { LeadAddWebhookDTO, LeadUpdateWebhookDTO } from '../lead/DTO/lead.dto';
import { LeadRDO } from '../lead/RDO/lead.rdo';

@Controller(Endpoints.Webhook.Base)
export class WebhookController {
    constructor(
        private readonly contactService: ContactService,
        private readonly leadService: LeadService
    ) {}

    @Post(Endpoints.Webhook.ContactAdd)
    public async contactAdded(@Body() body: ContactAddedWebhookDTO): Promise<ContactWebhookRDO> {
        const res = await this.contactService.handleAddContactWebhook(body);
        console.log(res);
        return res;
    }

    @Post(Endpoints.Webhook.ContactUpdate)
    public async contactUpdated(@Body() body: ContactUpdatedWebhookDTO): Promise<ContactWebhookRDO> {
        const res = await this.contactService.handleUpdateContactWebhook(body);
        console.log(res);
        return res;
    }

    @Post(Endpoints.Webhook.LeadAdd)
    public async leadAdded(@Body() body: LeadAddWebhookDTO): Promise<LeadRDO> {
        try {
            await this.leadService.handleLeadAdded(body);
            return {
                success: true,
            };
        } catch (error) {
            return {
                success: false,
                message: error.message,
            };
        }
    }

    @Post(Endpoints.Webhook.LeadUpdate)
    public async leadUpdated(@Body() body: LeadUpdateWebhookDTO): Promise<LeadRDO> {
        try {
            console.log('lead update');
            await this.leadService.handleLeadUpdated(body);
            return {
                success: true,
            };
        } catch (error) {
            return {
                success: false,
                message: error.message,
            };
        }
    }
}
