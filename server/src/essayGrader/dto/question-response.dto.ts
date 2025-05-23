import { ApiProperty } from '@nestjs/swagger';
import { QuestionType } from '../entities/writingQuestion.entity';

export class QuestionResponseDto {
    @ApiProperty({ description: '문제 제목' })
    title: string;

    @ApiProperty({ description: '문제 내용' })
    question: string;

    @ApiProperty({ description: '독해 지문', required: false })
    readingPassage?: string;

    @ApiProperty({ description: '듣기 지문', required: false })
    listeningPassage?: string;

    @ApiProperty({ description: '듣기 오디오 URL', required: false })
    listeningPassageUrl?: string;

    @ApiProperty({ description: '문제 유형', enum: QuestionType })
    questionType: QuestionType;

    @ApiProperty({ description: '제한 시간(분)' })
    timeLimit: number;

    @ApiProperty({ description: '배점' })
    points: number;
} 