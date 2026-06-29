import { AccountService } from './account.service';
import { Controller, Get, Query } from '@nestjs/common';
import type { AmoRDO } from './RDO/oauth.rdo';
import { Endpoints } from '../../core/constansts/endpoints';
import { AccountInstallDto } from './DTO/account-install.dto';
import { AccountUninstallDTO } from './DTO/account-uninstall.dto';

@Controller(Endpoints.Oauth.Base)
export class AccountController {
    constructor(private readonly accountService: AccountService) {}

    @Get(Endpoints.Oauth.Install)
    public async install(@Query() query: AccountInstallDto): Promise<AmoRDO> {
        return this.accountService.install(query);
    }

    @Get(Endpoints.Oauth.Uninstall)
    public async uninstall(@Query() query: AccountUninstallDTO): Promise<AmoRDO> {
        console.log(JSON.stringify(query, null, 2));
        if (!query.client_uuid) {
            return {
                success: false,
                message: 'Client id not found.',
            };
        }
        return this.accountService.uninstall(query.client_uuid);
    }
}
