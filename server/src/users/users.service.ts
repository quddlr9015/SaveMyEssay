import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersRepository } from './users.repository';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name);

    constructor(
        @InjectRepository(UsersRepository)
        private usersRepository: UsersRepository,
    ) { }

    async findOne(id: string): Promise<User> {
        this.logger.debug(`Finding user with ID: ${id}`);
        const user = await this.usersRepository.findOne({ where: { id } });
        if (!user) {
            this.logger.warn(`User with ID ${id} not found`);
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        this.logger.debug(`Found user with ID: ${id}`);
        return user;
    }

    async findByUsername(username: string): Promise<User | null> {
        this.logger.debug(`Finding user with username: ${username}`);
        const user = await this.usersRepository.findOne({ where: { username } });
        this.logger.debug(`User search result for username ${username}: ${user ? 'found' : 'not found'}`);
        return user;
    }

    async getCurrentUser(userId: string): Promise<Omit<User, 'password'>> {
        this.logger.debug(`Getting current user with ID: ${userId}`);
        const user = await this.findOne(userId);
        const { password, ...result } = user;
        this.logger.debug(`Retrieved current user with ID: ${userId}`);
        return result;
    }
} 