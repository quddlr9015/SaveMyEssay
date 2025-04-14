import { Body, Controller, Post, Req, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthCredentialDto } from './dto/authCredential.dto';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export default class AuthController {
    constructor(private authService: AuthService) { };

    @Post('/signup')
    signUp(
        @Body(ValidationPipe) authCredentialDto: AuthCredentialDto
    ): Promise<void> {
        return this.authService.signup(authCredentialDto);
    }

    @Post('/signin')
    signIp(
        @Body(ValidationPipe) authCredentialDto: AuthCredentialDto
    ): Promise<{ accessToken: string }> {
        return this.authService.signIn(authCredentialDto);
    }

    @Post('/test')
    @UseGuards(AuthGuard())
    test(
        @Req() req
    ) {
        console.log(req);

    }
}