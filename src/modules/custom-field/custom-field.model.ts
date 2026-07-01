import { Account } from '../accounts/account.model';
import { Column, Index, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('custom_fields')
@Index(['accountId', 'fieldName'], { unique: true })
export class CustomField {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ name: 'field_type' })
    public fieldType: string;

    @Column({ name: 'field_id' })
    public fieldId: number;

    @Column({ name: 'field_name' })
    public fieldName: string;

    @ManyToOne(() => Account, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'account_id' })
    public account: Account;

    @Column({ name: 'account_id' })
    public accountId: number;
}
