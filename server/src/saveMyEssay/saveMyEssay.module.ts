import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SaveMyEssayController } from './saveMyEssay.controller';
import { SaveMyEssayService } from './saveMyEssay.service';
import { EssayHistory } from './entities/essayHistory.entity';
import { WritingQuestion } from './entities/writingQuestion.entity';
import { TargetScore } from './entities/targetScore.entity';

@Module({
    imports: [ConfigModule, TypeOrmModule.forFeature([EssayHistory, WritingQuestion, TargetScore])],
    controllers: [SaveMyEssayController],
    providers: [SaveMyEssayService],
    exports: [SaveMyEssayService],
})
export class SaveMyEssayModule { } 