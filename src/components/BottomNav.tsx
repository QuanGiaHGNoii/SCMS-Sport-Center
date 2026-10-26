import React from 'react';
import { ActiveTab } from '../types';

interface BottomNavProps {
  activeTab: ActiveTab;
  onNavigate: (tab: ActiveTab) => void;
  checkedInCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onNavigate, checkedInCount }) => {
  const navItems: { tab: ActiveTab; label: string; icon: string; badge?: number }[] = [
    { tab: 'overview', label: 'Tổng quan', icon: 'dashboard' },
    { tab: 'operations', label: 'Vận hành', icon: 'sports_gymnastics', badge: checkedInCount },
    { tab: 'ai-assistant', label: 'Trợ lý AI', icon: 'smart_toy' },
    { tab: 'account', label: 'Tài khoản', icon: 'person' },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 pb-safe bg-[#faf8ff]/95 backdrop-blur-xl border-t border-[#eeedf7] shadow-[0_-2px_12px_rgba(0,0,0,0.04)]">
      <div className="grid grid-cols-4 h-16 max-w-lg mx-auto px-2">
        {navItems.map(item => {
          const isActive = activeTab === item.tab;
          return (
            <button
              key={item.tab}
              onClick={() => onNavigate(item.tab)}
              className={`flex flex-col items-center justify-center gap-0.5 transition-all relative ${
                isActive ? 'text-[#00247d]' : 'text-[#444654] hover:text-[#1a1b22]'
              }`}
            >
              <div className="relative">
                <span
                  className="material-symbols-outlined text-[24px]"
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                  {item.icon}
                </span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-2 px-1 min-w-4 h-4 bg-[#006c49] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span
                className={`font-['Plus_Jakarta_Sans'] text-[11px] leading-tight ${
                  isActive ? 'font-bold text-[#00247d]' : 'font-medium text-[#444654]'
                }`}
              >
                {item.label}
              </span>
              {isActive && (
                <span className="w-1.5 h-1 bg-[#00247d] rounded-full absolute bottom-1" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
