import { InjectRepository } from '@nestjs/typeorm';
import { CustomField } from './custom-field.model';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { SaveCustomFieldDTO } from './types/save-custom-field.type';

@Injectable()
export class CustomFieldRepository {
    constructor(
        @InjectRepository(CustomField)
        private readonly repository: Repository<CustomField>
    ) {}

    public async saveFields(dto: SaveCustomFieldDTO): Promise<CustomField> {
        await this.repository.upsert(dto, {
            conflictPaths: ['accountId', 'fieldName'],
        });

        return this.repository.findOneOrFail({
            where: {
                accountId: dto.accountId,
                fieldName: dto.fieldName,
            },
        });
    }

    public async findByAccountIdAndFieldName(accountId: number, fieldName: string): Promise<CustomField | null> {
        return this.repository.findOne({
            where: {
                accountId,
                fieldName,
            },
        });
    }

    public async getFieldIdByAccountIdAndFieldName(accountId: number, fieldName: string): Promise<CustomField | null> {
        return this.repository.findOne({
            where: {
                accountId,
                fieldName,
            },
        });
    }
}
