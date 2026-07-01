import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { AccountRepository } from './account.repository';
import { Account } from './account.model';
import { AmoModule } from '../amo/amo.module';
import { WebhookModule } from '../webhooks/webhook.module';

@Module({
    imports: [TypeOrmModule.forFeature([Account]), AmoModule, WebhookModule],
    controllers: [AccountController],
    providers: [AccountService, AccountRepository],
})
export class AccountModule {}
