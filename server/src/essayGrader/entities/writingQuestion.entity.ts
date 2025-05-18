import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum TestType {
    TOEFL = 'TOEFL',
    TOEIC = 'TOEIC',
    DELE = 'DELE',
    IELTS = 'IELTS',
    TEPS = 'TEPS',
    GRE = 'GRE'
}

export enum TestLevel {
    // DELE 레벨
    DELE_A1 = 'DELE_A1',
    DELE_A2 = 'DELE_A2',
    DELE_B1 = 'DELE_B1',
    DELE_B2 = 'DELE_B2',
    DELE_C1 = 'DELE_C1',
    DELE_C2 = 'DELE_C2',

    // IELTS 레벨
    IELTS_BAND_4 = 'IELTS_BAND_4',
    IELTS_BAND_5 = 'IELTS_BAND_5',
    IELTS_BAND_6 = 'IELTS_BAND_6',
    IELTS_BAND_7 = 'IELTS_BAND_7',
    IELTS_BAND_8 = 'IELTS_BAND_8',
    IELTS_BAND_9 = 'IELTS_BAND_9'
}

export enum QuestionType {
    ESSAY = 'ESSAY',
    READING = 'READING',
    LISTENING = 'LISTENING',
    SPEAKING = 'SPEAKING'
}

@Entity()
export class WritingQuestion {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'varchar',
        comment: '시험 유형 (TOEFL, TOEIC, DELE, IELTS, TEPS, GRE)'
    })
    testType: string;

    @Column({
        type: 'varchar',
        comment: '시험 레벨 (DELE: A1-C2, IELTS: BAND 4-9)'
    })
    testLevel: string;

    @Column({
        comment: '문제 제목'
    })
    title: string;

    @Column({
        type: 'varchar',
        comment: '문제 유형 (ESSAY, READING, LISTENING, SPEAKING)'
    })
    questionType: string;

    @Column('text', {
        comment: '문제에 대한 상세 설명'
    })
    description: string;

    @Column('text', {
        comment: '모범 답안'
    })
    sampleAnswer: string;

    @Column('text', {
        nullable: true,
        comment: '읽기 지문 (READING 유형의 경우 사용)'
    })
    readingPassage: string;

    @Column('text', {
        nullable: true,
        comment: '듣기 지문 (LISTENING 유형의 경우 사용)'
    })
    listeningPassage: string;

    @Column('varchar', {
        nullable: true,
        comment: '듣기 지문 URL (LISTENING 유형의 경우 사용)'
    })
    listeningPassageUrl: string;

    @Column('text', {
        comment: '실제 문제 내용'
    })
    question: string;

    @Column({
        type: 'int',
        default: 30,
        comment: '문제 풀이 제한 시간 (분 단위)'
    })
    timeLimit: number;

    @Column({
        type: 'int',
        default: 100,
        comment: '문제 배점'
    })
    points: number;

    @Column({
        default: true,
        comment: '문제 활성화 여부'
    })
    isActive: boolean;

    @CreateDateColumn({
        comment: '생성 일시'
    })
    createdAt: Date;

    @UpdateDateColumn({
        comment: '수정 일시'
    })
    updatedAt: Date;
} 