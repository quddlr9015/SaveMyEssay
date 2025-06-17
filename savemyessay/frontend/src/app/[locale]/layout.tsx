import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {routing} from '../../i18n/routing';
import { Inter } from 'next/font/google';
import type {Metadata} from 'next';
import '../../app/globals.css';
import { LayoutWrapper } from '@/components/layoutwrapper';

const inter = Inter({ subsets: ["latin"] });

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
    if (!routing.locales.includes(locale as any)) {
        notFound();
    }

    const messages = await getMessages({locale});

    return (
        <html lang={locale}>
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