import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from './user.repository';
import { AuthCredentialDto } from './dto/authCredential.dto';
import * as bcrypt from "bcryptjs";
import { JwtService } from '@nestjs/jwt';
import { RequestWithUser } from './types/google.types';
import { Logger } from '@nestjs/common';
import { GoogleSignUpDto } from './dto/google-signup.dto';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        @InjectRepository(UserRepository)
        private userRepository: UserRepository,
        private jwtService: JwtService
    ) { }

    async signup(authCredentialDto: AuthCredentialDto): Promise<void> {
        await this.userRepository.createUser(authCredentialDto);
    }

    async signIn(authCredentialDto: AuthCredentialDto): Promise<{ accessToken: string }> {
        const { username, password } = authCredentialDto;
        const user = await this.userRepository.findOne({ where: { username } });

        if (user && await bcrypt.compare(password, user.password)) {
            const payload = { 
                username,
                role: user.role 
            };
            const accessToken = this.jwtService.sign(payload);

            return { accessToken };
        } else {
            throw new UnauthorizedException('login failed');
        }
    }

    async googleLogin(req: RequestWithUser) {
        if (!req.user) {
            throw new UnauthorizedException('No user from google');
        }

        const { email, firstName, lastName, picture } = req.user;

        // 기존 사용자 확인
        const existingUser = await this.userRepository.findOne({ where: { email } });

        if (existingUser) {
            // 기존 사용자인 경우 바로 로그인
            const payload = { username: existingUser.username, role: existingUser.role };
            const accessToken = this.jwtService.sign(payload);

            this.logger.debug(`Google login successful for existing user: ${email}`);

            return {
                message: 'User information from google',
                user: existingUser,
                accessToken,
                isNewUser: false
            };
        }

        // 새로운 사용자인 경우 임시 사용자 정보 반환
        const tempUser = {
            email,
            name: `${firstName} ${lastName}`,
            profileImageUrl: picture
        };

        return {
            message: 'New user from google',
            user: tempUser,
            isNewUser: true
        };
    }

    async completeGoogleSignUp(googleSignUpDto: GoogleSignUpDto) {
        const { username, name } = googleSignUpDto;

        // 새로운 사용자 생성
        const user = await this.userRepository.findOrCreateGoogleUser(
            username, // email을 username으로 사용
            name.split(' ')[0], // firstName
            name.split(' ').slice(1).join(' '), // lastName
            '' // picture는 나중에 업데이트 가능
        );

        // JWT 토큰 생성
        const payload = { username: user.username, role: user.role };
        const accessToken = this.jwtService.sign(payload);

        return {
            message: 'Google signup completed',
            user,
            accessToken
        };
    }
}
