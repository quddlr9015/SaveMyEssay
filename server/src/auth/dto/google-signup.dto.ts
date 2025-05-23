import { IsString, IsNotEmpty } from 'class-validator';

export class GoogleSignUpDto {
    @IsString()
    @IsNotEmpty()
    username: string;

    @IsString()
    @IsNotEmpty()
    name: string;
} 