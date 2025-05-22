'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { fetchApi } from '@/utils/api';

interface UserProfile {
  id: string;
  username: string;
  name: string | null;
  email: string | null;
  profileImageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
  provider: 'local' | 'google' | 'github' | 'facebook';
  isActive: boolean;
  isEmailVerified: boolean;
  preferences: {
    language: string;
    theme: 'light' | 'dark';
    notifications: {
      email: boolean;
      push: boolean;
    };
  } | null;
}

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const data = await fetchApi('/users/me');
      setProfile(data);
    } catch (error) {
      toast.error('프로필 정보를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">로딩중...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">프로필 정보를 불러올 수 없습니다.</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getProviderName = (provider: string) => {
    const providers = {
      local: '이메일',
      google: '구글',
      github: '깃허브',
      facebook: '페이스북'
    };
    return providers[provider as keyof typeof providers] || provider;
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>내 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-6">
            <Avatar className="h-24 w-24">
              <AvatarImage 
                src={profile.profileImageUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${profile.username}`} 
                alt="프로필 이미지" 
              />
              <AvatarFallback>{profile.username[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            
            <div className="w-full max-w-md space-y-4">
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-500">아이디</div>
                <div className="text-lg">{profile.username}</div>
              </div>
              
              {profile.name && (
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-500">이름</div>
                  <div className="text-lg">{profile.name}</div>
                </div>
              )}
              
              {profile.email && (
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-500">이메일</div>
                  <div className="text-lg">
                    {profile.email}
                    {profile.isEmailVerified && (
                      <span className="ml-2 text-sm text-green-600">(인증됨)</span>
                    )}
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-500">로그인 방식</div>
                <div className="text-lg">{getProviderName(profile.provider)}</div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-500">가입일</div>
                <div className="text-lg">{new Date(profile.createdAt).toLocaleDateString('ko-KR')}</div>
              </div>
              
              {profile.lastLoginAt && (
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-500">마지막 로그인</div>
                  <div className="text-lg">{new Date(profile.lastLoginAt).toLocaleDateString('ko-KR')}</div>
                </div>
              )}
              
              {profile.preferences && (
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-500">설정</div>
                  <div className="text-lg">
                    <div>언어: {profile.preferences.language}</div>
                    <div>테마: {profile.preferences.theme === 'light' ? '라이트' : '다크'}</div>
                    <div>알림: {profile.preferences.notifications.email ? '이메일 ' : ''}{profile.preferences.notifications.push ? '푸시' : ''}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 