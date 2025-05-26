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

const TEST_TYPES = ['Basic', 'Advanced'];
const WORD_LIMITS = {
  'Basic': 200,
  'Advanced': 300
};

const TEMPLATES = {
  'Basic': 'The topic is about [Topic].\n\nFirst, [First point]\nSecond, [Second point]\nFinally, [Conclusion]',
  'Advanced': 'The given topic discusses [Topic].\n\nTo begin with, [First point]\nFurthermore, [Second point]\nMoreover, [Third point]\nIn conclusion, [Conclusion]'
};

export default function TOEICEssayPage() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<string>('');
  const [essay, setEssay] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);

  // 자동 저장 기능
  useEffect(() => {
    const autoSave = () => {
      if (essay) {
        localStorage.setItem('toeic_draft_essay', essay);
      }
    };

    const interval = setInterval(autoSave, 30000);
    return () => clearInterval(interval);
  }, [essay]);

  // 초기 로드 시 저장된 초안 불러오기
  useEffect(() => {
    const savedDraft = localStorage.getItem('toeic_draft_essay');
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
          testName: 'TOEIC',
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
      localStorage.removeItem('toeic_draft_essay');
      router.push(`/essay/feedback?id=${result.id}`);
    } catch (error) {
      console.error('Error submitting essay:', error);
      alert('에세이 제출 중 오류가 발생했습니다.');
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
          TOEIC Essay Writing
        </motion.h1>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-white border border-gray-100 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="text-xl font-medium text-gray-900">문제 유형</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div>
                <label className="block text-sm font-medium mb-3 text-gray-600">문제 유형</label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="bg-white border-gray-200 text-gray-900">
                    <SelectValue placeholder="문제 유형 선택" />
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
                  disabled={!selectedType}
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
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedType || !essay}
            className="bg-gray-900 text-white hover:bg-gray-800 transition-colors"
          >
            {isSubmitting ? '제출 중...' : '제출하기'}
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
} 