'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { API_ENDPOINTS, getApiUrl } from '@/utils/api';
import { Progress } from '@/components/ui/progress';
import { Timer } from '@/components/ui/timer';
import { motion } from 'framer-motion';

const TEST_TYPES = ['Independent', 'Integrated'];
const WORD_LIMITS = {
  'Independent': 300,
  'Integrated': 150
};

const TEMPLATES = {
  'Independent': 'Do you agree or disagree with the following statement? [Your opinion here]\n\nFirst, [First reason]\nSecond, [Second reason]\nFinally, [Conclusion]',
  'Integrated': 'The reading and the lecture are both about [Topic]. The reading states that [Reading point]. However, the lecture contradicts this by saying [Lecture point].'
};

interface Question {
  id: number;
  title: string;
  question: string;
  readingPassage?: string;
  listeningPassage?: string;
  listeningPassageUrl?: string;
  questionType: string;
  timeLimit: number;
  points: number;
}

export default function TOEFLEssayPage() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<string>('');
  const [essay, setEssay] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showListeningPassage, setShowListeningPassage] = useState(false);

  // 오디오 URL 유효성 검사 및 변환
  const getAudioUrl = (url: string): string => {
    try {
      // Google Cloud Storage URL인지 확인
      if (url.includes('storage.googleapis.com')) {
        // URL이 이미 서명된 URL인지 확인
        if (url.includes('X-Goog-Signature')) {
          return url;
        }
        // 필요한 경우 여기에 URL 서명 로직 추가
        return url;
      }
      return url;
    } catch (error) {
      console.error('Error processing audio URL:', error);
      return url; // 에러 발생 시 원본 URL 반환
    }
  };

  // 오디오 로드 에러 처리
  const handleAudioError = (event: React.SyntheticEvent<HTMLAudioElement, Event>) => {
    console.error('Error loading audio:', event);
    alert('오디오 파일을 불러오는데 실패했습니다.');
  };

  // 문제 목록 가져오기
  useEffect(() => {
    const fetchQuestions = async () => {
      if (!selectedType) return;
      
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        const response = await fetch(
          `${getApiUrl()}${API_ENDPOINTS.ESSAY.QUESTION_LIST}?testType=TOEFL&testLevel=${selectedType}&category=ESSAY&questionType=${selectedType}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            credentials: 'include',
          }
        );

        if (!response.ok) {
          throw new Error('문제 목록을 가져오는데 실패했습니다.');
        }

        const data = await response.json();
        setQuestions(data);
      } catch (error) {
        console.error('Error fetching questions:', error);
        alert('문제 목록을 가져오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, [selectedType, router]);

  // 선택된 문제 가져오기
  const fetchSelectedQuestion = async (questionId: number) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(
        `${getApiUrl()}${API_ENDPOINTS.ESSAY.QUESTIONS}?testType=TOEFL&testLevel=${selectedType}&id=${questionId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error('문제를 가져오는데 실패했습니다.');
      }

      const data = await response.json();
      if (data && data.length > 0) {
        setSelectedQuestion(data[0]);
      }
    } catch (error) {
      console.error('Error fetching question:', error);
      alert('문제를 가져오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 자동 저장 기능
  useEffect(() => {
    const autoSave = () => {
      if (essay) {
        localStorage.setItem('toefl_draft_essay', essay);
      }
    };

    const interval = setInterval(autoSave, 30000);
    return () => clearInterval(interval);
  }, [essay]);

  // 초기 로드 시 저장된 초안 불러오기
  useEffect(() => {
    const savedDraft = localStorage.getItem('toefl_draft_essay');
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
    if (!selectedType || !essay || !selectedQuestion) {
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
          testName: 'TOEFL',
          testLevel: selectedType,
          essayContents: essay,
          question: selectedQuestion.question,
          lang: 'en',
          timeSpent: timeElapsed
        }),
      });

      if (!response.ok) {
        throw new Error('에세이 제출에 실패했습니다.');
      }

      const result = await response.json();
      localStorage.removeItem('toefl_draft_essay');
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
          TOEFL Essay Writing
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
              <div className="space-y-6">
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

                {selectedType && (
                  <div>
                    <label className="block text-sm font-medium mb-3 text-gray-600">문제 선택</label>
                    <div className="grid gap-4">
                      {isLoading ? (
                        <div className="text-center py-4">로딩 중...</div>
                      ) : (
                        questions.map((question) => (
                          <Card
                            key={question.id}
                            className={`cursor-pointer transition-all ${
                              selectedQuestion?.id === question.id
                                ? 'border-blue-500 bg-blue-50'
                                : 'hover:border-gray-300'
                            }`}
                            onClick={() => fetchSelectedQuestion(question.id)}
                          >
                            <CardContent className="p-4">
                              <h3 className="font-medium">{question.title}</h3>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {selectedQuestion && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-white border border-gray-100 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-xl font-medium text-gray-900">문제</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="prose max-w-none">
                  <h3 className="text-lg font-medium mb-4">{selectedQuestion.title}</h3>
                  <p className="whitespace-pre-wrap">{selectedQuestion.question}</p>
                  {selectedQuestion.readingPassage && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-md">
                      <h4 className="font-medium mb-2">Reading Passage:</h4>
                      <p className="whitespace-pre-wrap">{selectedQuestion.readingPassage}</p>
                    </div>
                  )}
                  {selectedQuestion.listeningPassage && (
                    <div className="mt-4">
                      <Button
                        variant="outline"
                        onClick={() => setShowListeningPassage(!showListeningPassage)}
                        className="mb-2"
                      >
                        {showListeningPassage ? '리스닝 지문 숨기기' : '리스닝 지문 보기'}
                      </Button>
                      {showListeningPassage && (
                        <div className="p-4 bg-gray-50 rounded-md">
                          <h4 className="font-medium mb-2">Listening Passage:</h4>
                          <p className="whitespace-pre-wrap">{selectedQuestion.listeningPassage}</p>
                        </div>
                      )}
                    </div>
                  )}
                  {selectedQuestion.listeningPassageUrl && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Listening Audio:</h4>
                      <audio 
                        controls 
                        className="w-full"
                        src={selectedQuestion.listeningPassageUrl}
                      >
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

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
              <Progress 
                value={(wordCount / wordLimit) * 100} 
                className="mb-6 h-1 bg-gray-100"
              />
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
            disabled={isSubmitting || !selectedType || !essay || !selectedQuestion}
            className="bg-gray-900 text-white hover:bg-gray-800 transition-colors"
          >
            {isSubmitting ? '제출 중...' : '제출하기'}
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
} 