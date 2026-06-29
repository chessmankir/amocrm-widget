import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SaveToken } from './types/save-token';
import { Account } from './account.model';

export class AccountRepository {
    constructor(
        @InjectRepository(Account)
        private readonly repository: Repository<Account>
    ) {}

    public async saveTokens(saveToken: SaveToken): Promise<Account> {
        await this.repository.upsert(saveToken, {
            conflictPaths: ['accountId'],
        });

        return this.repository.findOneOrFail({
            where: {
                accountId: saveToken.accountId,
            },
        });
    }

    public async clearTokens(clientId: string): Promise<void> {
        await this.repository.update(
            { accountId: clientId },
            {
                accessToken: null,
                refreshToken: null,
                isInstalled: false,
            }
        );
    }

    public async findInstalledRefreshToken(accountId: string): Promise<Account | null> {
        return this.repository.findOne({
            where: {
                isInstalled: true,
                accountId: accountId,
            },
        });
    }

    public async findInstalledAccounts(): Promise<Account[]> {
        return this.repository.find({
            where: {
                isInstalled: true,
            },
        });
    }

    public async updateTokens(accountId: string, accessToken: string, refreshToken: string): Promise<void> {
        await this.repository.update(
            { accountId },
            {
                accessToken,
                refreshToken,
            }
        );
    }
}
