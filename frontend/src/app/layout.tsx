import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/header';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'PostAssist - AI-Powered LinkedIn Post Generation',
  description: 'Generate engaging LinkedIn posts about machine learning papers with multi-agent verification',
  keywords: ['LinkedIn', 'AI', 'Machine Learning', 'Post Generation', 'Research'],
  authors: [{ name: 'PostAssist Team' }],
  creator: 'PostAssist',
  publisher: 'PostAssist',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <div className="relative flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">
            {children}
          </main>
        </div>
        <Toaster
          position="top-right"
          toastOptions={{
            className: '',
            duration: 4000,
            style: {
              background: 'hsl(var(--card))',
              color: 'hsl(var(--card-foreground))',
              border: '1px solid hsl(var(--border))',
            },
          }}
        />
      </body>
    </html>
  );
}
