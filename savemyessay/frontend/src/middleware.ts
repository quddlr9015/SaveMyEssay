import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getApiUrl } from '@/utils/api';
import { routing } from './i18n/routing';
import createMiddleware from 'next-intl/middleware';

const intlMiddleware = createMiddleware(routing);

// 보호된 라우트 목록
const protectedRoutes = ['/en/dashboard', '/en/essay', '/en/profile', '/ko/dashboard', '/ko/essay', '/ko/profile'];

const isDev = process.env.NODE_ENV === 'development';

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    // // 보호된 라우트인지 확인
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
    if (isProtectedRoute) {
        const locale = pathname.split('/')[1];
        const loginUrl = new URL(`/${locale}/login`, request.url);
        const refreshToken = request.cookies.get('refresh_token')?.value;
        if (!refreshToken) {
            return NextResponse.redirect(loginUrl);
        }
        return intlMiddleware(request);
    }
    return intlMiddleware(request);
}

// 미들웨어가 실행될 경로 설정
export const config = {
    matcher: [
        '/((?!_next|favicon.ico).*)' // all routes except static assets
    ]
}; 
