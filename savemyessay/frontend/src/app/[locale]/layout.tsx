import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {routing} from '../../i18n/routing';
import { Inter } from 'next/font/google';
import type {Metadata} from 'next';
import '../../app/globals.css';
import { LayoutWrapper } from '@/components/layoutwrapper';
import Script from 'next/script';

const inter = Inter({ subsets: ["latin"] });

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID;

export const metadata: Metadata = {
    title: 'SaveMyEssay',
    description: 'AI-powered essay grading system',
};

export default async function RootLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{locale: string}>;  
}) {
    const locale = (await params).locale;
    if (!routing.locales.includes(locale as 'en' | 'ko')) {
        notFound();
    }

    const messages = await getMessages({locale});

    return (
        <html lang={locale}>
          <head>
          {/* Load Google Analytics */}
          <Script 
            async src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} 
            strategy="afterInteractive" 
          />
          {/* Initialize Google Analytics */}
          <Script 
            id="gtag-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}', {
                  page_path: window.location.pathname,
                });
              `,
            }}
          />
          </head>
        <body className={inter.className}>
          <NextIntlClientProvider messages={messages}>
            <LayoutWrapper>
              {children}
            </LayoutWrapper>
          </NextIntlClientProvider>
        </body>
      </html>
    );
}