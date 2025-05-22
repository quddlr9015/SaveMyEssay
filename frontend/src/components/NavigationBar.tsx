"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavigationBar() {
  const pathname = usePathname();

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
              href="/"
              className="text-gray-900 hover:text-blue-600 transition-colors duration-200"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
            </Link>
            <h1 className="text-xl font-bold text-gray-900">에세이 채점 시스템</h1>
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
              대시보드
            </Link>
            <Link
              href="/essay"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                pathname === "/essay"
                  ? "text-blue-600"
                  : "text-gray-700 hover:text-blue-600"
              }`}
            >
              에세이
            </Link>
            <Link
              href="/profile"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                pathname === "/profile"
                  ? "text-blue-600"
                  : "text-gray-700 hover:text-blue-600"
              }`}
            >
              프로필
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
} 