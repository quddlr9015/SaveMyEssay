import { User } from '@/auth/user.entity';
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne } from 'typeorm';

@Entity()
export class EssayHistory {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(type => User, user => user.boards, { eager: false })
    user: User;

    @Column()
    testName: string;

    @Column()
    testLevel: string;

    @Column()
    question: string;

    @Column('text')
    essay: string;

    @Column()
    score: number;

    @Column('text')
    feedback: string;

    @Column('simple-array')
    grammar: string[];

    @Column('simple-array')
    vocabulary: string[];

    @Column('simple-array')
    content: string[];

    @Column('simple-array')
    organization: string[];

    @CreateDateColumn()
    createdAt: Date;
} 