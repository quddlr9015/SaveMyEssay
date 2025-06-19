import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EssayHistory } from './entities/essayHistory.entity';
import { User } from '../users/entities/user.entity';
import { WritingQuestion, TestType, TestLevel, QuestionType } from './entities/writingQuestion.entity';
import { QuestionResponseDto } from './dto/question-response.dto';
import { TargetScore } from './entities/targetScore.entity';

@Injectable()
export class SaveMyEssayService {
    private openai: OpenAI;

    constructor(
        private configService: ConfigService,
        @InjectRepository(EssayHistory)
        private essayGradeRepository: Repository<EssayHistory>,
        @InjectRepository(WritingQuestion)
        private questionRepository: Repository<WritingQuestion>,
        @InjectRepository(TargetScore)
        private targetScoreRepository: Repository<TargetScore>,
    ) {
        this.openai = new OpenAI({
            apiKey: this.configService.get<string>('OPENAI_KEY'),
        });
    }

    async getEssayHistory(user: User): Promise<EssayHistory[]> {
        try {
            Logger.log(`[EssayGrader Service] Fetching essay history for user ${user.id}`);
            const histories = await this.essayGradeRepository.find({
                where: { userId: user.id },
                order: { createdAt: 'DESC' },
            });
            Logger.log(`[EssayGrader Service] Found ${histories.length} essays for user ${user.id}`);
            return histories;
        } catch (error) {
            Logger.error(`[EssayGrader Service] Error fetching essay history: ${error.message}`);
            throw new Error('에세이 기록을 불러오는 중 오류가 발생했습니다.');
        }
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
            // user 객체 검증을 메서드 시작 부분으로 이동
            if (!user || !user.id) {
                Logger.error(`[ChatGPT Service] Invalid user: ${JSON.stringify(user)}`);
                throw new Error('유효하지 않은 사용자 정보입니다.');
            }

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

                // 필수 필드 검증
                if (!gradeResult.score || !gradeResult.feedback || !gradeResult.details) {
                    throw new Error('필수 필드가 누락되었습니다.');
                }

                // details 객체의 필수 필드 검증
                const requiredDetails = ['grammar', 'vocabulary', 'content', 'organization'];
                for (const field of requiredDetails) {
                    if (!Array.isArray(gradeResult.details[field])) {
                        throw new Error(`${field} 필드가 배열이 아닙니다.`);
                    }
                }

                try {
                    // Save to database
                    const essayGrade = this.essayGradeRepository.create({
                        userId: user.id,
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
                    Logger.log(`[ChatGPT Service] Successfully saved essay grade to database for user ${user.id}`);

                    return gradeResult;
                } catch (dbError) {
                    Logger.error(`[ChatGPT Service] Database error: ${dbError.message}`);
                    throw new Error('데이터베이스 저장 중 오류가 발생했습니다.');
                }
            } catch (e) {
                Logger.error(`[ChatGPT Service] Error processing grade result: ${e.message}`);
                Logger.error(`[ChatGPT Service] Raw completion: ${completion}`);
                return {
                    score: 0,
                    feedback: '채점 처리 중 오류가 발생했습니다.',
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

    async getQuestion(testType: TestType, testLevel: TestLevel | null, id: number, user: User): Promise<QuestionResponseDto> {
        Logger.log(`[EssayGrader Service] Getting question with ID: ${id} for testType: ${testType}, testLevel: ${testLevel}`);

        const whereCondition: any = {
            testType,
            isActive: true,
            id: id
        };

        // DELE나 IELTS의 경우에만 testLevel 조건 추가
        if (testLevel && (testType === TestType.DELE || testType === TestType.IELTS)) {
            whereCondition.testLevel = testLevel;
        }

        const question = await this.questionRepository.findOne({
            where: whereCondition,
            select: ['title', 'question', 'readingPassage', 'listeningPassage', 'listeningPassageUrl', 'questionType', 'timeLimit', 'points']
        });

        if (!question) {
            throw new NotFoundException(`Question with ID ${id} not found`);
        }

        Logger.log(`[EssayGrader Service] Question with ID ${id} found`);

        const responseDto: QuestionResponseDto = {
            title: question.title,
            question: question.question,
            readingPassage: question.readingPassage,
            listeningPassage: question.listeningPassage,
            listeningPassageUrl: question.listeningPassageUrl,
            questionType: question.questionType as QuestionType,
            timeLimit: question.timeLimit,
            points: question.points
        };

        return responseDto;
    }

    async addQuestion(
        testType: TestType,
        testLevel: TestLevel,
        category: string,
        questionType: QuestionType,
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
            category,
            questionType,
            title,
            question,
            sampleAnswer,
            readingPassage,
            listeningPassage,
            listeningPassageUrl,
            description: '',
            isActive: true
        });

        return this.questionRepository.save(newQuestion);
    }

    async getQuestionList(testType: TestType, testLevel: TestLevel, category: string, questionType: string): Promise<{ title: string }[]> {
        Logger.log(`[EssayGrader Service] Getting question list for testType: ${testType}, questionType: ${questionType}`);

        const whereCondition: any = {
            testType,
            isActive: true
        };

        // TOEFL의 경우 questionType으로만 필터링
        if (testType === TestType.TOEFL) {
            whereCondition.questionType = questionType;
        } else if (testLevel && (testType === TestType.DELE || testType === TestType.IELTS)) {
            whereCondition.testLevel = testLevel;
        }

        if (category) {
            whereCondition.category = category;
        }

        const questions = await this.questionRepository.find({
            where: whereCondition,
            select: ['title', 'id']
        });

        Logger.log(`[EssayGrader Service] Found ${questions.length} questions`);
        return questions;
    }

    async setTargetScore(testType: string, targetScore: number, user: User) {
        try {
            // 기존 목표 점수가 있는지 확인
            const existingTarget = await this.targetScoreRepository.findOne({
                where: { user: { id: user.id }, testType }
            });

            if (existingTarget) {
                // 기존 목표 점수 업데이트
                existingTarget.targetScore = targetScore;
                await this.targetScoreRepository.save(existingTarget);
                return { success: true, message: '목표 점수가 업데이트되었습니다.' };
            } else {
                // 새로운 목표 점수 생성
                const newTarget = this.targetScoreRepository.create({
                    testType,
                    targetScore,
                    user
                });
                await this.targetScoreRepository.save(newTarget);
                return { success: true, message: '목표 점수가 저장되었습니다.' };
            }
        } catch (error) {
            Logger.error(`[EssayGrader Service] Error setting target score: ${error.message}`);
            throw new Error('목표 점수 저장 중 오류가 발생했습니다.');
        }
    }

    async getTargetScore(user: User) {
        const targetScore = await this.targetScoreRepository.findOne({
            where: { user: { id: user.id } },
            order: { createdAt: 'DESC' }
        });

        return {
            testType: targetScore?.testType || null,
            targetScore: targetScore?.targetScore || null
        };
    }
} 