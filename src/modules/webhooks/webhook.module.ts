import { Module, forwardRef } from '@nestjs/common';

import { AmoModule } from '../amo/amo.module';
import { ContactModule } from '../contact/contact.module';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';

@Module({
    imports: [AmoModule, forwardRef(() => ContactModule)],
    controllers: [WebhookController],
    providers: [WebhookService],
    exports: [WebhookService],
})
export class WebhookModule {}
