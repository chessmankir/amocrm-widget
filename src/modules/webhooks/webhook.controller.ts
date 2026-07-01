import { Body, Controller, Post } from '@nestjs/common';
import { Endpoints } from '../../core/constansts/endpoints';

@Controller(Endpoints.Webhook.Base)
export class WebhookController {
    @Post(Endpoints.Webhook.ContactAdd)
    //Unknown потому что пока заглушка. в следующей задаче будет реализация
    public async contactAdded(@Body() body: unknown): Promise<void> {
        console.log('contactAdded');
    }

    @Post(Endpoints.Webhook.ContactUpdate)
    public async contactUpdated(@Body() body: unknown): Promise<void> {
        console.log('contactUpdated');
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
