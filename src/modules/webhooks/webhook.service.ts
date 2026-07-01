import { Injectable } from '@nestjs/common';
import { AmoService } from '../amo/amo.service';
import { ConfigService } from '@nestjs/config';
import { Account } from '../accounts/account.model';
import { Env } from '../../core/enums/env.enum';
import { REQUIRED_WEBHOOKS } from './constants/webhooks.constant';

@Injectable()
export class WebhookService {
    constructor(
        private readonly amoService: AmoService,
        private readonly configService: ConfigService
    ) {}

    public async syncAccountWebhooks(account: Account): Promise<void> {
        console.log('syncAccountWebhooks');
        if (!account.accessToken) {
            return;
        }

        const response = await this.amoService.getWebhooks(account.subdomain, account.accessToken);

        const webhooks = response._embedded?.webhooks || [];

        const baseUrlWebhooks = this.configService.getOrThrow<string>(Env.AmoWebhookBaseUrl);
        console.log(REQUIRED_WEBHOOKS);
        for (const requiredWebhook of REQUIRED_WEBHOOKS) {
            console.log(requiredWebhook);
            const destination = `${baseUrlWebhooks}${requiredWebhook.url}`;
            const exists = webhooks.some((item) => item.destination === destination && item.settings?.includes(requiredWebhook.event));
            console.log(exists);
            if (exists) {
                continue;
            }

            await this.amoService.createWebhook(account.subdomain, account.accessToken, destination, [requiredWebhook.event]);
        }
    }
}
