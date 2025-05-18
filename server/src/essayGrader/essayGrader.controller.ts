import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { EssayGraderService } from './essayGrader.service';
import { GetUser } from '@/auth/decorators/get-user.decorator';
import { User } from '@/auth/user.entity';
import { TestType, TestLevel } from './entities/writingQuestion.entity';

@Controller('essay_grader')
export class EssayGraderController {
    constructor(private readonly essayGraderService: EssayGraderService) { }

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

    @Get('/history')
    async getEssayHistory(@GetUser() user: User) {
        return this.essayGraderService.getEssayHistory(user);
    }

    @Get('/questions')
    async getQuestions(
        @Query('testType') testType: TestType,
        @Query('testLevel') testLevel: TestLevel,
        @Query('id') id: number,
        @GetUser() user: User
    ) {
        return this.essayGraderService.getQuestions(testType, testLevel, id, user);
    }

    @Post('/admin/questions')
    async addQuestion(
        @Body('testType') testType: TestType,
        @Body('testLevel') testLevel: TestLevel,
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
            title,
            question,
            sampleAnswer,
            readingPassage,
            listeningPassage,
            listeningPassageUrl,
            user
        );
    }

    @Get('/question/list')
    async getQuestionList(
        @Query('testType') testType: TestType,
        @Query('testLevel') testLevel: TestLevel,
    ) {
        return this.essayGraderService.getQuestionList(testType, testLevel);
    }
} 