import { Module, forwardRef } from '@nestjs/common';

import { ContactService } from './contact.service';
import { AccountModule } from '../accounts/account.module';
import { CustomFieldModule } from '../custom-field/custom-field.module';
import { AmoModule } from '../amo/amo.module';

@Module({
    imports: [forwardRef(() => AccountModule), CustomFieldModule, AmoModule],
    providers: [ContactService],
    exports: [ContactService],
})
export class ContactModule {}
