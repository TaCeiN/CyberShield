'use client';

import './globals.css';
import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const loadUser = useAuthStore((s) => s.loadUser);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return (
    <html lang="ru">
      <head>
        <title>CyberShield — Симулятор кибербезопасности</title>
        <meta name="description" content="Образовательный симулятор защиты личных данных" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="bg-page text-text-primary min-h-screen">
        {children}
      </body>
    </html>
  );
}
