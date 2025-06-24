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
        AUDIO: '/essay_grader/audio',
        SET_TARGET_SCORE: '/essay_grader/target-score',
        GET_TARGET_SCORE: '/essay_grader/target-score',
    },
} as const;

// Token management utilities
export const getToken = (): string | null => {
    if (typeof window === 'undefined') {
        return null; // Server-side
    }
    return localStorage.getItem('token');
};

export const setToken = (token: string): void => {
    if (typeof window === 'undefined') {
        return; // Server-side
    }
    localStorage.setItem('token', token);
};

export const removeToken = (): void => {
    if (typeof window === 'undefined') {
        return; // Server-side
    }
    localStorage.removeItem('token');
};

export const isTokenValid = async (): Promise<boolean> => {
    try {
        const token = getToken();
        if (!token) return false;

        const response = await fetch(`${getApiUrl()}${API_ENDPOINTS.AUTH.CHECK}`, {
            credentials: 'include',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        return response.ok;
    } catch (error) {
        console.error('Token validation error:', error);
        return false;
    }
};

export const fetchApi = async (endpoint: string, options: RequestInit = {}) => {
    const baseUrl = getApiUrl();
    const url = `${baseUrl}${endpoint}`;

    // 로컬 스토리지에서 토큰 가져오기
    const token = getToken();

    const response = await fetch(url, {
        ...options,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
            ...options.headers,
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `서버 오류: ${response.status}`);
    }

    return response.json();
};