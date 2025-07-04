"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";

const SAMPE_TYPES = ["TOEIC", "TOEFL", "GRE"];


export default function ExperienceEssayPage() {
  const t = useTranslations();
  const router = useRouter();
  

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            {t("ExperienceEssay.title", { defaultMessage: "에세이 체험하기" })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="text-lg text-center mb-4">
              {t("ExperienceEssay.selectPrompt", { defaultMessage: "체험할 문제를 선택하세요" })}
            </div>
            <div className="grid grid-cols-1 gap-4">
              {SAMPE_TYPES.map((q, idx) => (
                <Button
                  key={q}
                  className="h-16 text-lg font-medium bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 shadow-sm hover:shadow-md transition-all"
                  onClick={() => router.push(`/experience/${q.toLowerCase()}`)}
                >
                  {q}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 