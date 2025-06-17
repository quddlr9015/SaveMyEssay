'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

function FeedbackContent() {
  const searchParams = useSearchParams();
  const score = searchParams.get('score');
  const feedback = searchParams.get('feedback');
  const details = JSON.parse(searchParams.get('details') || '{}');
  const essay = searchParams.get('essay');
  const question = searchParams.get('question');
  const examType = searchParams.get('examType');
  const deleLevel = searchParams.get('deleLevel');
  const t = useTranslations("FeedbackPage");
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">{t("title")}</h2>
        <Link href="/essay">
          <Button variant="outline">{t("newEssay")}</Button>
        </Link>
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

                {details.grammar && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{t("grammarFeedback")}</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {details.grammar.map((item: string, index: number) => (
                        <li key={index} className="text-gray-700">{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {details.vocabulary && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{t("vocabularyFeedback")}</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {details.vocabulary.map((item: string, index: number) => (
                        <li key={index} className="text-gray-700">{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {details.content && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{t("contentFeedback")}</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {details.content.map((item: string, index: number) => (
                        <li key={index} className="text-gray-700">{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {details.organization && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{t("organizationFeedback")}</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {details.organization.map((item: string, index: number) => (
                        <li key={index} className="text-gray-700">{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
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