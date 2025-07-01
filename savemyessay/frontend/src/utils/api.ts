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

export const isTokenValid = async (setAccessToken: (token: string | null) => void): Promise<boolean> => {
    try {
        // reissue access token and validate it
        const response = await fetch(`${getApiUrl()}/auth/reissue`, {
            credentials: 'include',
        });
        if (response.ok && response.status === 200) {
            const { accessToken: newAccessToken } = await response.json();
            setAccessToken(newAccessToken);
            return true;
        }
        return false;
    } catch (error) {
        return false;
    }
};

export const fetchApi = async (endpoint: string, options: RequestInit = {}, accessToken: string | null, setAccessToken: (token: string | null) => void) => {
    const baseUrl = getApiUrl();
    const url = `${baseUrl}${endpoint}`;
    const makeRequest = async (token: string | null) => {
        return await fetch(url, {
            ...options,
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }),
                ...options.headers,
            },
        })
    }

    const response = await makeRequest(accessToken);

    if (response.ok) return response.json();
    const errorData = await response.json().catch(() => null);
    const errorMessage = errorData?.message || `서버 오류: ${response.status}`;
    if (errorMessage === 'jwt expired') {
        // reissue access token
        const reIssueRes = await fetch(`${getApiUrl()}/auth/reissue`, {
            credentials: 'include',
        });
        if (reIssueRes.ok && reIssueRes.status === 200) {
            const { accessToken: newAccessToken } = await reIssueRes.json();
            setAccessToken(newAccessToken); // set new access token
            console.log('newAccessToken', newAccessToken);
            const retryRes = await makeRequest(newAccessToken);
            if (!retryRes.ok) {
                const retryErrorData = await retryRes.json().catch(() => null);
                throw new Error(retryErrorData?.message || `서버 오류: ${retryRes.status}`);
            }
            return retryRes.json();
        } else {
            const reIssueErrorData = await reIssueRes.json().catch(() => null);
            throw new Error(reIssueErrorData?.message || `토큰 재발급 실패: ${reIssueRes.status}`);
        }
    } else throw new Error(errorMessage); // user need to login again
};