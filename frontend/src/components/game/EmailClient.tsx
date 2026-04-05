'use client';

import { motion } from 'framer-motion';

interface EmailClientProps {
  data: Record<string, unknown>;
}

export default function EmailClient({ data }: EmailClientProps) {
  const sender = (data.sender_display as string) || (data.sender as string) || 'Неизвестный';
  const senderEmail = (data.sender as string) || '';
  const subject = (data.subject as string) || 'Без темы';
  const body = (data.body as string) || '';
  const timestamp = (data.timestamp as string) || '';
  const attachments = (data.attachments as string[]) || [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-xl border border-border overflow-hidden shadow-card"
    >
      {/* Email toolbar */}
      <div className="bg-gray-50 border-b border-border px-4 py-2 flex items-center gap-4">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 text-center">
          <span className="text-xs text-text-secondary font-medium">Входящие — Корпоративная почта</span>
        </div>
      </div>

      {/* Sidebar + Content layout */}
      <div className="flex min-h-[400px]">
        {/* Folders */}
        <div className="w-40 bg-gray-50 border-r border-border p-3 hidden md:block">
          <div className="space-y-1 text-sm">
            <div className="bg-primary-bg text-primary font-medium px-3 py-1.5 rounded">
              📥 Входящие <span className="float-right text-xs bg-primary text-white rounded-full px-1.5">1</span>
            </div>
            <div className="text-text-secondary px-3 py-1.5 rounded hover:bg-gray-100">📤 Отправленные</div>
            <div className="text-text-secondary px-3 py-1.5 rounded hover:bg-gray-100">📝 Черновики</div>
            <div className="text-text-secondary px-3 py-1.5 rounded hover:bg-gray-100">🗑️ Корзина</div>
          </div>
        </div>

        {/* Email content */}
        <div className="flex-1 p-5">
          <div className="border-b border-border pb-4 mb-4">
            <h2 className="font-bold text-lg mb-2">{subject}</h2>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                {sender.charAt(0)}
              </div>
              <div>
                <p className="font-medium text-sm">{sender}</p>
                <p className="text-xs text-text-secondary">&lt;{senderEmail}&gt; · {timestamp}</p>
              </div>
            </div>
          </div>

          <div className="whitespace-pre-line text-sm leading-relaxed text-text-primary">
            {body}
          </div>

          {attachments.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-sm text-text-secondary mb-2">Вложения:</p>
              {attachments.map((att, idx) => (
                <div key={idx} className="inline-flex items-center gap-2 bg-gray-50 rounded px-3 py-1.5 text-sm">
                  📎 {att}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
