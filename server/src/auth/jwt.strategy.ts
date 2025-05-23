import { PassportStrategy } from "@nestjs/passport";
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { InjectRepository } from "@nestjs/typeorm";
import { UserRepository } from "./user.repository";
import { User } from "../users/entities/user.entity";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        @InjectRepository(User)
        private userRepository: UserRepository
    ) {
        super({
            secretOrKey: 'secret1234',
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
        });
    }

    async validate(payload) {
        const { username } = payload;
        const user: User | null = await this.userRepository.findOne({
            where: [
                { username },
                { email: username }
            ]
        });

        if (!user) {
            throw new UnauthorizedException();
        }

        return user;
    }
}