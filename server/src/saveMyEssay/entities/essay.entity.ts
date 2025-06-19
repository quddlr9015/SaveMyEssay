import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

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

    @Index()
    @Column()
    userId: string;
} 