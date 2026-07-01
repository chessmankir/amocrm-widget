import { Body, Controller, Post } from '@nestjs/common';

@Controller('webhooks')
export class WebhookController {
    @Post('contact/add')
    //Unknown потому что пока заглушка. в следующей задаче будет реализация
    public async contactAdded(@Body() body: unknown): Promise<void> {
        console.log('contactAdded');
    }

    @Post('contact/update')
    public async contactUpdated(@Body() body: unknown): Promise<void> {
        console.log('contactUpdated');
    }

    @Post('lead/add')
    public async leadAdded(@Body() body: unknown): Promise<void> {
        console.log('leadAdded');
    }

    @Post('lead/update')
    public async leadUpdated(@Body() body: unknown): Promise<void> {
        console.log('leadUpdated');
    }
}
