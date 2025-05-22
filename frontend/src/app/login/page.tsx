"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { API_ENDPOINTS, getApiUrl } from "@/utils/api";

export default function Login() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('No token found, staying on login page');
          setIsLoading(false);
          return;
        }

        console.log('Checking session with token:', token);
        
        const response = await fetch(`${getApiUrl()}${API_ENDPOINTS.AUTH.CHECK}`, {
          credentials: "include",
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        console.log('Session check response status:', response.status);
        
        if (response.ok) {
          console.log('Session valid, redirecting to dashboard');
          router.push('/dashboard');
        } else {
          console.log('Session invalid, staying on login page');
          localStorage.removeItem('token');
          setIsLoading(false);
        }
      } catch (error) {
        console.error("세션 체크 에러:", error);
        localStorage.removeItem('token');
        setIsLoading(false);
      }
    };

    checkSession();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  const handleGoogleLogin = () => {
    window.location.href = `${getApiUrl()}${API_ENDPOINTS.AUTH.GOOGLE_LOGIN}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            로그인
          </h2>
        </div>
        <div className="mt-8 space-y-6">
          <button
            onClick={handleGoogleLogin}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Google로 로그인
          </button>
        </div>
      </div>
    </div>
  );
} 