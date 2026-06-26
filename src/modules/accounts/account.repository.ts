import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SaveTokenDTO } from './DTO/save-token.dto';
import { Account } from './account.model';

export class AccountRepository {
    constructor(
        @InjectRepository(Account)
        private readonly repository: Repository<Account>
    ) {}

    public async saveTokens(dto: SaveTokenDTO): Promise<Account> {
        await this.repository.upsert(dto, {
            conflictPaths: ['accountId'],
        });

        return this.repository.findOneOrFail({
            where: {
                accountId: dto.accountId,
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
