"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

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
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center space-x-4">
            <Link
              href="/dashboard"
              className="text-gray-900 hover:text-blue-600 transition-colors duration-200 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold">SaveMyEssay</h1>
                <span className="text-sm text-gray-500">{t("description")}</span>
              </div>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/dashboard"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                pathname === "/dashboard"
                  ? "text-blue-600"
                  : "text-gray-700 hover:text-blue-600"
              }`}
            >
              {t("dashboard")}
            </Link>
            <Link
              href="/essay"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                pathname === "/essay"
                  ? "text-blue-600"
                  : "text-gray-700 hover:text-blue-600"
              }`}
            >
              {t("Essay")}
            </Link>
            {isAdmin && (
              <Link
                href="/admin/questions"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  pathname === "/admin/questions"
                    ? "text-blue-600"
                    : "text-gray-700 hover:text-blue-600"
                }`}
              >
                관리자
              </Link>
            )}
            <Link
              href="/profile"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                pathname === "/profile"
                  ? "text-blue-600"
                  : "text-gray-700 hover:text-blue-600"
              }`}
            >
              {t("profile")}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
} 