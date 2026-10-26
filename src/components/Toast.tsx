import React from 'react';

export interface ToastProps {
  show: boolean;
  title?: string;
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({ show, title = 'Hệ thống SCMS', message, type = 'success', onClose }) => {
  if (!show) return null;

  const isSuccess = type === 'success';
  const isError = type === 'error';

  return (
    <div className="fixed top-5 left-4 right-4 max-w-sm mx-auto z-50 transform transition-all duration-300 animate-in fade-in slide-in-from-top-4">
      <div className="bg-[#283044] text-[#eef0ff] rounded-xl p-3.5 shadow-2xl flex items-center gap-3 border border-[#444654]/40 backdrop-blur-md">
        <span
          className={`material-symbols-outlined text-[24px] shrink-0 ${
            isSuccess ? 'text-[#81d8ad]' : isError ? 'text-[#ffdad6]' : 'text-[#b7c4ff]'
          }`}
        >
          {isSuccess ? 'check_circle' : isError ? 'error' : 'info'}
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-xs text-[#faf8ff] tracking-wide">{title}</p>
          <p className="text-xs text-[#dae2fd] mt-0.5 leading-snug line-clamp-2">{message}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-[#c4c5d6] hover:text-white p-1 rounded-md transition-colors"
            aria-label="Đóng thông báo"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        )}
      </div>
    </div>
  );
};
