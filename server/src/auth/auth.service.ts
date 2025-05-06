import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from './user.repository';
import { AuthCredentialDto } from './dto/authCredential.dto';
import * as bcrypt from "bcryptjs";
import { JwtService } from '@nestjs/jwt';
import { RequestWithUser } from './types/google.types';

@Injectable()
export class AuthService {
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
            const payload = { username };
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

        const { email, firstName, lastName, picture, accessToken } = req.user;

        return {
            message: 'User information from google',
            user: req.user,
            accessToken
        };
    }
}
