import { AccountService } from './account.service';
import { Controller, Get, Query } from '@nestjs/common';
import type { AccountInstallRDO, AccountUninstallRDO, AmoResponse } from './RDO/oauth.rdo';
import { Endpoints } from '../../core/constansts/endpoints';

@Controller(Endpoints.Oauth.Base)
export class AccountController {
    constructor(private readonly accountService: AccountService) {}

    @Get(Endpoints.Oauth.Install)
    public async install(@Query() query: AccountInstallRDO): Promise<AmoResponse> {
        return this.accountService.install(query);
    }

    @Get(Endpoints.Oauth.Uninstall)
    public async uninstall(@Query() query: AccountUninstallRDO): Promise<AmoResponse> {
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
