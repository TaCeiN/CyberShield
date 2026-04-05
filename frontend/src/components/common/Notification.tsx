'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { IconCheckCircle, IconXCircle, IconAlertTriangle } from '@/components/icons/Icons';
import { ReactNode } from 'react';

interface NotificationProps {
  show: boolean;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  onClose: () => void;
}

export default function Notification({ show, type, title, message, onClose }: NotificationProps) {
  const colors = {
    success: 'bg-green-50 border-accent-success text-green-800',
    error: 'bg-red-50 border-accent-error text-red-800',
    warning: 'bg-yellow-50 border-accent-warning text-yellow-800',
    info: 'bg-blue-50 border-blue-400 text-blue-800',
  };

  const icons: Record<string, ReactNode> = {
    success: <IconCheckCircle size={20} className="text-accent-success" />,
    error: <IconXCircle size={20} className="text-accent-error" />,
    warning: <IconAlertTriangle size={20} className="text-accent-warning" />,
    info: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>,
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-4 right-4 z-[100]"
        >
          <div
            className={cn(
              'border-l-4 rounded-lg p-4 shadow-lg max-w-sm',
              colors[type]
            )}
          >
            <div className="flex items-start gap-3">
              <span>{icons[type]}</span>
              <div className="flex-1">
                <p className="font-semibold text-sm">{title}</p>
                {message && <p className="text-sm mt-1 opacity-80">{message}</p>}
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-lg"
              >
                &times;
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
