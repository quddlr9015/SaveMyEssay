import { Module } from '@nestjs/common';
import AuthController from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from './user.repository';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { GoogleStrategy } from './google.strategy';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: "secret1234",
      signOptions: {
        expiresIn: 60 * 60
      }
    }),
    TypeOrmModule.forFeature([User])],
  controllers: [AuthController],
  providers: [AuthService, UserRepository, JwtStrategy, GoogleStrategy],
  exports: [JwtStrategy, PassportModule]
})
export class AuthModule { }
