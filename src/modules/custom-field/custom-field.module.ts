import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CustomField } from './custom-field.model';
import { AmoModule } from '../amo/amo.module';
import { CustomFieldService } from './custom-field.service';
import { CustomFieldRepository } from './custom-field.repository';

@Module({
    imports: [TypeOrmModule.forFeature([CustomField]), AmoModule],
    providers: [CustomFieldService, CustomFieldRepository],
    exports: [CustomFieldService, CustomFieldRepository],
})
export class CustomFieldModule {}
