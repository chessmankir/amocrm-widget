import { Injectable } from '@nestjs/common';
import type { AmoRDO } from './RDO/oauth.rdo';
import { ConfigService } from '@nestjs/config';
import { AccountRepository } from './account.repository';
import { AmoService } from '../amo/amo.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AccountInstallDTO } from './DTO/account-install.dto';
import { WebhookService } from '../webhooks/webhook.service';
import { CustomFieldService } from '../custom-field/custom-field.service';

@Injectable()
export class AccountService {
    constructor(
        private readonly configService: ConfigService,
        private readonly repository: AccountRepository,
        private readonly amoService: AmoService,
        private readonly webhookService: WebhookService,
        private readonly customFieldService: CustomFieldService
    ) {}

    public async install(query: AccountInstallDTO): Promise<AmoRDO> {
        const { code, referer, client_id } = query;
        const subdomain = this.getSubdomainReferer(referer);
        const tokens = await this.amoService.getTokens(code, subdomain);
        const account = await this.repository.saveTokens({
            accountId: client_id,
            subdomain: subdomain,
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            isInstalled: true,
        });

        await this.webhookService.syncAccountWebhooks(account);
        await this.customFieldService.syncAccountCustomFields(account);

        return {
            success: true,
            message: 'ok',
        };
    }

    public async uninstall(clientId: string): Promise<AmoRDO> {
        await this.repository.clearTokens(clientId);
        return {
            success: true,
            message: 'ok',
        };
    }

    private getSubdomainReferer(referer: string): string {
        return referer.split('.')[0];
    }

    @Cron(CronExpression.EVERY_12_HOURS)
    public async refreshAccountsTokens(): Promise<void> {
        const accounts = await this.repository.findInstalledAccounts();
        for (const account of accounts) {
            if (!account.refreshToken) {
                continue;
            }
            const tokens = await this.amoService.refreshTokens(account.subdomain, account.refreshToken);
            await this.repository.updateTokens(account.accountId, tokens.access_token, tokens.refresh_token);
        }
    }
}
