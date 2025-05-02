import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class ChatgptService {
    private openai: OpenAI;

    constructor(private configService: ConfigService) {
        this.openai = new OpenAI({
            apiKey: this.configService.get('OPENAI_KEY'),
        });
    }

    async getResFromGPT(systemPrompt: string, userPrompt: string): Promise<string> {
        try {
            const completion = await this.openai.chat.completions.create({
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                model: 'gpt-4.1-mini',
            });

            return completion.choices[0].message.content ?? '응답을 생성할 수 없습니다.';
        } catch (error) {
            console.error('Error generating response:', error);
            throw error;
        }
    }

    async getEssayGrade(statement: string, essayContents: string, testName: string, lang: string): Promise<string> {
        try {
            const systemPrompt = `You are a ${testName} writing grader. Please grade the following essay and give feedback. Always give response in ${lang}`;
            const userPrompt = `statement: ${statement} \n essay: ${essayContents}`;
            Logger.log("System Prompt: ", systemPrompt);
            Logger.log("User Prompt: ", userPrompt);
            const completion = await this.getResFromGPT(systemPrompt, userPrompt);


            return completion;
        } catch (error) {
            console.error('Error generating response:', error);
            throw error;
        }
    }
} 