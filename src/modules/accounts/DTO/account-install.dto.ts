import { IsNotEmpty, IsString } from 'class-validator';

export class AccountInstallDto {
    @IsString()
    @IsNotEmpty()
    public code: string;

    @IsString()
    @IsNotEmpty()
    public referer: string;

    @IsString()
    @IsNotEmpty()
    public platform: string;

    @IsString()
    @IsNotEmpty()
    public client_id: string;

    @IsString()
    @IsNotEmpty()
    public from_widget: string;
}
