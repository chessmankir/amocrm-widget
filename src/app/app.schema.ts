import { Env } from '../core/enums/env.enum';

export type AppConfigSchema = {
    [Env.AmoClientId]: string;
    [Env.AmoClientSecret]: string;
    [Env.AmoRedirectUri]: string;

    [Env.PostgresHost]: string;
    [Env.PostgresPort]: number;
    [Env.PostgresUser]: string;
    [Env.PostgresPassword]: string;
    [Env.PostgresDb]: string;
};
