import { Controller, Post, Body } from '@nestjs/common';
import { ChatgptService } from './chatgpt.service';

@Controller('chatgpt')
export class ChatgptController {
    constructor(private readonly chatgptService: ChatgptService) { }

    // @Post('/generate')
    // async generateResponse(
    //     @Body('prompt') prompt: string,
    // ) {
    //     return this.chatgptService.generateResponse(prompt);
    // }

    @Post('/grade/essay')
    async gradeEssay(
        @Body('lang') lang: string,
        @Body('testName') testName: string,
        @Body('essayContents') essayContents: string,
        @Body('statement') statement: string,
    ) {
        return this.chatgptService.getEssayGrade(statement, essayContents, testName, lang);
    }
} 