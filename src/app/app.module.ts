import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Joi from 'joi';
import { ScheduleModule } from '@nestjs/schedule';
import { Env } from '../core/enums/env.enum';
import { AppConfigSchema } from './app.schema';
import { AccountModule } from '../modules/accounts/account.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            validationSchema: Joi.object<AppConfigSchema, true>({
                [Env.AmoClientId]: Joi.string().required(),
                [Env.AmoClientSecret]: Joi.string().required(),
                [Env.AmoRedirectUri]: Joi.string().required(),

                [Env.PostgresHost]: Joi.string().required(),
                [Env.PostgresPort]: Joi.number().required(),
                [Env.PostgresUser]: Joi.string().required(),
                [Env.PostgresPassword]: Joi.string().required(),
                [Env.PostgresDb]: Joi.string().required(),
                [Env.AmoWebhookBaseUrl]: Joi.string().required(),

                [Env.AmoErrorTaskTypeId]: Joi.string().required(),
                [Env.AmoCheckTaskTypeId]: Joi.string().required(),
            }),
        }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService<AppConfigSchema>) => ({
                type: 'postgres',
                host: configService.get<string>(Env.PostgresHost),
                port: configService.get<number>(Env.PostgresPort),
                username: configService.get<string>(Env.PostgresUser),
                password: configService.get<string>(Env.PostgresPassword),
                database: configService.get<string>(Env.PostgresDb),
                autoLoadEntities: true,
                synchronize: true,
            }),
        }),
        ScheduleModule.forRoot(),
        AccountModule,
    ],
})
export class AppModule {}
