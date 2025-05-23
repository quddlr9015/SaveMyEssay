import { DataSource, Repository } from "typeorm";
import { User } from "./entities/user.entity";
import { ConflictException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { AuthCredentialDto } from "../auth/dto/authCredential.dto";
import * as bcrypt from "bcryptjs";

@Injectable()
export class UsersRepository extends Repository<User> {
    constructor(private dataSource: DataSource) {
        super(User, dataSource.createEntityManager());
    }

    async createUser(authCredentialDto: AuthCredentialDto): Promise<void> {
        const { username, password } = authCredentialDto;

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
} 