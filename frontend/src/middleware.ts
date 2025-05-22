import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getApiUrl } from '@/utils/api';

// 보호된 라우트 목록
const protectedRoutes = ['/dashboard', '/essay', '/profile'];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    console.log('Middleware checking path:', pathname);

    // 보호된 라우트인지 확인
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
    console.log('Is protected route:', isProtectedRoute);

    if (isProtectedRoute) {
        try {
            // 토큰 가져오기
            const token = request.cookies.get('access_token')?.value;
            console.log('Token from cookies:', token);

            // 세션 체크 API 호출
            const response = await fetch(`${getApiUrl()}/auth/check`, {
                credentials: 'include',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            console.log('Session check response status:', response.status);
            const data = await response.json();
            console.log('Session check response data:', data);

            // 인증되지 않은 경우 로그인 페이지로 리다이렉트
            if (!response.ok) {
                console.log('Session invalid, redirecting to login');
                const loginUrl = new URL('/login', request.url);
                return NextResponse.redirect(loginUrl);
            }

            console.log('Session valid, proceeding to protected route');
        } catch (error) {
            console.error('Session check error:', error);
            // 에러 발생 시 로그인 페이지로 리다이렉트
            const loginUrl = new URL('/login', request.url);
            return NextResponse.redirect(loginUrl);
        }
    }

    return NextResponse.next();
}

// 미들웨어가 실행될 경로 설정
export const config = {
    matcher: ['/dashboard/:path*', '/essay/:path*', '/profile/:path*'],
}; 