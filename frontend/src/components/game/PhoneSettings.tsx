'use client';

import { motion } from 'framer-motion';

interface PhoneSettingsProps {
  data: Record<string, unknown>;
}

export default function PhoneSettings({ data }: PhoneSettingsProps) {
  const screen = (data.screen as string) || 'default';

  if (screen === 'incoming_call') {
    return <IncomingCall data={data} />;
  }

  if (screen === 'router_admin') {
    return <RouterAdmin data={data} />;
  }

  return (
    <PhoneFrame>
      <div className="p-6 text-center">
        <div className="text-4xl mb-4">📱</div>
        <p className="text-text-secondary text-sm">Экран телефона</p>
      </div>
    </PhoneFrame>
  );
}

function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-[320px] mx-auto"
    >
      <div className="bg-black rounded-[2.5rem] p-3 shadow-xl">
        {/* Notch */}
        <div className="bg-black rounded-t-[2rem] relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-10" />
        </div>
        <div className="bg-white rounded-[2rem] overflow-hidden min-h-[500px]">
          {/* Status bar */}
          <div className="bg-gray-50 px-6 pt-8 pb-2 flex items-center justify-between text-xs text-text-secondary">
            <span>9:41</span>
            <div className="flex items-center gap-1">
              <span>📶</span>
              <span>🔋</span>
            </div>
          </div>
          {children}
        </div>
      </div>
    </motion.div>
  );
}

function IncomingCall({ data }: { data: Record<string, unknown> }) {
  const callerName = (data.caller_name as string) || 'Неизвестный';
  const callerNumber = (data.caller_number as string) || '';
  const callScript = (data.call_script as string) || '';

  return (
    <PhoneFrame>
      <div className="bg-gradient-to-b from-green-50 to-white p-6 min-h-[440px] flex flex-col">
        {/* Caller info */}
        <div className="text-center flex-1">
          <div className="w-20 h-20 bg-primary-bg rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
            📞
          </div>
          <h3 className="font-display font-bold text-lg">{callerName}</h3>
          <p className="text-text-secondary text-sm">{callerNumber}</p>
          <p className="text-accent-success text-xs mt-1">Входящий звонок</p>
        </div>

        {/* Call script */}
        {callScript && (
          <div className="bg-white rounded-xl p-4 border border-border mb-4 shadow-card">
            <p className="text-xs text-text-secondary mb-1">Звонящий говорит:</p>
            <p className="text-sm leading-relaxed italic">&ldquo;{callScript}&rdquo;</p>
          </div>
        )}

        {/* Call buttons */}
        <div className="flex items-center justify-center gap-8">
          <div className="w-14 h-14 bg-red-500 rounded-full flex items-center justify-center text-white text-xl shadow-lg">
            📵
          </div>
          <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center text-white text-xl shadow-lg">
            📞
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}

function RouterAdmin({ data }: { data: Record<string, unknown> }) {
  const routerModel = (data.router_model as string) || 'Router';
  const currentSsid = (data.current_ssid as string) || '';
  const currentPassword = (data.current_password as string) || '';
  const adminLogin = (data.admin_login as string) || '';
  const adminPassword = (data.admin_password as string) || '';

  return (
    <PhoneFrame>
      <div className="p-4">
        <h3 className="font-display font-bold text-center mb-4">{routerModel}</h3>
        <div className="bg-gray-50 rounded-lg p-4 space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-text-secondary">Имя сети (SSID):</span>
            <span className="font-mono font-medium">{currentSsid}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Пароль Wi-Fi:</span>
            <span className="font-mono font-medium text-accent-error">{currentPassword}</span>
          </div>
          <hr className="border-border" />
          <div className="flex justify-between">
            <span className="text-text-secondary">Логин админки:</span>
            <span className="font-mono font-medium text-accent-error">{adminLogin}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Пароль админки:</span>
            <span className="font-mono font-medium text-accent-error">{adminPassword}</span>
          </div>
        </div>
        <div className="mt-4 bg-yellow-50 border border-accent-warning rounded-lg p-3">
          <p className="text-xs text-yellow-800">
            \! Обнаружен стандартный пароль. Рекомендуется сменить.
          </p>
        </div>
      </div>
    </PhoneFrame>
  );
}
