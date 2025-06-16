import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '@/users/entities/user.entity';

@Entity()
export class Essay {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column('text')
    content: string;

    @Column({ type: 'float', nullable: true })
    score: number;

    @Column({ type: 'json', nullable: true })
    feedback: {
        grammar: string[];
        vocabulary: string[];
        content: string[];
        organization: string[];
    };

    @CreateDateColumn()
    createdAt: Date;

    @ManyToOne(() => User, user => user.essays)
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column()
    userId: string;
} 