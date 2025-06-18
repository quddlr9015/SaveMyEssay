'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { fetchApi } from '@/utils/api';
import { Howl } from 'howler';
import { Slider } from '@/components/ui/slider';
import { Volume2, VolumeX, Play, Pause } from 'lucide-react';

type DeleLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
type ExamType = 'TOEFL' | 'TOEIC' | 'GRE' | 'DELE';

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

interface QuestionListItem {
  id: number;
  title: string;
}

interface EssayFormProps {
  examType: ExamType;
}

export default function EssayForm({ examType }: EssayFormProps) {
  const router = useRouter();
  const [essay, setEssay] = useState('');
  const [deleLevel, setDeleLevel] = useState<DeleLevel | ''>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<QuestionListItem[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showListeningPassage, setShowListeningPassage] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const soundRef = useRef<Howl | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchQuestions(examType);
    return () => {
      if (soundRef.current) {
        soundRef.current.stop();
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [examType]);

  const countWords = (text: string): number => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const fetchQuestions = async (testType: ExamType, testLevel?: DeleLevel) => {
    try {
      const params = new URLSearchParams({
        testType,
        ...(testLevel && { testLevel })
      });
      
      const data = await fetchApi(`/essay_grader/question/list?${params.toString()}`);
      setQuestions(data);
    } catch (error) {
      console.error('문제 목록을 가져오는 중 오류 발생:', error);
      setError(error instanceof Error ? error.message : '문제 목록을 가져오는 중 오류가 발생했습니다.');
    }
  };

  const fetchQuestionDetail = async (id: number) => {
    try {
      const params = new URLSearchParams({
        testType: examType,
        ...(deleLevel && { testLevel: deleLevel }),
        id: id.toString()
      });
      
      const data = await fetchApi(`/essay_grader/questions?${params.toString()}`);
      if (data && data.length > 0) {
        setSelectedQuestion(data[0]);
      }
    } catch (error) {
      console.error('문제 상세를 가져오는 중 오류 발생:', error);
      setError(error instanceof Error ? error.message : '문제 상세를 가져오는 중 오류가 발생했습니다.');
    }
  };

  const handleQuestionSelect = async (questionId: number) => {
    await fetchQuestionDetail(questionId);
  };

  const handleDeleLevelChange = async (value: DeleLevel) => {
    setDeleLevel(value);
    setSelectedQuestion(null);
    await fetchQuestions(examType, value);
  };

  const handleSubmit = async () => {
    if (!essay.trim() || !selectedQuestion) return;
    if (examType === 'DELE' && !deleLevel) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchApi('/essay_grader/submit', {
        method: 'POST',
        body: JSON.stringify({
          testName: examType,
          testLevel: deleLevel,
          essayContents: essay,
          question: selectedQuestion.question
        }),
      });
      
      const queryParams = new URLSearchParams({
        score: data.score.toString(),
        feedback: data.feedback,
        details: JSON.stringify(data.details),
        essay: essay,
        question: selectedQuestion.question,
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

  const handlePlayPause = () => {
    if (!soundRef.current) {
      soundRef.current = new Howl({
        src: [selectedQuestion?.listeningPassageUrl || ''],
        volume: volume,
        onplay: () => {
          setIsPlaying(true);
          progressIntervalRef.current = setInterval(() => {
            setCurrentTime(soundRef.current?.seek() || 0);
          }, 1000);
        },
        onpause: () => {
          setIsPlaying(false);
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
          }
        },
        onstop: () => {
          setIsPlaying(false);
          setCurrentTime(0);
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
          }
        },
        onload: () => {
          setDuration(soundRef.current?.duration() || 0);
        },
      });
    }

    if (isPlaying) {
      soundRef.current.pause();
    } else {
      soundRef.current.play();
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (soundRef.current) {
      soundRef.current.volume(newVolume);
    }
    if (newVolume === 0) {
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
  };

  const handleMute = () => {
    if (soundRef.current) {
      if (isMuted) {
        soundRef.current.volume(volume);
        setIsMuted(false);
      } else {
        soundRef.current.volume(0);
        setIsMuted(true);
      }
    }
  };

  const handleSeek = (value: number[]) => {
    const seekTime = value[0];
    if (soundRef.current) {
      soundRef.current.seek(seekTime);
      setCurrentTime(seekTime);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {examType === 'DELE' && (
          <div className="space-y-2">
            <label className="text-sm font-medium">DELE 레벨</label>
            <Select value={deleLevel} onValueChange={handleDeleLevelChange}>
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

        {questions.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium">문제 선택</label>
            <Select value={selectedQuestion?.id?.toString()} onValueChange={(value) => {
              handleQuestionSelect(parseInt(value));
            }}>
              <SelectTrigger>
                <SelectValue placeholder="문제를 선택하세요" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {questions.map((q) => (
                  <SelectItem key={q.id} value={q.id.toString()}>
                    {q.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {selectedQuestion && (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium">문제</label>
              <div className="p-4 bg-gray-50 rounded-md whitespace-pre-wrap">
                {selectedQuestion.question}
              </div>
            </div>

            {selectedQuestion.readingPassage && (
              <div className="space-y-2">
                <label className="text-sm font-medium">읽기 지문</label>
                <div className="p-4 bg-gray-50 rounded-md whitespace-pre-wrap">
                  {selectedQuestion.readingPassage}
                </div>
              </div>
            )}

            {selectedQuestion.listeningPassage && (
              <div className="space-y-2">
                <label className="text-sm font-medium">듣기 지문</label>
                {selectedQuestion.listeningPassageUrl && (
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-md">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handlePlayPause}
                        className="h-8 w-8"
                      >
                        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                      <div className="flex-1">
                        <Slider
                          value={[currentTime]}
                          max={duration}
                          step={1}
                          onValueChange={handleSeek}
                          className="mb-2"
                        />
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>{formatTime(currentTime)}</span>
                          <span>{formatTime(duration)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleMute}
                          className="h-8 w-8"
                        >
                          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                        </Button>
                        <Slider
                          value={[volume]}
                          max={1}
                          step={0.1}
                          onValueChange={handleVolumeChange}
                          className="w-24"
                        />
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setShowListeningPassage(!showListeningPassage)}
                    >
                      {showListeningPassage ? '듣기 지문 숨기기' : '듣기 지문 보기'}
                    </Button>
                    {showListeningPassage && (
                      <div className="p-4 bg-gray-50 rounded-md whitespace-pre-wrap mt-2">
                        {selectedQuestion.listeningPassage}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        )}

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
          disabled={!essay.trim() || !selectedQuestion || isLoading}
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
  );
} 