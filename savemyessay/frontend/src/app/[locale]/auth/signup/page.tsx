"use client";

import { useState, Suspense, Fragment } from "react";
import { useSearchParams } from "next/navigation";
import { API_ENDPOINTS, getApiUrl } from "@/utils/api";
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useTranslations } from "next-intl";
import { useAuth } from "@/components/AuthContext";

interface TermSection {
  id: string;
  title: string;
  content: React.ReactNode;
  required: boolean;
}

const TEST_TYPES = {
  'TOEFL': ['Academic Discussion', 'Integrated'],
  'TOEIC': ['Basic', 'Advanced'],
  'GRE': ['Issue']
};

function SignUpForm() {
  const t = useTranslations("SignUpPage");

  const getScoreRange = (test: string) => {
    switch (test) {
      case 'TOEFL':
        return `0-30 (Writing ${t("score")})`;
      case 'TOEIC':
        return `0-200 (Writing ${t("score")})`;
      case 'GRE':
        return `0-6 (Writing ${t("score")})`;
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
      case 'GRE':
        return `${t("example")} 5.5`;
      default:
        return t("inputTargetScore");
    }
  };
  const [selectedTest, setSelectedTest] = useState<string>('');
  const [targetScore, setTargetScore] = useState<string>('');
  const [showScoreInput, setShowScoreInput] = useState(false);
  const { setAccessToken } = useAuth();
  const terms: TermSection[] = [
    {
      id: 'all',
      title: t("termSection.all.title"),
      content: t("termSection.all.content"),
      required: true
    },
    {
      id: 'service',
      title: t("termSection.service.title"),
      content: (
        <div className="space-y-4">
          <p>제1조 (목적)</p>
          <p>본 약관은 SaveMyEssay(이하 &quot;회사&quot;)가 제공하는 서비스의 이용조건 및 절차, 회사와 회원 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.</p>
          <p>제2조 (용어의 정의)</p>
          <p>본 약관에서 사용하는 용어의 정의는 다음과 같습니다:</p>
          <ul className="list-disc pl-6">
            <li>&quot;서비스&quot;란 회사가 제공하는 모든 서비스를 의미합니다.</li>
            <li>&quot;회원&quot;이란 회사와 서비스 이용계약을 체결한 자를 말합니다.</li>
            <li>&quot;이용자&quot;란 회사의 서비스를 이용하는 회원을 말합니다.</li>
          </ul>
        </div>
      ),
      required: true
    },
    {
      id: 'privacy',
      title: t("termSection.privacy.title"),
      content: (
        <div className="space-y-4">
          <p>1. 수집하는 개인정보 항목</p>
          <ul className="list-disc pl-6">
            <li>이메일 주소</li>
            <li>이름</li>
          </ul>
          <p>2. 개인정보의 수집 및 이용목적</p>
          <ul className="list-disc pl-6">
            <li>회원 식별 및 가입의사 확인</li>
            <li>서비스 제공 및 계약의 이행</li>
            <li>회원 관리</li>
          </ul>
        </div>
      ),
      required: true
    },
    {
      id: 'marketing',
      title: t("termSection.marketing.title"),
      content: (
        <div className="space-y-4">
          <p>마케팅 정보 수신에 동의하시면 다음과 같은 혜택과 정보를 받으실 수 있습니다:</p>
          <ul className="list-disc pl-6">
            <li>신규 서비스 및 이벤트 안내</li>
            <li>맞춤형 서비스 제공</li>
            <li>서비스 이용에 대한 통계 분석</li>
          </ul>
        </div>
      ),
      required: false
    }
  ];
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    username: searchParams.get("email") || "",
    name: searchParams.get("name") || "",
  });
  const [agreements, setAgreements] = useState<{ [key: string]: boolean }>({});
  const [selectedTerm, setSelectedTerm] = useState<TermSection | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 필수 약관 동의 확인
    const requiredTerms = ['service', 'privacy'];
    const allRequiredAgreed = requiredTerms.every(term => agreements[term]);
    
    if (!allRequiredAgreed) {
      alert(t("requiredTerms"));
      return;
    }

    // 시험을 선택했는데 목표점수를 입력하지 않은 경우
    if (selectedTest && !targetScore.trim()) {
      alert(t("targetScoreRequired"));
      return;
    }
    
    try {
      const response = await fetch(`${getApiUrl()}/auth/google/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        // 토큰 저장
        if (data.accessToken) {
          setAccessToken(data.accessToken);

          if (selectedTest && targetScore) {
            const scoreResponse = await fetch(`${getApiUrl()}${API_ENDPOINTS.ESSAY.SET_TARGET_SCORE}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${data.accessToken}`,
              },
              body: JSON.stringify({
                testType: selectedTest,
                targetScore: parseInt(targetScore)
              }),
            });

            if (!scoreResponse.ok) {
              throw new Error(t("targetScoreSaveFailed"));
            }
          }
        }
        window.location.href = '/dashboard';
      } else {
        console.error("회원가입 실패");
      }
    } catch (error) {
      console.error("회원가입 중 오류 발생:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTestSelect = (test: string) => {
    if (selectedTest === test) {
      // 같은 버튼을 다시 누르면 선택 해제
      setSelectedTest('');
      setShowScoreInput(false);
      setTargetScore('');
    } else {
      // 다른 버튼을 누르면 선택
      setSelectedTest(test);
      setShowScoreInput(true);
      setTargetScore('');
    }
  };

  const handleAgreementChange = (termId: string, checked: boolean) => {
    if (termId === 'all') {
      const newAgreements = terms.reduce((acc, term) => ({
        ...acc,
        [term.id]: checked
      }), {});
      setAgreements(newAgreements);
    } else {
      const newAgreements = {
        ...agreements,
        [termId]: checked
      };
      
      // 모든 약관(선택 약관 포함)이 동의되었는지 확인
      const allTermsAgreed = terms
        .filter(term => term.id !== 'all')
        .every(term => newAgreements[term.id]);
      
      setAgreements({
        ...newAgreements,
        all: allTermsAgreed
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {t("title")}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {t("description")}
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                {t("name")}
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder={t("name")}
              />
            </div>
            
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">{t("testType")}</h3>
              <div className="grid grid-cols-1 gap-3">
                {Object.keys(TEST_TYPES).map((test) => (
                  <button
                    key={test}
                    type="button"
                    onClick={() => handleTestSelect(test)}
                    className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                      selectedTest === test 
                        ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md' 
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold">{test}</span>
                      {selectedTest === test && (
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {TEST_TYPES[test as keyof typeof TEST_TYPES].join(' • ')}
                    </p>
                  </button>
                ))}
              </div>
            </div>
            
            {showScoreInput && (
              <div className="mt-4">
                <label htmlFor="targetScore" className="block text-sm font-medium text-gray-700">
                  {t("targetScore")} <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    id="targetScore"
                    name="targetScore"
                    type="number"
                    required
                    value={targetScore}
                    onChange={(e) => setTargetScore(e.target.value)}
                    placeholder={getScorePlaceholder(selectedTest)}
                    className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    {getScoreRange(selectedTest)}
                  </p>
                </div>
              </div>
            )}
            
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">{t("termsOfService")}</h3>
              <div className="space-y-4">
                {terms.map((term) => (
                  <div key={term.id} className="flex items-center justify-between">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={agreements[term.id] || false}
                        onChange={(e) => handleAgreementChange(term.id, e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm font-medium text-gray-900">
                        {term.title}
                        {term.required && <span className="text-red-500 ml-1">*</span>}
                      </span>
                    </label>
                    {term.id !== 'all' && (
                      <button
                        type="button"
                        onClick={() => setSelectedTerm(term)}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        {t("more")}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {t("submit")}
            </button>
          </div>
        </form>
      </div>

      <Transition show={selectedTerm !== null} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setSelectedTerm(null)}>
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </TransitionChild>

          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <TransitionChild
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <DialogPanel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6">
                  <div className="absolute right-0 top-0 pr-4 pt-4">
                    <button
                      type="button"
                      className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
                      onClick={() => setSelectedTerm(null)}
                    >
                      <span className="sr-only">Close</span>
                      <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                      <DialogTitle as="h3" className="text-2xl font-semibold leading-6 text-gray-900 mb-6">
                        {selectedTerm?.title}
                      </DialogTitle>
                      <div className="mt-2 text-gray-600">
                        {selectedTerm?.content}
                      </div>
                    </div>
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}

export default function SignUp() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignUpForm />
    </Suspense>
  );
} 
