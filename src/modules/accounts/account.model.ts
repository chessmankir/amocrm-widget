import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('accounts')
export class Account {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ name: 'account_id', unique: true })
    public accountId: string;

    @Column()
    public subdomain: string;

    @Column({ name: 'access_token', type: 'text', nullable: true })
    public accessToken: string | null;

    @Column({ name: 'refresh_token', type: 'text', nullable: true })
    public refreshToken: string | null;

    @Column({ name: 'is_installed', default: true })
    public isInstalled: boolean;

    @CreateDateColumn({ name: 'created_at' })
    public createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    public updatedAt: Date;
}
