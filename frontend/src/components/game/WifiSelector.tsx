'use client';

import { motion } from 'framer-motion';

interface Network {
  name: string;
  signal_strength: number;
  is_secured: boolean;
  is_fake: boolean;
}

interface WifiSelectorProps {
  data: Record<string, unknown>;
}

export default function WifiSelector({ data }: WifiSelectorProps) {
  const location = (data.location as string) || '';
  const networks = (data.networks as Network[]) || [];

  const signalBars = (strength: number) => {
    return Array.from({ length: 4 }, (_, i) => (
      <div
        key={i}
        className={`w-1 rounded-full ${i < strength ? 'bg-primary' : 'bg-gray-200'}`}
        style={{ height: `${(i + 1) * 4 + 4}px` }}
      />
    ));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-[320px] mx-auto"
    >
      <div className="bg-black rounded-[2.5rem] p-3 shadow-xl">
        <div className="bg-white rounded-[2rem] overflow-hidden min-h-[500px]">
          {/* Status bar */}
          <div className="bg-gray-50 px-6 pt-8 pb-2 flex items-center justify-between text-xs text-text-secondary">
            <span>9:41</span>
            <div className="flex items-center gap-1">
              <span>📶</span>
              <span>🔋</span>
            </div>
          </div>

          <div className="p-4">
            <h3 className="font-display font-bold text-lg mb-1">Wi-Fi</h3>
            {location && (
              <p className="text-xs text-text-secondary mb-4">📍 {location}</p>
            )}

            <div className="space-y-2">
              {networks.map((network, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.2 }}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{network.is_secured ? '🔒' : '📡'}</span>
                    <div>
                      <p className="font-medium text-sm">{network.name}</p>
                      <p className="text-xs text-text-secondary">
                        {network.is_secured ? 'Защищённая' : 'Открытая'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-end gap-0.5 h-5">
                    {signalBars(network.signal_strength)}
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-primary-bg rounded-xl">
              <p className="text-xs text-primary font-medium text-center">
                * Совет: спросите у персонала название официальной сети
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
