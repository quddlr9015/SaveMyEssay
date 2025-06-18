import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getApiUrl } from '@/utils/api';
import { routing } from './i18n/routing';
import createMiddleware from 'next-intl/middleware';

const intlMiddleware = createMiddleware(routing);

// 보호된 라우트 목록
const protectedRoutes = ['/en/dashboard', '/en/essay', '/en/profile', '/ko/dashboard', '/ko/essay', '/ko/profile'];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    // 보호된 라우트인지 확인
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

    if (isProtectedRoute) {
        const locale = pathname.split('/')[1];

        try {
            // 토큰 가져오기
            const token = request.cookies.get('access_token')?.value;
            // 세션 체크 API 호출
            const response = await fetch(`${getApiUrl()}/auth/check`, {
                credentials: 'include',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            // 인증되지 않은 경우 로그인 페이지로 리다이렉트
            if (!response.ok) {
                const loginUrl = new URL(`/${locale}/login`, request.url);
                return NextResponse.redirect(loginUrl);
            }

        } catch (error) {
            // 에러 발생 시 로그인 페이지로 리다이렉트
            const loginUrl = new URL(`/${locale}/login`, request.url);
            return NextResponse.redirect(loginUrl);
        }
    }
    return intlMiddleware(request);
}

// 미들웨어가 실행될 경로 설정
export const config = {
    matcher: [
        '/((?!_next|favicon.ico).*)' // all routes except static assets
    ]
}; 
