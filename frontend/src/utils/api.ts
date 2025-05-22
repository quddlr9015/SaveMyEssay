export const getApiUrl = () => {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
};

export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        LOGOUT: '/auth/logout',
        REFRESH: '/auth/refresh',
        CHECK: '/auth/check',
        GOOGLE_LOGIN: '/auth/google/login',
    },
    ESSAY: {
        SUBMIT: '/essay_grader/submit',
        QUESTION_LIST: '/essay_grader/question/list',
        QUESTIONS: '/essay_grader/questions',
    },
} as const;

export const fetchApi = async (endpoint: string, options: RequestInit = {}) => {
    const baseUrl = getApiUrl();
    const url = `${baseUrl}${endpoint}`;

    // 로컬 스토리지에서 토큰 가져오기
    const token = localStorage.getItem('token');
    console.log('Current token:', token); // 토큰 확인

    const response = await fetch(url, {
        ...options,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
            ...options.headers,
        },
    });

    console.log('Response status:', response.status); // 응답 상태 확인
    console.log('Response headers:', Object.fromEntries(response.headers.entries())); // 응답 헤더 확인

    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Error response:', errorData); // 에러 응답 확인
        throw new Error(errorData?.message || `서버 오류: ${response.status}`);
    }

    return response.json();
}; 