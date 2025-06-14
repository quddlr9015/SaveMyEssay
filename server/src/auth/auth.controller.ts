import { Body, Controller, Get, Logger, Post, Req, Res, UseGuards, UsePipes, ValidationPipe, UnauthorizedException } from '@nestjs/common';
import { AuthCredentialDto } from './dto/authCredential.dto';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { GoogleSignUpDto } from './dto/google-signup.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

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

    @Get('/check')
    @UseGuards(JwtAuthGuard)
    async checkSession(@Req() req) {
        try {
            Logger.log('Session check request received');
            Logger.log('Request headers:', req.headers);

            if (!req.user) {
                Logger.warn('User not found in request');
                throw new UnauthorizedException('User not authenticated');
            }

            Logger.log('User authenticated:', req.user);
            return { authenticated: true, user: req.user };
        } catch (error) {
            Logger.error('Authentication failed:', error);
            throw new UnauthorizedException('Authentication failed');
        }
    }

    // Google 소셜 로그인 구현
    // 1. '/google' 엔드포인트는 사용자가 접근하면 AuthGuard('google')에 의해 구글 OAuth 인증 페이지로 리다이렉트됩니다.
    // 2. 이 과정에서 passport-google-oauth20 전략이 사용되며, google.strategy.ts에 정의된 설정(clientID, clientSecret 등)을 사용합니다.
    // 3. 사용자가 구글에서 인증을 완료하면 callbackURL로 지정된 '/google/callback' 엔드포인트로 리다이렉트됩니다.
    @Get('/google/login')
    @UseGuards(AuthGuard('google'))
    async googleAuth() {
        Logger.log("Google social login start");
        // 실제 구현 코드는 없으며, AuthGuard('google')가 자동으로 구글 로그인 페이지로 리다이렉트 처리를 합니다.
        // 이 메서드는 호출되지 않습니다.
    }

    // 구글 인증 후 콜백 처리
    // 1. 사용자가 구글에서 인증을 완료하면 이 엔드포인트로 리다이렉트됩니다.
    // 2. AuthGuard('google')는 google.strategy.ts의 validate() 메서드를 호출하여 사용자 정보를 처리합니다.
    // 3. validate() 메서드에서 반환된 사용자 정보는 req.user에 저장됩니다.
    // 4. 이후 authService.googleLogin()을 호출하여 JWT 토큰 발급 등의 후속 처리를 수행합니다.
    @Get('/google/callback')
    @UseGuards(AuthGuard('google'))
    async googleAuthRedirect(@Req() req, @Res() res: Response) {
        const result = await this.authService.googleLogin(req);
        Logger.debug("Google Login successed: ", result);

        // 새로운 사용자인 경우 회원가입 페이지로 리다이렉트
        if (result.isNewUser) {
            const params = new URLSearchParams({
                email: result.user.email,
                name: result.user.name,
            });
            return res.redirect(`https://www.savemyessay.com/auth/signup?${params.toString()}`);
        }

        // 기존 사용자인 경우 대시보드로 리다이렉트
        if (!result.accessToken) {
            throw new UnauthorizedException('Access token not found');
        }
        Logger.log('setting accessToken');
        res.cookie('access_token', result.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'none',
            maxAge: 24 * 60 * 60 * 1000 // 24시간
        });
        Logger.log('accessToken set');
        // 토큰을 URL 파라미터로도 전달
        const params = new URLSearchParams();
        params.append('token', result.accessToken);
        res.redirect(`https://www.savemyessay.com/dashboard?${params.toString()}`);
    }

    @Post('/google/signup')
    async googleSignUp(@Body() googleSignUpDto: GoogleSignUpDto) {
        return this.authService.completeGoogleSignUp(googleSignUpDto);
    }

    @Post('/test')
    @UseGuards(AuthGuard())
    test(
        @Req() req
    ) {
        console.log(req);
    }

    @Post('/logout')
    @UseGuards(JwtAuthGuard)
    async logout(@Req() req, @Res() res: Response) {
        try {
            Logger.log('Logout request received');

            // 쿠키에서 access_token 제거
            res.clearCookie('access_token', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'none'
            });

            return res.status(200).json({
                message: '로그아웃되었습니다.',
                success: true
            });
        } catch (error) {
            Logger.error('Logout failed:', error);
            throw new UnauthorizedException('로그아웃 중 오류가 발생했습니다.');
        }
    }
}