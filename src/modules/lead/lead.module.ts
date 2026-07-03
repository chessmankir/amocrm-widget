import { forwardRef, Module } from '@nestjs/common';
import { LeadService } from './lead.service';
import { ContactModule } from '../contact/contact.module';
import { AmoModule } from '../amo/amo.module';
import { TaskModule } from '../task/task.module';
import { AccountModule } from '../accounts/account.module';

@Module({
    imports: [ContactModule, AmoModule, TaskModule, forwardRef(() => AccountModule)],
    providers: [LeadService],
    exports: [LeadService],
})
export class LeadModule {}
