'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useRouter } from '@/i18n/routing';
import { API_ENDPOINTS, getApiUrl } from '@/utils/api';
import { Timer } from '@/components/ui/timer';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

const TEST_TYPES = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const WORD_LIMITS = {
  'A1': 100,
  'A2': 200,
  'B1': 300,
  'B2': 400,
  'C1': 500,
  'C2': 600
};

const TIME_LIMITS = {
  'A1': 20, // 20분
  'A2': 25, // 25분
  'B1': 30, // 30분
  'B2': 35, // 35분
  'C1': 40, // 40분
  'C2': 45 // 45분
};

const TEMPLATES = {
  'A1': 'El tema es [Tema].\n\nPrimero, [Primer punto]\nSegundo, [Segundo punto]\nFinalmente, [Conclusión]',
  'A2': 'El tema principal es [Tema].\n\nEn primer lugar, [Primer punto]\nEn segundo lugar, [Segundo punto]\nPara terminar, [Conclusión]',
  'B1': 'El tema que vamos a tratar es [Tema].\n\nPara empezar, [Primer punto]\nAdemás, [Segundo punto]\nPor último, [Conclusión]',
  'B2': 'El tema principal de este ensayo es [Tema].\n\nEn primer lugar, [Primer punto]\nEn segundo lugar, [Segundo punto]\nPor último, [Conclusión]',
  'C1': 'El tema que nos ocupa es [Tema].\n\nPara comenzar, [Primer punto]\nAsimismo, [Segundo punto]\nFinalmente, [Conclusión]',
  'C2': 'El tema que vamos a analizar es [Tema].\n\nEn primer término, [Primer punto]\nEn segundo término, [Segundo punto]\nPara concluir, [Conclusión]'
};

export default function DEEssayPage() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<string>('');
  const [essay, setEssay] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const t = useTranslations("EssayPage");

  // 자동 저장 기능
  useEffect(() => {
    const autoSave = () => {
      if (essay) {
        localStorage.setItem('dele_draft_essay', essay);
      }
    };

    const interval = setInterval(autoSave, 30000);
    return () => clearInterval(interval);
  }, [essay]);

  // 초기 로드 시 저장된 초안 불러오기
  useEffect(() => {
    const savedDraft = localStorage.getItem('dele_draft_essay');
    if (savedDraft) {
      setEssay(savedDraft);
    }
  }, []);

  // 글자 수 계산
  useEffect(() => {
    setWordCount(essay.split(/\s+/).filter(Boolean).length);
  }, [essay]);

  // 타이머 시작
  const startTimer = () => {
    setIsTimerRunning(true);
  };

  const handleSubmit = async () => {
    if (!selectedType || !essay) {
      alert(t("fillAllFields"));
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert(t("loginRequired"));
        router.push('/login');
        return;
      }

      const response = await fetch(`${getApiUrl()}${API_ENDPOINTS.ESSAY.SUBMIT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          testName: 'DELE',
          testLevel: selectedType,
          essayContents: essay,
          lang: 'es',
          timeSpent: timeElapsed
        }),
      });

      if (!response.ok) {
        throw new Error(t("submitFailed"));
      }

      const result = await response.json();
      localStorage.removeItem('dele_draft_essay');
      router.push(`/essay/feedback?score=${result.score}&feedback=${encodeURIComponent(result.feedback)}&details=${encodeURIComponent(JSON.stringify(result.details))}&essay=${encodeURIComponent(essay)}&question=&examType=DELE&deleLevel=${selectedType}`);
    } catch (error) {
      console.error('Error submitting essay:', error);
      alert(t("submitError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const applyTemplate = () => {
    if (selectedType) {
      const template = TEMPLATES[selectedType as keyof typeof TEMPLATES];
      if (template) {
        setEssay(template);
        startTimer();
      }
    }
  };

  const wordLimit = selectedType ? WORD_LIMITS[selectedType as keyof typeof WORD_LIMITS] : 0;

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto space-y-8 max-w-4xl"
      >
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-5xl font-bold text-center mb-12 text-gray-900 tracking-tight"
        >
          DELE Essay Writing
        </motion.h1>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-white border border-gray-100 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="text-xl font-medium text-gray-900">{t("problemType")}</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div>
                <label className="block text-sm font-medium mb-3 text-gray-600">{t("problemType")}</label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="bg-white border-gray-200 text-gray-900">
                    <SelectValue placeholder={t("problemType")} />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    {TEST_TYPES.map((type) => (
                      <SelectItem 
                        key={type} 
                        value={type}
                        className="text-gray-900 hover:bg-gray-50 focus:bg-gray-50"
                      >
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-white border border-gray-100 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="text-xl font-medium text-gray-900">{t("essayWriting")}</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center gap-2">
                    <Timer 
                      isRunning={isTimerRunning} 
                      onTick={setTimeElapsed}
                      className="text-sm font-medium text-gray-600"
                    />
                    {selectedType && (
                      <span className="text-sm font-medium text-gray-500">
                        ({t("timeLimit")}: {TIME_LIMITS[selectedType as keyof typeof TIME_LIMITS]}{t("minute")})
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-600">
                    {wordCount} / {wordLimit} {t("word")}
                  </span>
                </div>
                <Button 
                  variant="outline" 
                  onClick={applyTemplate}
                  disabled={!selectedType}
                  className="border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  {t("applyTemplate")}
                </Button>
              </div>
              <Textarea
                placeholder={t("essayWritingPlaceholder")}
                value={essay}
                onChange={(e) => setEssay(e.target.value)}
                className="min-h-[400px] resize-none bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-gray-300 focus:ring-1 focus:ring-gray-200 transition-all duration-200"
                onFocus={startTimer}
              />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex justify-end space-x-4"
        >
          <Button 
            variant="outline"
            onClick={() => router.push('/dashboard')}
            className="border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            {t("cancel")}
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedType || !essay}
            className="bg-gray-900 text-white hover:bg-gray-800 transition-colors"
          >
            {isSubmitting ? t("submitting") : t("submit")}
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
} 