'use client';

import { useRef, useState, useCallback } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface CertificateProps {
  displayName: string;
  username: string;
  totalXp: number;
  league: string;
  accuracy: number;
  securityLevel: number;
  completedModules: number;
  totalModules: number;
}

const LEAGUE_TITLES: Record<string, string> = {
  newbie: 'Новичок',
  defender: 'Защитник',
  expert: 'Эксперт',
  master: 'Мастер',
};

function generateCertificateId(userId: string, date: string): string {
  const raw = `${userId}-${date}-cybershield`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `CS-${Math.abs(hash).toString(36).toUpperCase().padStart(8, '0')}`;
}

export default function Certificate({
  displayName,
  username,
  totalXp,
  league,
  accuracy,
  securityLevel,
  completedModules,
  totalModules,
}: CertificateProps) {
  const certRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const downloadPDF = useCallback(async () => {
    if (!certRef.current) return;
    setIsGenerating(true);

    try {
      const canvas = await html2canvas(certRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight);
      pdf.save(`CyberShield_Certificate_${displayName}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      setIsGenerating(false);
    }
  }, [displayName]);

  const today = new Date();
  const dateStr = today.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const certId = generateCertificateId(username, today.toISOString().split('T')[0]);
  const leagueTitle = LEAGUE_TITLES[league] || 'Новичок';

  return (
    <div className="space-y-4">
      {/* Certificate preview */}
      <div
        ref={certRef}
        className="relative rounded-xl overflow-hidden bg-white select-none"
        style={{
          aspectRatio: '1.414 / 1',
          maxWidth: '100%',
        }}
      >
        {/* Decorative border */}
        <div className="absolute inset-0 p-3">
          <div
            className="w-full h-full rounded-lg"
            style={{
              background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 25%, #43a047 50%, #2e7d32 75%, #1b5e20 100%)',
            }}
          >
            <div className="w-full h-full m-0.5 rounded-md bg-white p-6 md:p-8 flex flex-col items-center justify-center relative overflow-hidden">
              {/* Corner ornaments */}
              <div className="absolute top-2 left-2 w-12 h-12 border-t-2 border-l-2 border-green-700 rounded-tl-lg" />
              <div className="absolute top-2 right-2 w-12 h-12 border-t-2 border-r-2 border-green-700 rounded-tr-lg" />
              <div className="absolute bottom-2 left-2 w-12 h-12 border-b-2 border-l-2 border-green-700 rounded-bl-lg" />
              <div className="absolute bottom-2 right-2 w-12 h-12 border-b-2 border-r-2 border-green-700 rounded-br-lg" />

              {/* Subtle background pattern */}
              <div
                className="absolute inset-0 opacity-5"
                style={{
                  backgroundImage: 'radial-gradient(circle at 25% 25%, #2e7d32 1px, transparent 1px), radial-gradient(circle at 75% 75%, #2e7d32 1px, transparent 1px)',
                  backgroundSize: '30px 30px',
                }}
              />

              {/* Content */}
              <div className="relative z-10 text-center px-4">
                {/* Shield icon */}
                <div className="mx-auto mb-3">
                  <svg width="48" height="48" viewBox="0 0 32 32" fill="none">
                    <circle cx="16" cy="16" r="14" fill="#e8f5e9" />
                    <path d="M8 12c1-4 4-6 8-6s7 2 8 6" stroke="#2e7d32" strokeWidth="2" strokeLinecap="round" />
                    <path d="M10 10l-2-3M14 8l-1-4M18 8l1-4M22 10l2-3" stroke="#2e7d32" strokeWidth="1.5" strokeLinecap="round" />
                    <circle cx="12" cy="15" r="1.5" fill="#1a1a2e" />
                    <circle cx="20" cy="15" r="1.5" fill="#1a1a2e" />
                    <ellipse cx="16" cy="18" rx="2" ry="1.5" fill="#2e7d32" />
                    <path d="M11 21c2 2 8 2 10 0" stroke="#2e7d32" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>

                {/* Title */}
                <h2
                  className="font-bold tracking-wider uppercase"
                  style={{
                    fontSize: 'clamp(14px, 3vw, 24px)',
                    color: '#1b5e20',
                    fontFamily: 'Georgia, serif',
                  }}
                >
                  Сертификат
                </h2>
                <p
                  className="font-semibold tracking-widest uppercase"
                  style={{
                    fontSize: 'clamp(10px, 2vw, 16px)',
                    color: '#2e7d32',
                    fontFamily: 'Georgia, serif',
                  }}
                >
                  CyberShield Academy
                </p>

                {/* Decorative line */}
                <div className="flex items-center justify-center gap-2 my-3">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent to-green-700 max-w-[60px]" />
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="#2e7d32">
                    <path d="M8 0l2.5 5 5.5.8-4 3.9.9 5.3L8 12.5 3.1 15l.9-5.3-4-3.9L5.5 5z" />
                  </svg>
                  <div className="h-px flex-1 bg-gradient-to-l from-transparent to-green-700 max-w-[60px]" />
                </div>

                {/* Awarded to */}
                <p
                  className="text-gray-500 uppercase tracking-wider"
                  style={{ fontSize: 'clamp(8px, 1.5vw, 12px)' }}
                >
                  Награждается
                </p>

                {/* Name */}
                <h1
                  className="font-bold my-2"
                  style={{
                    fontSize: 'clamp(16px, 3.5vw, 32px)',
                    color: '#1a1a2e',
                    fontFamily: 'Georgia, serif',
                  }}
                >
                  {displayName || username}
                </h1>

                {/* Description */}
                <p
                  className="text-gray-600 max-w-md mx-auto leading-relaxed"
                  style={{ fontSize: 'clamp(8px, 1.4vw, 12px)' }}
                >
                  За успешное прохождение всех {totalModules} модулей обучения
                  по основам кибербезопасности и продемонстрированные знания
                  в области защиты от фишинга, скимминга, социальной инженерии
                  и безопасного использования паролей.
                </p>

                {/* Stats grid */}
                <div className="grid grid-cols-4 gap-3 mt-4">
                  <div className="bg-green-50 rounded-lg p-2">
                    <p className="font-bold text-green-700" style={{ fontSize: 'clamp(10px, 2vw, 18px)' }}>
                      {accuracy}%
                    </p>
                    <p className="text-gray-500" style={{ fontSize: 'clamp(6px, 1vw, 9px)' }}>Точность</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-2">
                    <p className="font-bold text-green-700" style={{ fontSize: 'clamp(10px, 2vw, 18px)' }}>
                      {totalXp} XP
                    </p>
                    <p className="text-gray-500" style={{ fontSize: 'clamp(6px, 1vw, 9px)' }}>Опыт</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-2">
                    <p className="font-bold text-green-700" style={{ fontSize: 'clamp(10px, 2vw, 18px)' }}>
                      {securityLevel}
                    </p>
                    <p className="text-gray-500" style={{ fontSize: 'clamp(6px, 1vw, 9px)' }}>Защита</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-2">
                    <p className="font-bold" style={{ fontSize: 'clamp(10px, 2vw, 18px)', color: '#1565c0' }}>
                      {leagueTitle}
                    </p>
                    <p className="text-gray-500" style={{ fontSize: 'clamp(6px, 1vw, 9px)' }}>Лига</p>
                  </div>
                </div>

                {/* Date and ID */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
                  <p className="text-gray-500" style={{ fontSize: 'clamp(7px, 1.2vw, 10px)' }}>
                    Дата: {dateStr}
                  </p>
                  <p className="text-gray-400 font-mono" style={{ fontSize: 'clamp(7px, 1.2vw, 10px)' }}>
                    ID: {certId}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Download button */}
      <button
        onClick={downloadPDF}
        disabled={isGenerating}
        className="w-full bg-primary text-white py-3 px-4 rounded-xl font-semibold text-sm hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isGenerating ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Генерация PDF...
          </>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Скачать сертификат (PDF)
          </>
        )}
      </button>
    </div>
  );
}
