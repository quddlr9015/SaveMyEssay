import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity()
export class EssayHistory {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    testName: string;

    @Column({ nullable: true })
    testLevel: string;

    @Column('text', { nullable: true })
    question: string;

    @Column('text', { nullable: true })
    essay: string;

    @Column('float', { nullable: true })
    score: number;

    @Column('text', { nullable: true })
    feedback: string;

    @Column('simple-array', { nullable: true })
    grammar: string[];

    @Column('simple-array', { nullable: true })
    vocabulary: string[];

    @Column('simple-array', { nullable: true })
    content: string[];

    @Column('simple-array', { nullable: true })
    organization: string[];

    @CreateDateColumn()
    createdAt: Date;

    @ManyToOne(type => User, user => user.essays)
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column({ nullable: false })
    userId: string;
} 