import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ChatgptController } from './chatgpt.controller';
import { ChatgptService } from './chatgpt.service';

@Module({
    imports: [ConfigModule],
    controllers: [ChatgptController],
    providers: [ChatgptService],
    exports: [ChatgptService],
})
export class ChatgptModule { } 