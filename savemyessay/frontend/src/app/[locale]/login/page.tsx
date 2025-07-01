"use client";

import { useRouter } from "@/i18n/routing";
import { useLocale } from "next-intl";
import { useEffect, useState } from "react";
import { API_ENDPOINTS, getApiUrl, isTokenValid } from "@/utils/api";
import { useTranslations } from "next-intl";
import { useAuth } from "@/components/AuthContext";

export default function Login() {
  const t = useTranslations("LoginPage");
  const router = useRouter();
  const locale = useLocale();
  const [isLoading, setIsLoading] = useState(true);
  const { accessToken, setAccessToken } = useAuth();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const isValid = await isTokenValid(setAccessToken);
        
        if (isValid) {
          router.push('/dashboard');
        } else {
          setAccessToken(null);
          setIsLoading(false);
        }
      } catch (error) {
        setAccessToken(null);
        setIsLoading(false);
      }
    };

    checkSession();
  }, [router, accessToken]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t("loading")}</p>
        </div>
      </div>
    );
  }

  const handleGoogleLogin = () => {
    window.location.href = `${getApiUrl()}${API_ENDPOINTS.AUTH.GOOGLE_LOGIN}?state=${locale}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-2xl shadow-xl">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-2">
            {t("title")}
          </h2>
          <p className="text-gray-600 mb-8">
            {t("description")}
          </p>
        </div>
        <div className="space-y-6">
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 rounded-xl shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {t("googleLoginButton")}
          </button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                {t("or")}
              </span>
            </div>
          </div>
          <p className="text-center text-sm text-gray-600">
            {t("termsOfService")}{' '}
            <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
              {t("termsOfServiceLink")}
            </a>
            {' '}{t("privacyPolicy")}{' '}
            <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
              {t("privacyPolicyLink")}
            </a>
            {t("agree")}
          </p>
        </div>
      </div>
    </div>
  );
} 