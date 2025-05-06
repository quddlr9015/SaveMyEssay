import { Request } from 'express';

export interface GoogleUser {
    email: string;
    firstName: string;
    lastName: string;
    picture: string;
    accessToken: string;
}

export interface RequestWithUser extends Request {
    user: GoogleUser;
} 