import { useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useRouter } from '@/i18n/routing';
import { getApiUrl } from '@/utils/api';

export const AuthGate = ({ children }: { children: React.ReactNode }) => {
    const { accessToken, setAccessToken } = useAuth();
    const router = useRouter();

    useEffect(() => {
        const fetchToken = async () => {
            try {
                const res = await fetch(`${getApiUrl()}/auth/reissue`, {
                    credentials: 'include',
                });
                if (res.status === 204) { // refresh token이 없음

                } else if (res.status === 200) {
                    const data = await res.json();
                    setAccessToken(data.accessToken);
                } else {
                    router.push('/login');
                }
            } catch (e) {
                router.push('/');
            }
        }
        if (!accessToken) {
            fetchToken();
        }
    }, [accessToken]);

    return <>{children}</>;
}