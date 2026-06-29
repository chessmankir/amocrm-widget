import { IsNotEmpty, IsString } from 'class-validator';

export class AccountUninstallDTO {
    @IsString()
    @IsNotEmpty()
    public client_uuid: string;

    @IsString()
    @IsNotEmpty()
    public account_id: string;

    @IsString()
    @IsNotEmpty()
    public signature: string;

    @IsString()
    @IsNotEmpty()
    public hook_reason: string;
};
