'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getApiUrl } from '@/utils/api';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { AuthGate } from '@/components/AuthGate';

const TEST_TYPES = {
  TOEFL: 'TOEFL',
  TOEIC: 'TOEIC',
  DELE: 'DELE',
  IELTS: 'IELTS',
  TEPS: 'TEPS',
  GRE: 'GRE'
};

const TEST_LEVELS = {
  // TOEFL levels
  TOEFL_ACADEMIC_DISCUSSION: 'Academic Discussion',
  TOEFL_INTEGRATED: 'Integrated',
  
  GRE_ISSUE: 'Issue',
  // DELE levels
  // DELE_A1: 'A1',
  // DELE_A2: 'A2',
  // DELE_B1: 'B1',
  // DELE_B2: 'B2',
  // DELE_C1: 'C1',
  // DELE_C2: 'C2',
  
  // IELTS levels
  IELTS_BAND_4: 'Band 4',
  IELTS_BAND_5: 'Band 5',
  IELTS_BAND_6: 'Band 6',
  IELTS_BAND_7: 'Band 7',
  IELTS_BAND_8: 'Band 8',
  IELTS_BAND_9: 'Band 9',

  // TOEIC levels
  TOEIC_PICTURE: 'Picture',
  TOEIC_WRITTEN_REQUEST: 'Written Request',
  TOEIC_OPINION: 'Opinion'
};

const CATEGORY_TYPES = {
  ESSAY: 'Essay',
  READING: 'Reading',
  LISTENING: 'Listening',
  SPEAKING: 'Speaking',
};

const QUESTION_TYPES = {
  ACADEMIC_DISCUSSION: 'Academic Discussion',
  INTEGRATED: 'Integrated',
  ISSUE: 'Issue',
  WRITE_A_SENTENCE_BASED_ON_A_PICTURE: 'Write a sentence based on a picture',
  RESPOND_TO_A_WRITTEN_REQUEST: 'Respond to a written request',
  WRITE_AN_OPINION_ESSAY: 'Write an opinion essay'
}; 

export default function AdminQuestionsPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    testType: '',
    testLevel: '',
    category: '',
    questionType: '',
    title: '',
    question: '',
    sampleAnswer: '',
    readingPassage: '',
    listeningPassage: '',
    listeningPassageUrl: ''
  });
  const { accessToken } = useAuth();

  useEffect(() => {
    checkAdminPermission();
  }, []);

  const checkAdminPermission = () => {
    if (!accessToken) {
      alert('로그인이 필요합니다.');
      router.push('/login');
      return;
    }

    try {
      // JWT 토큰 디코딩
      const base64Url = accessToken.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      const payload = JSON.parse(jsonPayload);
      if (payload.role !== 'admin') {
        alert('관리자 권한이 필요합니다.');
        router.push('/dashboard');
        return;
      }
      
      setIsAdmin(true);
    } catch (error) {
      console.error('Error decoding token:', error);
      alert('토큰 확인 중 오류가 발생했습니다.');
      router.push('/login');
      return;
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!accessToken) {
        alert('로그인이 필요합니다.');
        router.push('/login');
        return;
      }

      const response = await fetch(`${getApiUrl()}/essay_grader/admin/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        if (response.status === 403) {
          alert('관리자 권한이 필요합니다.');
          router.push('/dashboard');
          return;
        }
        throw new Error('문제 추가에 실패했습니다.');
      }

      alert('문제가 성공적으로 추가되었습니다.');
      setFormData({
        testType: '',
        testLevel: '',
        category: '',
        questionType: '',
        title: '',
        question: '',
        sampleAnswer: '',
        readingPassage: '',
        listeningPassage: '',
        listeningPassageUrl: ''
      });
    } catch (error) {
      console.error('Error adding question:', error);
      alert('문제 추가 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">로딩 중...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <AuthGate>
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>문제 추가</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label>시험 유형</label>
                  <Select
                    value={formData.testType}
                    onValueChange={(value) => handleSelectChange('testType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="시험 유형 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(TEST_TYPES).map(([key, value]) => (
                        <SelectItem key={key} value={key}>
                          {value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label>시험 레벨</label>
                  <Select
                    value={formData.testLevel}
                    onValueChange={(value) => handleSelectChange('testLevel', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="시험 레벨 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(TEST_LEVELS).map(([key, value]) => (
                        <SelectItem key={key} value={key}>
                          {value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label>카테고리</label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => handleSelectChange('category', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="카테고리 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(CATEGORY_TYPES).map(([key, value]) => (
                        <SelectItem key={key} value={key}>
                          {value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label>문제 유형</label>
                  <Select
                    value={formData.questionType}
                    onValueChange={(value) => handleSelectChange('questionType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="문제 유형 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(QUESTION_TYPES).map(([key, value]) => (
                        <SelectItem key={key} value={key}>
                          {value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <label>제목</label>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="문제 제목을 입력하세요"
                  required
                />
              </div>
              <div className="space-y-2">
                <label>문제 내용</label>
                <Textarea
                  name="question"
                  value={formData.question}
                  onChange={handleChange}
                  placeholder="문제 내용을 입력하세요"
                  required
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <label>모범 답안</label>
                <Textarea
                  name="sampleAnswer"
                  value={formData.sampleAnswer}
                  onChange={handleChange}
                  placeholder="모범 답안을 입력하세요"
                  required
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <label>독해 지문</label>
                <Textarea
                  name="readingPassage"
                  value={formData.readingPassage}
                  onChange={handleChange}
                  placeholder="독해 지문을 입력하세요"
                  required
                  rows={6}
                />
              </div>
              <div className="space-y-2">
                <label>듣기 지문 (선택사항)</label>
                <Textarea
                  name="listeningPassage"
                  value={formData.listeningPassage}
                  onChange={handleChange}
                  placeholder="듣기 지문을 입력하세요"
                  rows={6}
                />
              </div>
              <div className="space-y-2">
                <label>듣기 오디오 URL (선택사항)</label>
                <Input
                  name="listeningPassageUrl"
                  value={formData.listeningPassageUrl}
                  onChange={handleChange}
                  placeholder="듣기 오디오 URL을 입력하세요"
                />
              </div>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? '추가 중...' : '문제 추가'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AuthGate>
  );
} 