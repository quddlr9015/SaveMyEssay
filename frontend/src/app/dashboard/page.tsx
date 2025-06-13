'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Search, Filter, ArrowUpDown } from 'lucide-react';
import { getApiUrl } from '@/utils/api';

interface EssayHistory {
  id: number;
  testName: string;
  testLevel: string;
  question: string;
  essay: string;
  score: number;
  feedback: string;
  grammar: string[];
  vocabulary: string[];
  content: string[];
  organization: string[];
  createdAt: string;
}

interface TestStatistics {
  totalEssays: number;
  averageScore: number;
  lastEssayDate: string;
  scoreTrend: ScoreTrend[];
}

interface ScoreTrend {
  date: string;
  score: number;
  testName: string;
}

interface Statistics {
  [key: string]: TestStatistics;
}

interface TargetScore {
  testType: string;
  targetScore: number;
}

const TEST_MAX_SCORES: { [key: string]: number } = {
  'TOEFL': 30,
  'TOEIC': 200,
  'GRE': 6,
  'DELE': 25
};

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const [histories, setHistories] = useState<EssayHistory[]>([]);
  const [filteredHistories, setFilteredHistories] = useState<EssayHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedTest, setSelectedTest] = useState<string>('');
  const [statistics, setStatistics] = useState<Statistics>({});
  const [targetScore, setTargetScore] = useState<TargetScore | null>(null);

  useEffect(() => {
    // URL에서 토큰 가져오기
    const token = searchParams.get('token');
    if (token) {
      localStorage.setItem('token', token);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchHistories = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('Using token:', token);
        
        const response = await fetch(`${getApiUrl()}/essay_grader/history`, {
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          console.error('API response not ok:', response.status);
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Fetched data:', data);
        
        // 데이터가 배열인지 확인
        if (!Array.isArray(data)) {
          console.error('Expected array but got:', typeof data);
          setHistories([]);
          setFilteredHistories([]);
          return;
        }
        
        setHistories(data);
        setFilteredHistories(data);
        
        // 통계 계산
        const stats = calculateStatistics(data);
        setStatistics(stats);

        // 목표 점수가 없는 경우에만 가장 최근 에세이의 시험을 기본값으로 설정
        if (!targetScore?.testType && data.length > 0) {
          const latestEssay = data.sort((a: EssayHistory, b: EssayHistory) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )[0];
          setSelectedTest(latestEssay.testName);
        }
      } catch (error) {
        console.error('Error fetching essay histories:', error);
        setHistories([]);
        setFilteredHistories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHistories();
  }, [targetScore?.testType]); // targetScore.testType이 변경될 때마다 실행

  useEffect(() => {
    const fetchTargetScore = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${getApiUrl()}/essay_grader/target-score`, {
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setTargetScore(data);
          // 목표 점수가 있으면 해당 시험을 기본값으로 설정
          if (data.testType) {
            setSelectedTest(data.testType);
          }
        }
      } catch (error) {
        console.error('Error fetching target score:', error);
      }
    };

    fetchTargetScore();
  }, []);

  const calculateStatistics = (data: EssayHistory[]): Statistics => {
    const testGroups = data.reduce((acc, curr) => {
      if (!acc[curr.testName]) {
        acc[curr.testName] = [];
      }
      acc[curr.testName].push(curr);
      return acc;
    }, {} as { [key: string]: EssayHistory[] });

    const stats: Statistics = {};
    
    Object.entries(testGroups).forEach(([testName, essays]) => {
      const totalEssays = essays.length;
      const averageScore = essays.reduce((acc, curr) => acc + curr.score, 0) / totalEssays;
      const lastEssayDate = new Date(Math.max(...essays.map(h => new Date(h.createdAt).getTime()))).toLocaleDateString();
      
      // 일자별 점수 추이 계산
      const scoreTrend = essays
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        .map(essay => ({
          date: new Date(essay.createdAt).toLocaleDateString(),
          score: essay.score,
          testName: essay.testName
        }));

      stats[testName] = {
        totalEssays,
        averageScore,
        lastEssayDate,
        scoreTrend
      };
    });

    return stats;
  };

  useEffect(() => {
    let filtered = [...histories];
    
    // 검색어 필터링
    if (searchTerm) {
      filtered = filtered.filter(history => 
        history.testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        history.testLevel.toLowerCase().includes(searchTerm.toLowerCase()) ||
        history.question.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 시험 종류 필터링
    if (selectedTest) {
      filtered = filtered.filter(history => history.testName === selectedTest);
    }

    // 정렬
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return sortOrder === 'desc' 
          ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortBy === 'score') {
        return sortOrder === 'desc' ? b.score - a.score : a.score - b.score;
      }
      return 0;
    });

    setFilteredHistories(filtered);
  }, [histories, searchTerm, sortBy, sortOrder, selectedTest]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const currentStats = selectedTest === 'all' 
    ? Object.values(statistics).reduce((acc, curr) => ({
        totalEssays: acc.totalEssays + curr.totalEssays,
        averageScore: (acc.averageScore * acc.totalEssays + curr.averageScore * curr.totalEssays) / (acc.totalEssays + curr.totalEssays),
        lastEssayDate: new Date(Math.max(
          new Date(acc.lastEssayDate).getTime(),
          new Date(curr.lastEssayDate).getTime()
        )).toLocaleDateString(),
        scoreTrend: acc.scoreTrend.concat(curr.scoreTrend)
      }), {
        totalEssays: 0,
        averageScore: 0,
        lastEssayDate: '',
        scoreTrend: []
      })
    : statistics[selectedTest] || {
        totalEssays: 0,
        averageScore: 0,
        lastEssayDate: '',
        scoreTrend: []
      };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Studylo</h1>
      
      {/* 목표 점수 카드 */}
      {targetScore && targetScore.testType && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>현재 목표</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">시험 종류</p>
                <p className="text-xl font-semibold">{targetScore.testType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">목표 점수</p>
                <p className="text-xl font-semibold">{targetScore.targetScore}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 시험 종류 선택 */}
      <div className="flex gap-4">
        <Select value={selectedTest} onValueChange={setSelectedTest}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="시험 종류 선택" />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(statistics).map((testName) => (
              <SelectItem key={testName} value={testName}>{testName}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>전체 에세이 수</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{statistics[selectedTest]?.totalEssays || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>평균 점수</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {statistics[selectedTest]?.averageScore ? statistics[selectedTest].averageScore.toFixed(1) : '0'}
              {` / ${TEST_MAX_SCORES[selectedTest] || 100}`}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>최근 작성일</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{statistics[selectedTest]?.lastEssayDate || '-'}</p>
          </CardContent>
        </Card>
      </div>

      {/* 점수 추이 차트 */}
      {statistics[selectedTest]?.scoreTrend && statistics[selectedTest].scoreTrend.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>점수 추이</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={statistics[selectedTest].scoreTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    label={{ value: '날짜', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis 
                    label={{ value: '점수', angle: -90, position: 'insideLeft' }}
                    domain={[0, TEST_MAX_SCORES[selectedTest] || 100]}
                  />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      `${value}점`,
                      name
                    ]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    name={`${selectedTest} (만점: ${TEST_MAX_SCORES[selectedTest]}점)`}
                    stroke="#8884d8" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 검색 및 필터 */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="에세이 검색..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="정렬 기준" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">날짜</SelectItem>
              <SelectItem value="score">점수</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
          >
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 에세이 목록 */}
      <div className="space-y-4">
        {filteredHistories.map((history) => (
          <Card key={history.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold">
                      {history.testName} - {history.testLevel}
                    </h2>
                    <Badge
                      variant={history.score >= (TEST_MAX_SCORES[history.testName] || 100) * 0.8 
                        ? "default" 
                        : history.score >= (TEST_MAX_SCORES[history.testName] || 100) * 0.6 
                          ? "secondary" 
                          : "destructive"}
                    >
                      {history.score}점
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-1">
                    {history.question}
                  </p>
                </div>
                <p className="text-sm text-gray-500">
                  {new Date(history.createdAt).toLocaleDateString()}
                </p>
              </div>

              <Accordion type="single" collapsible className="w-full mt-4">
                <AccordionItem value="details" className="border-none">
                  <AccordionTrigger className="text-sm text-gray-500 hover:text-gray-700">
                    상세 내용 보기
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-6 pt-4">
                      <div>
                        <h3 className="font-semibold mb-2">문제</h3>
                        <p className="whitespace-pre-wrap text-sm">{history.question}</p>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold mb-2">에세이 내용</h3>
                        <p className="whitespace-pre-wrap text-sm">{history.essay}</p>
                      </div>

                      <div>
                        <h3 className="font-semibold mb-2">전체 피드백</h3>
                        <p className="whitespace-pre-wrap text-sm">{history.feedback}</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="font-semibold mb-2">문법 피드백</h3>
                          <ul className="list-disc pl-5 space-y-1 text-sm">
                            {history.grammar.map((item, index) => (
                              <li key={index}>{item}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h3 className="font-semibold mb-2">어휘 피드백</h3>
                          <ul className="list-disc pl-5 space-y-1 text-sm">
                            {history.vocabulary.map((item, index) => (
                              <li key={index}>{item}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h3 className="font-semibold mb-2">내용 피드백</h3>
                          <ul className="list-disc pl-5 space-y-1 text-sm">
                            {history.content.map((item, index) => (
                              <li key={index}>{item}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h3 className="font-semibold mb-2">구성 피드백</h3>
                          <ul className="list-disc pl-5 space-y-1 text-sm">
                            {history.organization.map((item, index) => (
                              <li key={index}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 