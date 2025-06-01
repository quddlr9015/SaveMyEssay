import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EssayGraderController } from './essayGrader.controller';
import { EssayGraderService } from './essayGrader.service';
import { EssayHistory } from './entities/essayHistory.entity';
import { WritingQuestion } from './entities/writingQuestion.entity';
import { TargetScore } from './entities/targetScore.entity';

@Module({
    imports: [ConfigModule, TypeOrmModule.forFeature([EssayHistory, WritingQuestion, TargetScore])],
    controllers: [EssayGraderController],
    providers: [EssayGraderService],
    exports: [EssayGraderService],
})
export class EssayGraderModule { } 