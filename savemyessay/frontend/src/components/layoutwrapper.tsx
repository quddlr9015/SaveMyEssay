// components/LayoutWrapper.tsx
'use client';

import { usePathname } from '@/i18n/routing';
import { NavigationBar } from '@/components/NavigationBar';
import Footer from '@/components/Footer';
import { AuthProvider } from './AuthContext';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Check if we're on a locale-only root like `/en` or `/ko`
  const isHomePage = /^\/[a-z]{2}\/?$/.test(pathname);

  return (
    <AuthProvider>
      {!isHomePage && <NavigationBar />}
      <main className="min-h-[calc(100vh-3.5rem)]">{children}</main>
      <Footer />
    </AuthProvider>
  );
}
