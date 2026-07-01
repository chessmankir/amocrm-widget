import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Env } from './core/enums/env.enum';
import Joi from 'joi';
import { AccountModule } from './modules/accounts/account.module';
import { ScheduleModule } from '@nestjs/schedule';
import { AppConfigSchema } from './app/app.schema';
import { CustomFieldModule } from './modules/custom-field/custom-field.module';

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
        CustomFieldModule,
    ],
})
export class AppModule {}
