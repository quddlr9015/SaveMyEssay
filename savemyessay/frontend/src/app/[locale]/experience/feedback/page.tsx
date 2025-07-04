'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/i18n/routing';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { CheckCircle } from "lucide-react";

function FeedbackContent() {
  const searchParams = useSearchParams();
  const score = searchParams.get('score');
  const feedback = searchParams.get('feedback');
  const essay = searchParams.get('essay');
  const question = searchParams.get('question');
  const examType = searchParams.get('examType');
  const deleLevel = searchParams.get('deleLevel');
  const t = useTranslations("FeedbackPage");
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">{t("title")}</h2>
            <Button variant="outline" onClick={() => {
                if (typeof window !== 'undefined' && localStorage.getItem("free_try")) {
                    router.push('/login')
                } else {
                    router.push('/experience')
                }
            }}>{t("tryAgain")}</Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 왼쪽: 에세이 내용 */}
          <Card className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">{t("testInfo")}</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">{t("testType")}: {examType}{deleLevel ? ` (${deleLevel})` : ''}</p>
                  <p className="text-sm text-gray-600">{t("question")}:</p>
                  <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{question}</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">{t("submittedEssay")}</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{essay}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* 오른쪽: 피드백 */}
          <Card className="p-6">
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">{t("score")}</h3>
                  <div className="text-3xl font-bold text-blue-600">
                    {score}
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{t("overallFeedback")}</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {feedback}
                    </p>
                  </div>
                </div>
              </div>
              {/* 회원가입/로그인 유도 CTA */}
              <div className="mt-8 p-4 bg-indigo-50 rounded-lg text-center">
                <p className="text-indigo-700 font-semibold mb-2">
                  {t("freeTryCtaTitle")}
                </p>
                <div className="flex justify-center mb-4">
                  <ul className="space-y-2">
                    {[1,2,3,4].map((idx) => {
                      return (
                        <li key={idx} className="flex items-center gap-2 text-gray-700">
                          <CheckCircle className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                          <span className="whitespace-pre-line">{t(`freeTryCtaDesc${idx}`)}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
                <Link href="/login">
                  <Button className="bg-gradient-to-r from-indigo-500 to-pink-500 text-white font-bold px-8 py-2 rounded-full shadow-lg hover:scale-105 transition-all">
                    {t("freeTryCtaButton")}
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function FeedbackPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FeedbackContent />
    </Suspense>
  );
} 