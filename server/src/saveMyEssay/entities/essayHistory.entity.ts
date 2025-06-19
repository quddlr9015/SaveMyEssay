import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

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

    @Index() // enables fast querying by user id
    @Column({ nullable: false })
    userId: string;
} 