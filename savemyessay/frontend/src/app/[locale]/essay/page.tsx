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

const TEST_TYPES = {
  'TOEFL': ['Academic Discussion', 'Integrated'],
  'TOEIC': ['Basic', 'Advanced'],
  'SAT': ['Essay']
};

type TestType = 'TOEFL' | 'TOEIC' | 'GRE' | 'DELE' | 'SAT';
type TestLevel = 
  | 'Academic Discussion' | 'Integrated'  // TOEFL
  | 'Basic' | 'Advanced'  // TOEIC
  | 'Issue' | 'Argument'  // GRE
  | 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';  // DELE

interface WordLimits {
  TOEFL: { 'Academic Discussion': number; 'Integrated': number };
  TOEIC: { 'Basic': number; 'Advanced': number };
  GRE: { 'Issue': number; 'Argument': number };
  DELE: { 'A1': number; 'A2': number; 'B1': number; 'B2': number; 'C1': number; 'C2': number };
}

const WORD_LIMITS: WordLimits = {
  'TOEFL': { 'Academic Discussion': 100, 'Integrated': 150 },
  'TOEIC': { 'Basic': 200, 'Advanced': 300 },
  'GRE': { 'Issue': 500, 'Argument': 400 },
  'DELE': { 'A1': 100, 'A2': 200, 'B1': 300, 'B2': 400, 'C1': 500, 'C2': 600 }
};

const TEMPLATES: Record<TestType, Partial<Record<TestLevel, string>>> = {
  'TOEFL': {
    'Academic Discussion': 'I agree/disagree with [Professor\'s name] because [Your reason].\n\nFirst, [First point]\nSecond, [Second point]\nFinally, [Conclusion]',
    'Integrated': 'The reading and the lecture are both about [Topic]. The reading states that [Reading point]. However, the lecture contradicts this by saying [Lecture point].'
  },
  'TOEIC': {},
  'GRE': {},
  'DELE': {},
  'SAT': {}
};

