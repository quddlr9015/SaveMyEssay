"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { useEffect, useState, useRef } from "react";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useAuth } from "@/components/AuthContext";

export function NavigationBar() {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  const t = useTranslations("NavigationBar");
  const [essayDropdownOpen, setEssayDropdownOpen] = useState(false);
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const essayMenuRef = useRef<HTMLDivElement>(null);
  const adminMenuRef = useRef<HTMLDivElement>(null);
  const essayDropdownTimeout = useRef<NodeJS.Timeout | null>(null);
  const adminDropdownTimeout = useRef<NodeJS.Timeout | null>(null);
  const { accessToken } = useAuth();

  useEffect(() => {
    if (accessToken) {
      try {
        // JWT 토큰 디코딩
        const base64Url = accessToken.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        const payload = JSON.parse(jsonPayload);
        setIsAdmin(payload.role === "admin");
      } catch (error) {
        console.error("Error decoding token:", error);
        setIsAdmin(false);
      }
    } else {
      setIsAdmin(false);
    }
  }, [accessToken]);

  // Close mobile menu when pathname changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // 드롭다운 외부 클릭/마우스아웃 시 닫기 (딜레이 포함)
  const handleEssayMouseEnter = () => {
    if (essayDropdownTimeout.current) clearTimeout(essayDropdownTimeout.current);
    setEssayDropdownOpen(true);
  };
  const handleEssayMouseLeave = () => {
    essayDropdownTimeout.current = setTimeout(() => setEssayDropdownOpen(false), 120);
  };

  const handleAdminMouseEnter = () => {
    if (adminDropdownTimeout.current) clearTimeout(adminDropdownTimeout.current);
    setAdminDropdownOpen(true);
  };
  const handleAdminMouseLeave = () => {
    adminDropdownTimeout.current = setTimeout(() => setAdminDropdownOpen(false), 120);
  };

  // 홈 페이지에서는 네비게이션 바를 표시하지 않음
  if (pathname === "/") {
    return null;
  }

  // experience 경로에서는 로고와 Start 버튼만 보이게
  if (/^\/[a-z]{2}\/experience/.test(pathname) || pathname.startsWith('/experience')) {
    return (
      <nav className="bg-white/90 shadow-md backdrop-blur-md sticky top-0 z-10">
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
                href="/"
                className="text-2xl font-extrabold text-gray-900 tracking-tight hover:text-indigo-600 transition-colors cursor-pointer"
              >
                SaveMyEssay
              </Link>
            </div>
            <div className="flex items-center space-x-4">
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
    );
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
              href={accessToken ? "/dashboard" : "/"}
              className="text-2xl font-extrabold text-gray-900 tracking-tight hover:text-indigo-600 transition-colors cursor-pointer"
            >
              SaveMyEssay
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
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
            <div
              className="relative"
              onMouseEnter={handleEssayMouseEnter}
              onMouseLeave={handleEssayMouseLeave}
              ref={essayMenuRef}
            >
              <button
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none ${
                  pathname.startsWith("/essay")
                    ? "text-indigo-600"
                    : "text-gray-700 hover:text-indigo-600"
                }`}
                type="button"
              >
                {t("Essay")}
              </button>
              <div
                className={`absolute left-1/2 -translate-x-1/2 mt-2 flex flex-col gap-0 bg-white/80 shadow-md rounded-lg z-20 py-2 px-2 transition-all duration-200 ease-out backdrop-blur-md
                  ${essayDropdownOpen ? 'opacity-100 visible scale-100 translate-y-0' : 'opacity-0 invisible scale-95 -translate-y-2'}`}
                style={{ minWidth: '120px' }}
              >
                <Link
                  href="/essay/toeic"
                  className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                >
                  TOEIC
                </Link>
                <Link
                  href="/essay/toefl"
                  className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                >
                  TOEFL
                </Link>
                <Link
                  href="/essay/gre"
                  className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                >
                  GRE
                </Link>
              </div>
            </div>
            {isAdmin && (
              <div
                className="relative"
                onMouseEnter={handleAdminMouseEnter}
                onMouseLeave={handleAdminMouseLeave}
                ref={adminMenuRef}
              >
                <button
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none ${
                    pathname.startsWith("/admin")
                      ? "text-indigo-600"
                      : "text-gray-700 hover:text-indigo-600"
                  }`}
                  type="button"
                >
                  관리자
                </button>
                <div
                  className={`absolute left-1/2 -translate-x-1/2 mt-2 flex flex-col gap-0 bg-white/80 shadow-md rounded-lg z-20 py-2 px-2 transition-all duration-200 ease-out backdrop-blur-md
                    ${adminDropdownOpen ? 'opacity-100 visible scale-100 translate-y-0' : 'opacity-0 invisible scale-95 -translate-y-2'}`}
                  style={{ minWidth: '120px' }}
                >
                  <Link
                    href="/admin/questions"
                    className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                  >
                    문제 관리
                  </Link>
                  <Link
                    href="/admin/users"
                    className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                  >
                    회원 관리
                  </Link>
                </div>
              </div>
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

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <LanguageSelector />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 transition-colors"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {/* Hamburger icon */}
              <svg
                className={`${mobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              {/* Close icon */}
              <svg
                className={`${mobileMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white/95 backdrop-blur-md shadow-lg border-t border-gray-200">
          <Link
            href="/dashboard"
            className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
              pathname === "/dashboard"
                ? "text-indigo-600 bg-indigo-50"
                : "text-gray-700 hover:text-indigo-600 hover:bg-indigo-50"
            }`}
          >
            {t("dashboard")}
          </Link>
          
          {/* Mobile Essay dropdown */}
          <div className="relative">
            <button
              onClick={() => setEssayDropdownOpen(!essayDropdownOpen)}
              className={`w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors focus:outline-none ${
                pathname.startsWith("/essay")
                  ? "text-indigo-600 bg-indigo-50"
                  : "text-gray-700 hover:text-indigo-600 hover:bg-indigo-50"
              }`}
            >
              {t("Essay")}
              <svg
                className={`ml-2 inline-block h-4 w-4 transition-transform ${
                  essayDropdownOpen ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div className={`${essayDropdownOpen ? 'block' : 'hidden'} pl-4 space-y-1`}>
              <Link
                href="/essay/toeic"
                className="block px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
              >
                TOEIC
              </Link>
              <Link
                href="/essay/toefl"
                className="block px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
              >
                TOEFL
              </Link>
              <Link
                href="/essay/gre"
                className="block px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
              >
                GRE
              </Link>
            </div>
          </div>

          {/* Mobile Admin dropdown */}
          {isAdmin && (
            <div className="relative">
              <button
                onClick={() => setAdminDropdownOpen(!adminDropdownOpen)}
                className={`w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors focus:outline-none ${
                  pathname.startsWith("/admin")
                    ? "text-indigo-600 bg-indigo-50"
                    : "text-gray-700 hover:text-indigo-600 hover:bg-indigo-50"
                }`}
              >
                관리자
                <svg
                  className={`ml-2 inline-block h-4 w-4 transition-transform ${
                    adminDropdownOpen ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className={`${adminDropdownOpen ? 'block' : 'hidden'} pl-4 space-y-1`}>
                <Link
                  href="/admin/questions"
                  className="block px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                >
                  문제 관리
                </Link>
                <Link
                  href="/admin/users"
                  className="block px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                >
                  회원 관리
                </Link>
              </div>
            </div>
          )}

          <Link
            href="/profile"
            className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
              pathname === "/profile"
                ? "text-indigo-600 bg-indigo-50"
                : "text-gray-700 hover:text-indigo-600 hover:bg-indigo-50"
            }`}
          >
            {t("profile")}
          </Link>
        </div>
      </div>
    </nav>
  );
}

