import { Controller, Post, Body, Get, Query, UseGuards, Param } from '@nestjs/common';
import { EssayGraderService } from './essayGrader.service';
import { GetUser } from '@/auth/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';
import { TestType, TestLevel } from './entities/writingQuestion.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Logger } from '@nestjs/common';
import { QuestionType } from './entities/writingQuestion.entity';

@Controller('essay_grader')
export class EssayGraderController {
    constructor(private readonly essayGraderService: EssayGraderService) { }

    @UseGuards(JwtAuthGuard)
    @Post('/submit')
    async gradeEssay(
        @Body('lang') lang: string,
        @Body('testName') testName: string,
        @Body('testLevel') testLevel: string,
        @Body('essayContents') essayContents: string,
        @Body('question') question: string,
        @GetUser() user: User
    ) {
        return this.essayGraderService.getEssayGrade(testName, testLevel, question, essayContents, lang, user);
    }

    @UseGuards(JwtAuthGuard)
    @Get('/history')
    async getEssayHistory(@GetUser() user: User) {
        return this.essayGraderService.getEssayHistory(user);
    }

    @UseGuards(JwtAuthGuard)
    @Get('/questions')
    async getQuestions(
        @Query('testType') testType: TestType,
        @Query('testLevel') testLevel: TestLevel,
        @Query('id') id: number,
        @GetUser() user: User
    ) {
        return this.essayGraderService.getQuestion(testType, testLevel, id, user);
    }

    @Post('/admin/questions')
    async addQuestion(
        @Body('testType') testType: TestType,
        @Body('testLevel') testLevel: TestLevel,
        @Body('category') category: string,
        @Body('questionType') questionType: QuestionType,
        @Body('title') title: string,
        @Body('question') question: string,
        @Body('sampleAnswer') sampleAnswer: string,
        @Body('readingPassage') readingPassage: string,
        @Body('listeningPassage') listeningPassage: string,
        @Body('listeningPassageUrl') listeningPassageUrl: string,
        @GetUser() user: User
    ) {
        return this.essayGraderService.addQuestion(
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
            user
        );
    }

    @UseGuards(JwtAuthGuard)
    @Get('/question/list')
    async getQuestionList(
        @Query('testType') testType: TestType,
        @Query('testLevel') testLevel: TestLevel,
        @Query('category') category: string,
        @Query('questionType') questionType: string,
    ) {
        return this.essayGraderService.getQuestionList(testType, testLevel, category, questionType);
    }

    @UseGuards(JwtAuthGuard)
    @Post('/target-score')
    async setTargetScore(
        @Body('testType') testType: string,
        @Body('targetScore') targetScore: number,
        @GetUser() user: User
    ) {
        return this.essayGraderService.setTargetScore(testType, targetScore, user);
    }

    @UseGuards(JwtAuthGuard)
    @Get('/target-score')
    async getTargetScore(@GetUser() user: User) {
        return this.essayGraderService.getTargetScore(user);
    }
} 