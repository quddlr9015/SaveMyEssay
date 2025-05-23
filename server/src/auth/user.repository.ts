import { DataSource, Repository } from "typeorm";
import { User } from "../users/entities/user.entity";
import { ConflictException, Injectable, InternalServerErrorException, NotFoundException, Logger } from "@nestjs/common";
import { AuthCredentialDto } from "./dto/authCredential.dto";
import * as bcrypt from "bcryptjs";
import { AuthProvider } from "../users/entities/user.entity";

@Injectable()
export class UserRepository extends Repository<User> {
    private readonly logger = new Logger(UserRepository.name);

    constructor(private dataSource: DataSource) {
        super(User, dataSource.createEntityManager());
    }

    async createUser(AuthCredentialDto: AuthCredentialDto): Promise<void> {
        const { username, password } = AuthCredentialDto;

        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = this.create({
            username: username,
            password: hashedPassword
        });

        try {
            await this.save(user);
        } catch (error) {
            if (error.code === '23505') {
                throw new ConflictException('Existing Username')
            } else {
                throw new InternalServerErrorException();
            }
        }
    }

    async findOrCreateGoogleUser(email: string, firstName: string, lastName: string, picture: string): Promise<User> {
        this.logger.debug(`Checking for existing Google user with email: ${email}`);

        // 먼저 기존 사용자 확인
        const existingUser = await this.findOne({ where: { email } });

        if (existingUser) {
            this.logger.debug(`Found existing user: ${email}`);
            return existingUser;
        }

        this.logger.debug(`No existing user found, creating new user for: ${email}`);

        // 새로운 사용자 생성
        const newUser = this.create({
            email,
            username: email,
            name: `${firstName} ${lastName}`,
            profileImageUrl: picture,
            provider: AuthProvider.GOOGLE,
            isEmailVerified: true
        });

        try {
            const savedUser = await this.save(newUser);
            this.logger.debug(`Successfully created new Google user: ${email}`);
            return savedUser;
        } catch (error) {
            this.logger.error(`Error creating new Google user: ${error.message}`, error.stack);
            throw new InternalServerErrorException('Failed to create new user');
        }
    }
}