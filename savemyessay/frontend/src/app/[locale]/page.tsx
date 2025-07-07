"use client";

import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { useEffect, useState } from "react";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useAuth } from "@/components/AuthContext";
import { isTokenValid } from "@/utils/api";

export default function Home() {
  const router = useRouter();
  const t = useTranslations("HomePage");
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const { accessToken, setAccessToken } = useAuth();

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        // 토큰 유효성 검사 
        const isValid = await isTokenValid(setAccessToken);
        
        if (isValid) {
          // 토큰이 유효하면 대시보드로 리다이렉트
          router.push("/dashboard");
        } else {
          // 토큰이 유효하지 않으면 제거
          setAccessToken(null);
          setIsCheckingAuth(false);
        }
      } catch (error) {
        // 에러 발생 시 토큰 제거
        setAccessToken(null);
        setIsCheckingAuth(false);
      }
    };

    checkAuthAndRedirect();
  }, [router, accessToken]);

  const handleLogoClick = () => {
    router.push("/dashboard");
  };

  // 인증 확인 중일 때 로딩 상태 표시
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-100 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-100 to-pink-100">
      {/* 네비게이션 바 */}
      <nav className="bg-white/80 shadow-md backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 flex items-center gap-2">
              <span className="inline-block animate-bounce">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="12" cy="12" r="10" fill="#6366F1" />
                  <path
                    d="M8 13h8M8 16h5"
                    stroke="#fff"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <h1
                className="text-2xl font-extrabold text-gray-900 cursor-pointer hover:text-indigo-600 transition-colors tracking-tight"
                onClick={handleLogoClick}
              >
                SaveMyEssay
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="inline-flex items-center px-5 py-2 border border-transparent text-base font-semibold rounded-full text-white bg-gradient-to-r from-indigo-500 to-pink-500 shadow-lg hover:scale-105 hover:from-pink-500 hover:to-indigo-500 transition-all duration-200"
              >
                {t("start")}
              </Link>
              <LanguageSelector />
            </div>
          </div>
        </div>
      </nav>

      {/* 히어로 섹션 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col md:flex-row items-center gap-12">
        {/* SVG 일러스트 */}
        <div className="flex-1 flex justify-center mb-8 md:mb-0">
          <svg
            width="260"
            height="200"
            viewBox="0 0 260 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="drop-shadow-xl animate-fade-in"
          >
            <ellipse cx="130" cy="170" rx="100" ry="20" fill="#E0E7FF" />
            <rect
              x="60"
              y="40"
              width="140"
              height="90"
              rx="16"
              fill="#fff"
              stroke="#6366F1"
              strokeWidth="3"
            />
            <rect x="80" y="60" width="100" height="10" rx="5" fill="#A5B4FC" />
            <rect x="80" y="80" width="60" height="10" rx="5" fill="#C7D2FE" />
            <rect x="80" y="100" width="80" height="10" rx="5" fill="#C7D2FE" />
            <circle cx="200" cy="50" r="8" fill="#F472B6" />
          </svg>
        </div>
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight leading-tight mb-4 animate-fade-in">
            SaveMyEssay
          </h1>
          <p className="mt-3 max-w-xl mx-auto md:mx-0 text-lg text-gray-600 font-medium animate-fade-in delay-100">
            {t("decription")}
          </p>
          <div className="mt-8 flex justify-center md:justify-start animate-fade-in delay-200">
            <Link
              href="/experience"
              className="inline-flex items-center px-12 py-4 border border-transparent text-xl font-bold rounded-full text-white bg-gradient-to-r from-indigo-500 to-pink-500 shadow-xl hover:scale-105 hover:from-pink-500 hover:to-indigo-500 transition-all duration-200"
            >
              {t("startButton")}
            </Link>
          </div>
        </div>
      </div>

      {/* 주요 기능 섹션 */}
      <div className="bg-white/80 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl tracking-tight">
              {t("features.title")}
            </h2>
          </div>

          <div className="mt-8 grid gap-8 grid-cols-1 md:grid-cols-3">
            {/* 기능 1 */}
            <div className="relative p-8 bg-gradient-to-br from-indigo-100 to-pink-100 rounded-2xl shadow-xl hover:scale-105 hover:shadow-2xl transition-all duration-200 group">
              <div className="text-center">
                <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-indigo-500 text-white mb-4 shadow-lg group-hover:rotate-12 transition-transform">
                  <svg
                    className="h-7 w-7"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {t("features.feature1.title")}
                </h3>
                <p className="mt-2 text-base text-gray-600">
                  {t("features.feature1.description")}
                </p>
              </div>
            </div>

            {/* 기능 2 */}
            <div className="relative p-8 bg-gradient-to-br from-pink-100 to-indigo-100 rounded-2xl shadow-xl hover:scale-105 hover:shadow-2xl transition-all duration-200 group">
              <div className="text-center">
                <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-pink-400 text-white mb-4 shadow-lg group-hover:-rotate-12 transition-transform">
                  <svg
                    className="h-7 w-7"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {t("features.feature2.title")}
                </h3>
                <p className="mt-2 text-base text-gray-600">
                  {t("features.feature2.description")}
                </p>
              </div>
            </div>

            {/* 기능 3 */}
            <div className="relative p-8 bg-gradient-to-br from-indigo-100 to-pink-100 rounded-2xl shadow-xl hover:scale-105 hover:shadow-2xl transition-all duration-200 group">
              <div className="text-center">
                <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-indigo-400 text-white mb-4 shadow-lg group-hover:rotate-6 transition-transform">
                  <svg
                    className="h-7 w-7"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {t("features.feature3.title")}
                </h3>
                <p className="mt-2 text-base text-gray-600">
                  {t("features.feature3.description")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
