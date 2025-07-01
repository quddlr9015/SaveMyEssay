'use client';

import { createContext, useContext, useState } from 'react';

type AuthContextType = {
    accessToken: string | null;
    setAccessToken: (token: string | null) => void;
}

const AuthContext = createContext<AuthContextType>({
    accessToken: null,
    setAccessToken: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    return (
        <AuthContext.Provider value={{ accessToken, setAccessToken }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);