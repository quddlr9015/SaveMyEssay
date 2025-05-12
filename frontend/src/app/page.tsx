"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 세션 체크
    const checkSession = async () => {
      try {
        const response = await fetch("http://localhost:4000/auth/check", {
          credentials: "include",
        });
        
        if (response.ok) {
          router.push("/dashboard");
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error("세션 체크 에러:", error);
        setIsLoading(false);
      }
    };

    checkSession();
  }, [router]);

  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  const handleGoogleLogin = () => {
    // 직접 Google OAuth URL로 리다이렉트
    window.location.href = "http://localhost:4000/auth/google/login";
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">에세이 채점 시스템</h1>
          <p className="mt-2 text-gray-600">구글 계정으로 로그인하여 시작하세요</p>
        </div>
        <div className="mt-8">
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
              />
            </svg>
            구글 계정으로 로그인
          </button>
        </div>
      </div>
    </div>
  );
}
