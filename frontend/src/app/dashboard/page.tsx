'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';

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

export default function DashboardPage() {
  const [histories, setHistories] = useState<EssayHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistories = async () => {
      try {
        const response = await fetch('http://localhost:4000/essay_grader/history', {
          credentials: 'include',
        });
        const data = await response.json();
        setHistories(data);
      } catch (error) {
        console.error('Error fetching essay histories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistories();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">에세이 채점 히스토리</h1>
      
      <div className="space-y-6">
        {histories.map((history) => (
          <Card key={history.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-xl font-semibold">
                    {history.testName} - {history.testLevel}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {new Date(history.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Badge
                  variant={history.score >= 80 ? "success" : history.score >= 60 ? "warning" : "destructive"}
                  className="text-lg"
                >
                  점수: {history.score}
                </Badge>
              </div>

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="question">
                  <AccordionTrigger>문제</AccordionTrigger>
                  <AccordionContent>
                    <p className="whitespace-pre-wrap">{history.question}</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="essay">
                  <AccordionTrigger>에세이 내용</AccordionTrigger>
                  <AccordionContent>
                    <p className="whitespace-pre-wrap">{history.essay}</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="feedback">
                  <AccordionTrigger>전체 피드백</AccordionTrigger>
                  <AccordionContent>
                    <p className="whitespace-pre-wrap">{history.feedback}</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="details">
                  <AccordionTrigger>상세 피드백</AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-semibold mb-2">문법 피드백</h3>
                        <ul className="list-disc pl-5 space-y-1">
                          {history.grammar.map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">어휘 피드백</h3>
                        <ul className="list-disc pl-5 space-y-1">
                          {history.vocabulary.map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">내용 피드백</h3>
                        <ul className="list-disc pl-5 space-y-1">
                          {history.content.map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">구성 피드백</h3>
                        <ul className="list-disc pl-5 space-y-1">
                          {history.organization.map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
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