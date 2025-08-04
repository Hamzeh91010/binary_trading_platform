import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import LayoutClientContent from '@/components/layout/LayoutClientContent';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { NotificationProvider } from '@/components/notifications/NotificationProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Trading Signal Dashboard',
  description: 'Advanced trading signal control and analytics platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NotificationProvider>
            <LayoutClientContent>{children}</LayoutClientContent>
            <Toaster />
          </NotificationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
