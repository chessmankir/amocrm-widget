import { Body, Controller, Post } from '@nestjs/common';
import { Endpoints } from '../../core/constansts/endpoints';
import { ContactService } from '../contact/contact.service';
import type { ContactAddedWebhookDTO, ContactUpdatedWebhookDTO } from '../contact/DTO/contact.dto';
import { ContactWebhookRDO } from '../contact/RDO/contact-webhook.rdo';

@Controller(Endpoints.Webhook.Base)
export class WebhookController {
    constructor(private readonly contactService: ContactService) {}

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
    public async leadAdded(@Body() body: unknown): Promise<void> {
        console.log('leadAdded');
    }

    @Post(Endpoints.Webhook.LeadUpdate)
    public async leadUpdated(@Body() body: unknown): Promise<void> {
        console.log('leadUpdated');
    }
}
