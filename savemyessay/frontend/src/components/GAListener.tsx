'use client';

import { useEffect } from 'react';
import { usePathname } from '@/i18n/routing';

declare global {
    interface Window {
        gtag?: (...args: unknown[]) => void;
    }
}

export const GAListener = () => {
    const pathname = usePathname();

    useEffect(() => {
        if (typeof window.gtag === 'function') {
            window.gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
                page_path: pathname,
            });
        }
    }, [pathname]);

    return null;
}