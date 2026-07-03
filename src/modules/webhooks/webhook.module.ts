import { Module, forwardRef } from '@nestjs/common';

import { AmoModule } from '../amo/amo.module';
import { ContactModule } from '../contact/contact.module';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';
import { LeadModule } from '../lead/lead.module';

@Module({
    imports: [AmoModule, LeadModule, forwardRef(() => ContactModule)],
    controllers: [WebhookController],
    providers: [WebhookService],
    exports: [WebhookService],
})
export class WebhookModule {}
