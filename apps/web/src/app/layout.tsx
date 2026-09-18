import type { Metadata } from 'next';

import { AuthProvider } from '@/providers/AuthProvider';
import { WebSocketProvider } from '@/providers/WebSocketProvider';

import './globals.css';

export const metadata: Metadata = {
  title: 'DevRoom',
  description:
    'Real-time collaborative developer workspace',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <WebSocketProvider>
          {children}
          </WebSocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}