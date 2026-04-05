'use client';

import { motion } from 'framer-motion';

interface Message {
  from: string;
  text?: string;
  time: string;
  file?: { name: string; size: string; icon: string };
  link?: { url: string; preview: string };
}

interface MessengerClientProps {
  data: Record<string, unknown>;
}

export default function MessengerClient({ data }: MessengerClientProps) {
  const contactName = (data.contact_name as string) || 'Контакт';
  const contactRole = (data.contact_role as string) || '';
  const messages = (data.messages as Message[]) || [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-xl border border-border overflow-hidden shadow-card max-w-lg mx-auto"
    >
      {/* Header */}
      <div className="bg-primary text-white px-4 py-3 flex items-center gap-3">
        <button className="text-white/80">&larr;</button>
        <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center font-bold">
          {contactName.charAt(0)}
        </div>
        <div>
          <p className="font-semibold text-sm">{contactName}</p>
          <p className="text-xs text-white/70">{contactRole || 'был(а) недавно'}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="bg-[#e5ded8] p-4 min-h-[300px] space-y-2">
        {messages.map((msg, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.3 }}
            className={`flex ${msg.from === 'contact' ? 'justify-start' : 'justify-end'}`}
          >
            <div
              className={`max-w-[80%] rounded-xl px-3 py-2 shadow-sm ${
                msg.from === 'contact'
                  ? 'bg-white rounded-tl-none'
                  : 'bg-[#dcf8c6] rounded-tr-none'
              }`}
            >
              {msg.text && <p className="text-sm">{msg.text}</p>}
              {msg.file && (
                <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-3">
                  <div className="text-2xl">📄</div>
                  <div>
                    <p className="text-sm font-medium text-accent-error">{msg.file.name}</p>
                    <p className="text-xs text-text-secondary">{msg.file.size}</p>
                  </div>
                </div>
              )}
              {msg.link && (
                <div className="bg-gray-50 rounded-lg p-3 border-l-4 border-blue-400">
                  <p className="text-xs text-blue-600 break-all">{msg.link.url}</p>
                  <p className="text-sm font-medium mt-1">{msg.link.preview}</p>
                </div>
              )}
              <p className="text-[10px] text-text-secondary text-right mt-1">{msg.time}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Input bar (decorative) */}
      <div className="bg-gray-50 border-t border-border px-4 py-2 flex items-center gap-3">
        <span className="text-xl">😊</span>
        <div className="flex-1 bg-white rounded-full px-4 py-2 text-sm text-text-secondary border border-border">
          Сообщение...
        </div>
        <span className="text-xl">🎤</span>
      </div>
    </motion.div>
  );
}
