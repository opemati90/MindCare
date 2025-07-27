import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Mindcare - Patient Portal',
  description: 'Your healthcare, simplified. Book appointments, view medical records, and communicate with your healthcare providers.',
  keywords: ['healthcare', 'patient portal', 'appointments', 'medical records'],
  authors: [{ name: 'Mindcare Team' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  openGraph: {
    title: 'Mindcare - Patient Portal',
    description: 'Your healthcare, simplified.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mindcare - Patient Portal',
    description: 'Your healthcare, simplified.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
