'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/hooks/useLanguage';

type ExamType = 'TOEFL' | 'TOEIC' | 'GRE' | 'DELE';
type DeleLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
type Language = 'Korean' | 'English' | 'Japanese' | 'Chinese' | 'Vietnamese' | 'Thai' | 'Indonesian' | 'French' | 'German' | 'Spanish' | 'Italian' | 'Portuguese' | 'Russian';

export default function EssayPage() {
  const router = useRouter();
  const [essay, setEssay] = useState('');
  const [examType, setExamType] = useState<ExamType | ''>('');
  const [deleLevel, setDeleLevel] = useState<DeleLevel | ''>('');
  const [isLoading, setIsLoading] = useState(false);
  const { language } = useLanguage();
  const [question, setQuestion] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const countWords = (text: string): number => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };
  
  const handleSubmit = async () => {
    if (!essay.trim() || !examType) return;
    if (examType === 'DELE' && !deleLevel) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:4000/essay_grader/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lang: language,
          testName: examType,
          testLevel: deleLevel,
          essayContents: essay,
          question
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `서버 오류: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('서버 응답:', data);
      
      // 피드백 페이지로 이동
      const queryParams = new URLSearchParams({
        score: data.score.toString(),
        feedback: data.feedback,
        details: JSON.stringify(data.details),
        essay: essay,
        question: question,
        examType: examType,
        deleLevel: deleLevel || ''
      });
      
      router.push(`/essay/feedback?${queryParams.toString()}`);
      
    } catch (error) {
      console.error('에세이 제출 중 오류 발생:', error);
      setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="p-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">시험 유형</label>
            <Select value={examType} onValueChange={(value: ExamType) => {
              setExamType(value);
              if (value !== 'DELE') setDeleLevel('');
            }}>
              <SelectTrigger>
                <SelectValue placeholder="시험 유형을 선택하세요" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="TOEFL">TOEFL</SelectItem>
                <SelectItem value="TOEIC">TOEIC</SelectItem>
                <SelectItem value="GRE">GRE</SelectItem>
                <SelectItem value="DELE">DELE</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {examType === 'DELE' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">DELE 레벨</label>
              <Select value={deleLevel} onValueChange={(value: DeleLevel) => setDeleLevel(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="DELE 레벨을 선택하세요" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="A1">A1</SelectItem>
                  <SelectItem value="A2">A2</SelectItem>
                  <SelectItem value="B1">B1</SelectItem>
                  <SelectItem value="B2">B2</SelectItem>
                  <SelectItem value="C1">C1</SelectItem>
                  <SelectItem value="C2">C2</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">시험 문제</label>
            <Textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="시험 문제를 입력하세요..."
              className="min-h-[100px] resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">에세이</label>
            <Textarea
              value={essay}
              onChange={(e) => setEssay(e.target.value)}
              placeholder="에세이를 입력하세요..."
              className="min-h-[500px] resize-none"
            />
            <div className="text-sm text-gray-500 text-right">
              {countWords(essay)}단어
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!essay.trim() || !examType || isLoading}
            className="w-full"
          >
            {isLoading ? '제출 중...' : '제출하기'}
          </Button>
          
          {error && (
            <div className="text-red-500 text-sm mt-2">
              {error}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
} 