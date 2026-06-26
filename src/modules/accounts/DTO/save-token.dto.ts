import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class SaveTokenDTO {
    @IsString()
    @IsNotEmpty()
    public accountId: string;

    @IsString()
    @IsNotEmpty()
    public subdomain: string;

    @IsString()
    @IsNotEmpty()
    public accessToken: string;

    @IsString()
    @IsNotEmpty()
    public refreshToken: string;

    @IsBoolean()
    @IsNotEmpty()
    public isInstalled: boolean;
}
