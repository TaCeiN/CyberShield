'use client';

import { motion } from 'framer-motion';

interface BrowserSimulatorProps {
  data: Record<string, unknown>;
}

export default function BrowserSimulator({ data }: BrowserSimulatorProps) {
  const url = (data.url as string) || '';
  const pageTitle = (data.page_title as string) || 'Страница';
  const isHttps = data.is_https as boolean;
  const description = (data.description as string) || '';
  const visualClues = (data.visual_clues as string[]) || [];
  const wifiName = (data.wifi_name as string) || '';
  const popup = data.popup as { title?: string; text?: string; button?: string; file?: string } | undefined;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-xl border border-border overflow-hidden shadow-card"
    >
      {/* Browser chrome */}
      <div className="bg-gray-100 border-b border-border">
        {/* Tab bar */}
        <div className="flex items-center px-3 pt-2">
          <div className="flex gap-1.5 mr-4">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <div className="bg-white rounded-t-lg px-4 py-1.5 text-sm font-medium border border-b-0 border-border max-w-[200px] truncate">
            {pageTitle}
          </div>
        </div>

        {/* Address bar */}
        <div className="px-3 py-2">
          <div className="bg-white rounded-full px-4 py-1.5 flex items-center gap-2 border border-border">
            {url && (
              <>
                <span className={isHttps === false ? 'text-accent-error text-sm' : 'text-accent-success text-sm'}>
                  {isHttps === false ? '\u26A0' : '\uD83D\uDD12'}
                </span>
                <span className="text-sm text-text-secondary truncate">{url}</span>
              </>
            )}
            {!url && <span className="text-sm text-text-secondary">Нет URL</span>}
          </div>
        </div>
      </div>

      {/* Page content */}
      <div className="p-6 min-h-[300px] relative">
        {wifiName && (
          <div className="bg-yellow-50 border border-accent-warning rounded-lg p-3 mb-4 text-sm">
            <span className="font-medium">Подключено к:</span> {wifiName}
          </div>
        )}

        {description && (
          <div className="bg-page rounded-lg p-4 mb-4">
            <p className="text-sm leading-relaxed">{description}</p>
            {visualClues.length > 0 && (
              <ul className="mt-3 space-y-1">
                {visualClues.map((clue, idx) => (
                  <li key={idx} className="text-sm text-accent-error flex items-center gap-2">
                    <span className="text-accent-error">&bull;</span> {clue}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {!description && !popup && (
          <div className="text-center py-8">
            <p className="text-text-secondary">Содержимое страницы</p>
          </div>
        )}

        {/* Popup overlay */}
        {popup && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="absolute inset-0 bg-black/30 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full border-2 border-accent-warning">
              <h3 className="font-bold text-lg mb-2">{popup.title}</h3>
              <p className="text-sm text-text-secondary mb-4">{popup.text}</p>
              <div className="bg-accent-error text-white rounded-lg py-2 px-4 text-center font-medium text-sm cursor-not-allowed">
                {popup.button || 'Скачать'}
              </div>
              {popup.file && (
                <p className="text-xs text-text-secondary text-center mt-2">Файл: {popup.file}</p>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
