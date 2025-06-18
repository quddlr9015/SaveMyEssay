"use client";

import {useTranslations} from 'next-intl';
import { Link, useRouter } from '@/i18n/routing';
import { useEffect } from "react";
import { LanguageSelector } from '@/components/LanguageSelector';

export default function Home() {
    const router = useRouter();
    const t = useTranslations('HomePage');

    useEffect(() => {
        // 로컬 스토리지에서 토큰 확인
        const token = localStorage.getItem('token');
        if (token) {
            // 토큰이 있으면 대시보드로 리다이렉트
            router.push('/dashboard');
        }
    }, [router]);
    
    const handleLogoClick = () => {
        router.push('/dashboard');
    };
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
          {/* 네비게이션 바 */}
          <nav className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16 items-center">
                <div className="flex-shrink-0">
                  <h1 
                    className="text-2xl font-bold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors" 
                    onClick={handleLogoClick}
                  >
                    SaveMyEssay
                  </h1>
                </div>
                <div className="flex items-center gap-4">
                  <Link
                    href="/login"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    {t('start')}
                  </Link>
                  <LanguageSelector />
                </div>
              </div>
            </div>
          </nav>
    
          {/* 히어로 섹션 */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center">
              <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                SaveMyEssay
              </h1>
              <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                {t('decription')}
              </p>
              <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
                <div className="rounded-md shadow">
                  <Link
                    href="/login"
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
                  >
                    {t('startButton')}
                  </Link>
                </div>
              </div>
            </div>
          </div>
    
          {/* 주요 기능 섹션 */}
          <div className="bg-white py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                  {t('features.title')}
                </h2>
              </div>
    
              <div className="mt-12 grid gap-8 grid-cols-1 md:grid-cols-3">
                {/* 기능 1 */}
                <div className="relative p-6 bg-white rounded-lg shadow-lg">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mb-4">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">{t('features.feature1.title')}</h3>
                    <p className="mt-2 text-base text-gray-500">
                      {t('features.feature1.description')}
                    </p>
                  </div>
                </div>
    
                {/* 기능 2 */}
                <div className="relative p-6 bg-white rounded-lg shadow-lg">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mb-4">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">{t('features.feature2.title')}</h3>
                    <p className="mt-2 text-base text-gray-500">
                      {t('features.feature2.description')}
                    </p>
                  </div>
                </div>
    
                {/* 기능 3 */}
                <div className="relative p-6 bg-white rounded-lg shadow-lg">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mb-4">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">{t('features.feature3.title')}</h3>
                    <p className="mt-2 text-base text-gray-500">
                      {t('features.feature3.description')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
    
          {/* 푸터 */}
          <footer className="bg-gray-50">
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <p className="text-base text-gray-500">
                  {t('footer.copyright')}
                </p>
              </div>
            </div>
          </footer>
        </div>
    );
}