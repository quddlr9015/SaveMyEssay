import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EssayHistory } from './entities/essayHistory.entity';
import { User } from '@/auth/user.entity';
import { WritingQuestion, TestType, TestLevel, QuestionType } from './entities/writingQuestion.entity';

@Injectable()
export class EssayGraderService {
    private openai: OpenAI;

    constructor(
        private configService: ConfigService,
        @InjectRepository(EssayHistory)
        private essayGradeRepository: Repository<EssayHistory>,
        @InjectRepository(WritingQuestion)
        private questionRepository: Repository<WritingQuestion>,
    ) {
        this.openai = new OpenAI({
            apiKey: this.configService.get('OPENAI_KEY'),
        });
    }

    async getEssayHistory(user: User): Promise<EssayHistory[]> {
        return this.essayGradeRepository.find({
            where: { user },
            order: { createdAt: 'DESC' }
        });
    }

    async getResFromGPT(systemPrompt: string, userPrompt: string): Promise<string> {
        try {
            const newLocal = 'gpt-4.1-mini';
            const completion = await this.openai.chat.completions.create({
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                model: newLocal,
            });

            return completion.choices[0].message.content ?? '응답을 생성할 수 없습니다.';
        } catch (error) {
            console.error('Error generating response:', error);
            throw error;
        }
    }

    async getEssayGrade(testName: string, testLevel: string, question: string, essayContents: string, lang: string, user: User): Promise<any> {
        try {
            const systemPrompt = testName === 'DELE'
                ? `You are a ${testName} ${testLevel} writing grader. Please grade the following essay and give feedback in JSON format with the following structure: { "score": number, "feedback": string, "details": { "grammar": string[], "vocabulary": string[], "content": string[], "organization": string[] } }. Always give response in ${lang}`
                : `You are a ${testName} writing grader. Please grade the following essay and give feedback in JSON format with the following structure: { "score": number, "feedback": string, "details": { "grammar": string[], "vocabulary": string[], "content": string[], "organization": string[] } }. Always give response in ${lang}`;

            const userPrompt = `question: ${question}\n essay: ${essayContents}`;
            Logger.log(`[ChatGPT Service] Grading essay for ${testName}`);
            Logger.log(`[ChatGPT Service] System Prompt: ${systemPrompt}`);
            Logger.log(`[ChatGPT Service] User Prompt: ${userPrompt}`);
            const completion = await this.getResFromGPT(systemPrompt, userPrompt);
            Logger.log(`[ChatGPT Service] Essay Grade Result: ${completion}`);

            try {
                const gradeResult = JSON.parse(completion);

                // Save to database
                const essayGrade = this.essayGradeRepository.create({
                    user,
                    testName,
                    testLevel,
                    question,
                    essay: essayContents,
                    score: gradeResult.score,
                    feedback: gradeResult.feedback,
                    grammar: gradeResult.details.grammar,
                    vocabulary: gradeResult.details.vocabulary,
                    content: gradeResult.details.content,
                    organization: gradeResult.details.organization,
                });

                await this.essayGradeRepository.save(essayGrade);

                return gradeResult;
            } catch (e) {
                return {
                    score: 0,
                    feedback: completion,
                    details: {
                        grammar: [],
                        vocabulary: [],
                        content: [],
                        organization: []
                    }
                };
            }
        } catch (error) {
            console.error('Error generating response:', error);
            throw error;
        }
    }

    async getQuestions(testType: TestType, testLevel: TestLevel | null, number: number, user: User): Promise<WritingQuestion[]> {
        Logger.log(`[EssayGrader Service] Getting question with ID: ${number} for testType: ${testType}, testLevel: ${testLevel}`);

        const whereCondition: any = {
            testType,
            isActive: true,
            id: number
        };

        // DELE나 IELTS의 경우에만 testLevel 조건 추가
        if (testLevel && (testType === TestType.DELE || testType === TestType.IELTS)) {
            whereCondition.testLevel = testLevel;
        }

        const questions = await this.questionRepository.find({
            where: whereCondition,
            select: ['title', 'question', 'readingPassage', 'listeningPassage', 'listeningPassageUrl', 'questionType', 'timeLimit', 'points']
        });

        Logger.log(`[EssayGrader Service] Question with ID ${number} ${questions.length > 0 ? 'found' : 'not found'}`);
        return questions;
    }

    async addQuestion(
        testType: TestType,
        testLevel: TestLevel,
        title: string,
        question: string,
        sampleAnswer: string,
        readingPassage: string,
        listeningPassage: string,
        listeningPassageUrl: string,
        user: User
    ): Promise<WritingQuestion> {
        const newQuestion = this.questionRepository.create({
            testType,
            testLevel,
            title,
            question,
            sampleAnswer,
            readingPassage,
            listeningPassage,
            listeningPassageUrl,
            description: '',
            questionType: QuestionType.ESSAY,
            isActive: true
        });

        return this.questionRepository.save(newQuestion);
    }

    async getQuestionList(testType: TestType, testLevel: TestLevel): Promise<{ title: string }[]> {
        Logger.log(`[EssayGrader Service] Getting question list for testType: ${testType}, testLevel: ${testLevel}`);

        const whereCondition: any = {
            testType,
            isActive: true
        };

        if (testLevel && (testType === TestType.DELE || testType === TestType.IELTS)) {
            whereCondition.testLevel = testLevel;
        }

        const questions = await this.questionRepository.find({
            where: whereCondition,
            select: ['title', 'id']
        });

        Logger.log(`[EssayGrader Service] Found ${questions.length} questions`);
        return questions;
    }
} 