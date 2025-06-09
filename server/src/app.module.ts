import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './configs/typeorm.config';
import { AuthModule } from './auth/auth.module';
import { EssayGraderModule } from './essayGrader/essayGrader.module';
import { UsersModule } from './users/users.module';
import { loadSecretsAuto } from './configs/secrets.config';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ...(process.env.NODE_ENV === 'development' ?
        { ignoreEnvFile: false} : // load .env file in development
        { ignoreEnvFile: true}) // ignore .env file in production
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => typeOrmConfig(configService),
      inject: [ConfigService]
    }),
    AuthModule,
    EssayGraderModule,
    UsersModule],
})
export class AppModule { }
