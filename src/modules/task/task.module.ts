import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { AmoModule } from '../amo/amo.module';

@Module({
    imports: [AmoModule],
    providers: [TaskService],
    exports: [TaskService],
})
export class TaskModule {}
