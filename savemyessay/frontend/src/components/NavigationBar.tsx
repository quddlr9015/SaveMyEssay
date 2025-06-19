"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname} from "@/i18n/routing";
import { useEffect, useState } from "react";
import { LanguageSelector } from "@/components/LanguageSelector";

export function NavigationBar() {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const t = useTranslations("NavigationBar");

  useEffect(() => {
    // 로컬 스토리지에서 토큰 확인
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    
    if (token) {
      try {
        // JWT 토큰 디코딩
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        const payload = JSON.parse(jsonPayload);
        setIsAdmin(payload.role === 'admin');
      } catch (error) {
        console.error('Error decoding token:', error);
        setIsAdmin(false);
      }
    } else {
      setIsAdmin(false);
    }
  }, []);

  // 홈 페이지에서는 네비게이션 바를 표시하지 않음
  if (pathname === "/") {
    return null;
  }

  return (
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
            <Link
              href="/dashboard"
              className="text-2xl font-extrabold text-gray-900 tracking-tight hover:text-indigo-600 transition-colors cursor-pointer"
            >
              SaveMyEssay
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/dashboard"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                pathname === "/dashboard"
                  ? "text-indigo-600"
                  : "text-gray-700 hover:text-indigo-600"
              }`}
            >
              {t("dashboard")}
            </Link>
            <Link
              href="/essay"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                pathname === "/essay"
                  ? "text-indigo-600"
                  : "text-gray-700 hover:text-indigo-600"
              }`}
            >
              {t("Essay")}
            </Link>
            {isAdmin && (
              <Link
                href="/admin/questions"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === "/admin/questions"
                    ? "text-indigo-600"
                    : "text-gray-700 hover:text-indigo-600"
                }`}
              >
                관리자
              </Link>
            )}
            <Link
              href="/profile"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                pathname === "/profile"
                  ? "text-indigo-600"
                  : "text-gray-700 hover:text-indigo-600"
              }`}
            >
              {t("profile")}
            </Link>
            <LanguageSelector />
          </div>
        </div>
      </div>
    </nav>
  );
} 