export default function EssayPage() {
  const router = useRouter();
  const [selectedTest, setSelectedTest] = useState<string>('');
  const [targetScore, setTargetScore] = useState<string>('');
  const [showScoreInput, setShowScoreInput] = useState(false);
  const [essay, setEssay] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [defaultTest, setDefaultTest] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const t = useTranslations("EssayPage");
  
  // 사용자의 목표 점수 설정 여부 확인
  useEffect(() => {
    const checkTargetScore = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch(`${getApiUrl()}${API_ENDPOINTS.ESSAY.GET_TARGET_SCORE}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.testType) {
            router.push(`/essay/${data.testType.toLowerCase()}`);
          }
        }
      } catch (error) {
        console.error('Error checking target score:', error);
      }
    };

    checkTargetScore();
  }, [router]);

  // 자동 저장 기능
  useEffect(() => {
    const autoSave = () => {
      if (essay) {
        localStorage.setItem('draft_essay', essay);
      }
    };

    const interval = setInterval(autoSave, 30000); // 30초마다 자동 저장
    return () => clearInterval(interval);
  }, [essay]);

  // 초기 로드 시 저장된 초안 불러오기
  useEffect(() => {
    const savedDraft = localStorage.getItem('draft_essay');
    if (savedDraft) {
      setEssay(savedDraft);
    }
  }, []);

  // 초기 로드 시 저장된 기본 시험 불러오기
  useEffect(() => {
    const savedDefaultTest = localStorage.getItem('default_test');
    if (savedDefaultTest) {
      setDefaultTest(savedDefaultTest);
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
    if (!selectedTest || !selectedType || !essay) {
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
          testName: selectedTest,
          testLevel: selectedType,
          essayContents: essay,
          lang: 'en',
          timeSpent: timeElapsed
        }),
      });

      if (!response.ok) {
        throw new Error(t("submitFailed"));
      }

      const result = await response.json();
      localStorage.removeItem('draft_essay'); // 제출 후 초안 삭제
      router.push(`/essay/feedback?id=${result.id}`);
    } catch (error) {
      console.error('Error submitting essay:', error);
      alert(t("submitError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const applyTemplate = () => {
    if (selectedTest && selectedType) {
      const template = TEMPLATES[selectedTest as TestType]?.[selectedType as TestLevel];
      if (template) {
        setEssay(template);
        startTimer();
      }
    }
  };

  const wordLimit = selectedTest && selectedType 
    ? WORD_LIMITS[selectedTest as keyof WordLimits][selectedType as keyof WordLimits[keyof WordLimits]]
    : 0;

  const handleTestSelect = (test: string) => {
    setSelectedTest(test);
    setShowScoreInput(true);
  };

  const handleScoreSubmit = async () => {
    if (!targetScore) {
      alert(t("targetScoreInput"));
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert(t("loginRequired"));
        router.push('/login');
        return;
      }

      const response = await fetch(`${getApiUrl()}${API_ENDPOINTS.ESSAY.SET_TARGET_SCORE}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          testType: selectedTest,
          targetScore: parseInt(targetScore)
        }),
      });

      if (!response.ok) {
        throw new Error(t("targetScoreSaveFailed"));
      }

      // 성공적으로 저장되면 해당 시험의 writing 페이지로 이동
      router.push(`/essay/${selectedTest.toLowerCase()}`);
    } catch (error) {
      console.error('Error setting target score:', error);
      alert(t("targetScoreSaveError"));
    }
  };

  const getScoreRange = (test: string) => {
    switch (test) {
      case 'TOEFL':
        return `0-30 (Writing ${t("section")})`;
      case 'TOEIC':
        return `0-200 (Writing ${t("section")})`;
      case 'SAT':
        return `2-8 (Writing ${t("score")})`;
      default:
        return '';
    }
  };

  const getScorePlaceholder = (test: string) => {
    switch (test) {
      case 'TOEFL':
        return `${t("example")} 25`;
      case 'TOEIC':
        return `${t("example")} 180`;
      case 'SAT':
        return `${t("example")} 6`;
      default:
        return t("inputTargetScore");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto max-w-2xl text-center space-y-8 relative"
      >
        <motion.div
          animate={{ 
            x: showScoreInput ? '-100%' : 0,
            opacity: showScoreInput ? 0 : 1
          }}
          transition={{ duration: 0.5 }}
          className="absolute w-full"
        >
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-bold text-gray-900 tracking-tight mb-12"
          >
            {t("testType")}
          </motion.h1>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 gap-4"
          >
            {Object.keys(TEST_TYPES).map((test) => (
              <Button
                key={test}
                onClick={() => handleTestSelect(test)}
                className="h-16 text-xl font-medium bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 shadow-sm hover:shadow-md transition-all"
              >
                {test}
              </Button>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ x: '100%', opacity: 0 }}
          animate={{ 
            x: showScoreInput ? 0 : '100%',
            opacity: showScoreInput ? 1 : 0
          }}
          transition={{ duration: 0.5 }}
          className="absolute w-full"
        >
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-bold text-gray-900 tracking-tight mb-12"
          >
            {t("targetScore")}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            <div className="text-lg text-gray-600 mb-8">
              {selectedTest} {t("scoreRange")}: {getScoreRange(selectedTest)}
            </div>
            
            <div className="flex flex-col items-center space-y-4">
              <input
                type="number"
                value={targetScore}
                onChange={(e) => setTargetScore(e.target.value)}
                placeholder={getScorePlaceholder(selectedTest)}
                className="w-48 h-16 text-center text-2xl font-medium border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
              />
              
              <div className="flex space-x-4 mt-8">
                <Button
                  onClick={() => setShowScoreInput(false)}
                  variant="outline"
                  className="px-8 py-3"
                >
                  {t("back")}
                </Button>
                <Button
                  onClick={handleScoreSubmit}
                  className="px-8 py-3 bg-gray-900 text-white hover:bg-gray-800"
                >
                  {t("check")}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
} 