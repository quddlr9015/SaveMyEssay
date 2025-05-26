'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { API_ENDPOINTS, getApiUrl } from '@/utils/api';
import { Timer } from '@/components/ui/timer';
import { motion } from 'framer-motion';

const TEST_TYPES = {
  'TOEFL': ['Independent', 'Integrated'],
  'TOEIC': ['Basic', 'Advanced'],
  'GRE': ['Issue', 'Argument'],
  'DELE': ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
};

type TestType = keyof typeof TEST_TYPES;
type TestLevel = {
  TOEFL: 'Independent' | 'Integrated';
  TOEIC: 'Basic' | 'Advanced';
  GRE: 'Issue' | 'Argument';
  DELE: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
}[TestType];

type WordLimits = {
  TOEFL: { 'Independent': number; 'Integrated': number };
  TOEIC: { 'Basic': number; 'Advanced': number };
  GRE: { 'Issue': number; 'Argument': number };
  DELE: { 'A1': number; 'A2': number; 'B1': number; 'B2': number; 'C1': number; 'C2': number };
};

const WORD_LIMITS: WordLimits = {
  'TOEFL': { 'Independent': 300, 'Integrated': 150 },
  'TOEIC': { 'Basic': 200, 'Advanced': 300 },
  'GRE': { 'Issue': 500, 'Argument': 400 },
  'DELE': { 'A1': 100, 'A2': 200, 'B1': 300, 'B2': 400, 'C1': 500, 'C2': 600 }
};

const TEMPLATES: Record<TestType, Partial<Record<TestLevel, string>>> = {
  'TOEFL': {
    'Independent': 'Do you agree or disagree with the following statement? [Your opinion here]\n\nFirst, [First reason]\nSecond, [Second reason]\nFinally, [Conclusion]',
    'Integrated': 'The reading and the lecture are both about [Topic]. The reading states that [Reading point]. However, the lecture contradicts this by saying [Lecture point].'
  },
  'TOEIC': {},
  'GRE': {},
  'DELE': {}
};

export default function EssayPage() {
  const router = useRouter();
  const [selectedTest, setSelectedTest] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [essay, setEssay] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [defaultTest, setDefaultTest] = useState<string>('');

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
      alert('모든 필드를 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('로그인이 필요합니다.');
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
        throw new Error('에세이 제출에 실패했습니다.');
      }

      const result = await response.json();
      localStorage.removeItem('draft_essay'); // 제출 후 초안 삭제
      router.push(`/essay/feedback?id=${result.id}`);
    } catch (error) {
      console.error('Error submitting essay:', error);
      alert('에세이 제출 중 오류가 발생했습니다.');
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
    setDefaultTest(test);
    localStorage.setItem('default_test', test);
  };

  const handleStartWriting = () => {
    if (defaultTest) {
      router.push(`/essay/${defaultTest.toLowerCase()}`);
    }
  };

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
          Essay Writing
        </motion.h1>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-white border border-gray-100 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="text-xl font-medium text-gray-900">기본 시험 설정</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-3 text-gray-600">기본 시험 선택</label>
                  <Select value={defaultTest} onValueChange={handleTestSelect}>
                    <SelectTrigger className="bg-white border-gray-200 text-gray-900">
                      <SelectValue placeholder="기본 시험 선택" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200">
                      {Object.keys(TEST_TYPES).map((test) => (
                        <SelectItem 
                          key={test} 
                          value={test}
                          className="text-gray-900 hover:bg-gray-50 focus:bg-gray-50"
                        >
                          {test}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(TEST_TYPES).map(([test, types]) => (
                    <Card key={test} className="border border-gray-100">
                      <CardHeader>
                        <CardTitle className="text-lg">{test}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {types.map((type) => (
                            <li key={type} className="text-sm text-gray-600">
                              • {type}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </div>
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
              <CardTitle className="text-xl font-medium text-gray-900">에세이 작성</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-6">
                  <Timer 
                    isRunning={isTimerRunning} 
                    onTick={setTimeElapsed}
                    className="text-sm font-medium text-gray-600"
                  />
                  <span className="text-sm font-medium text-gray-600">
                    {wordCount} / {wordLimit} 단어
                  </span>
                </div>
                <Button 
                  variant="outline" 
                  onClick={applyTemplate}
                  disabled={!selectedTest || !selectedType}
                  className="border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  템플릿 적용
                </Button>
              </div>
              <Textarea
                placeholder="에세이를 작성해주세요..."
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
            취소
          </Button>
          <Button 
            onClick={handleStartWriting}
            disabled={!defaultTest}
            className="bg-gray-900 text-white hover:bg-gray-800 transition-colors"
          >
            에세이 작성 시작하기
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
} 