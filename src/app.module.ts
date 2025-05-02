import { Module } from '@nestjs/common';
import { BoardsModule } from './boards/boards.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './configs/typeorm.config';
import { AuthModule } from './auth/auth.module';
import { ChatgptModule } from './chatgpt/chatgpt.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    BoardsModule,
    AuthModule,
    ChatgptModule],
})
export class AppModule { }
