import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AmoService } from '../amo/amo.service';
import { Account } from '../accounts/account.model';
import { TaskAmo } from './RDO/task.rdo';
import { TaskTitles } from './constants/task.contstans';
import { Env } from '../../core/enums/env.enum';

@Injectable()
export class TaskService {
    constructor(
        private readonly amoService: AmoService,
        private readonly configService: ConfigService
    ) {}

    public async createOrUpdateCheckBudgetTask(
        account: Account,
        leadId: number,
        responsibleUserId: number,
        contactName: string,
        age: number
    ): Promise<void> {
        const text = `${TaskTitles.CheckBudgetPrefix} ${contactName}, возраст: ${age}`;
        const typeCheckTaskId = Number(this.configService.getOrThrow<string>(Env.AmoCheckTaskTypeId));

        this.createOrUpdateTask(account, leadId, responsibleUserId, typeCheckTaskId, TaskTitles.CheckBudgetPrefix, text);
    }

    public async createAgeUnknownTaskIfNotExists(account: Account, leadId: number, responsibleId: number): Promise<void> {
        const existingTask = await this.findActiveTaskByText(account, leadId, TaskTitles.AgeUnknown);

        if (existingTask) {
            return;
        }

        const taskErrorType = Number(this.configService.getOrThrow<string>(Env.AmoErrorTaskTypeId));
        await this.createTask(account, leadId, responsibleId, taskErrorType, TaskTitles.AgeUnknown);
    }

    private async createTask(account: Account, leadId: number, responsibleUserId: number, taskTypeId: number, text: string): Promise<void> {
        const completeTill = Math.floor(Date.now() / 1000) + 24 * 60 * 60;
        await this.amoService.createTask(account.subdomain, account.accessToken!, [
            {
                text,
                entity_id: leadId,
                entity_type: 'leads',
                complete_till: completeTill,
                responsible_user_id: responsibleUserId,
                task_type_id: taskTypeId,
            },
        ]);
    }

    private async findActiveTaskByText(account: Account, leadId: number, text: string): Promise<TaskAmo | null> {
        const response = await this.amoService.getTaskByLeadId(account.subdomain, account.accessToken!, leadId);

        const tasks = response._embedded?.tasks ?? [];

        return tasks.find((task) => task.text.startsWith(text) && !task.is_completed) ?? null;
    }

    public async createOrUpdateMissingServicesTask(
        account: Account,
        leadId: number,
        responsibleUserId: number,
        missingServices: string[]
    ): Promise<void> {
        const text = `${TaskTitles.MissingServicesPrefix} ${missingServices.join(', ')}`;

        await this.createOrUpdateTask(
            account,
            leadId,
            responsibleUserId,
            Number(this.configService.getOrThrow<string>(Env.AmoErrorTaskTypeId)),
            TaskTitles.MissingServicesPrefix,
            text
        );
    }

    private async createOrUpdateTask(
        account: Account,
        leadId: number,
        responsibleUserId: number,
        taskTypeId: number,
        searchText: string,
        newText: string
    ): Promise<void> {
        const existingTask = await this.findActiveTaskByText(account, leadId, searchText);

        if (!existingTask) {
            await this.createTask(account, leadId, responsibleUserId, taskTypeId, newText);
            return;
        }

        if (existingTask.text === newText) {
            return;
        }

        await this.amoService.updateTask(account.subdomain, account.accessToken!, existingTask.id, {
            text: newText,
        });
    }
}
