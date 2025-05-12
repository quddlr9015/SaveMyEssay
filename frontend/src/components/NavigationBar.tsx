'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Home, FileText } from 'lucide-react';

export function NavigationBar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-14 items-center px-4">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "flex items-center gap-2 cursor-pointer",
                pathname === '/dashboard' && "bg-gray-100"
              )}
            >
              <Home className="h-4 w-4" />
              <span>대시보드</span>
            </Button>
          </Link>
          <Link href="/essay">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "flex items-center gap-2 cursor-pointer",
                pathname === '/essay' && "bg-gray-100"
              )}
            >
              <FileText className="h-4 w-4" />
              <span>에세이</span>
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
} 