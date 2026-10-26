import React, { useState } from 'react';
import { ActiveTab } from '../types';
import { soundFX } from '../utils/audio';

interface DeviceFrameWrapperProps {
  children: React.ReactNode;
  activeTab: ActiveTab;
  onNavigate: (tab: ActiveTab) => void;
  onOpenQuickScan?: () => void;
}

export const DeviceFrameWrapper: React.FC<DeviceFrameWrapperProps> = ({
  children,
  activeTab,
  onNavigate,
}) => {
  const [viewMode, setViewMode] = useState<'mobile' | 'wide'>('mobile');
  const [soundActive, setSoundActive] = useState(soundFX.enabled);

  const toggleSound = () => {
    soundFX.enabled = !soundActive;
    setSoundActive(!soundActive);
  };

  const screens: { tab: ActiveTab; label: string; icon: string }[] = [
    { tab: 'operations', label: 'Vận hành', icon: 'sports_gymnastics' },
    { tab: 'auth', label: 'Đăng nhập / Đăng ký', icon: 'key' },
    { tab: 'account', label: 'Tài khoản', icon: 'person' },
    { tab: 'overview', label: 'Tổng quan', icon: 'dashboard' },
    { tab: 'ai-assistant', label: 'Trợ lý AI', icon: 'smart_toy' },
  ];

  return (
    <div className="min-h-screen bg-[#f1f4fb] flex flex-col items-center">
      {/* Top Demo & Screen Controller Ribbon */}
      <header className="w-full bg-[#131b2e] text-white py-2 px-3 border-b border-[#283044] sticky top-0 z-50 shadow-md">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#1d4ed8] flex items-center justify-center font-bold text-xs">
              S
            </div>
            <span className="font-['Plus_Jakarta_Sans'] text-xs font-bold tracking-tight text-white">
              SCMS Sports Pro
            </span>
          </div>

          {/* Screen Switcher Chips */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
            {screens.map(s => {
              const active = activeTab === s.tab;
              return (
                <button
                  key={s.tab}
                  onClick={() => onNavigate(s.tab)}
                  className={`px-2.5 py-1 rounded-full font-['Plus_Jakarta_Sans'] text-[11px] font-semibold flex items-center gap-1 transition-all whitespace-nowrap cursor-pointer ${
                    active
                      ? 'bg-[#1d4ed8] text-white shadow-xs'
                      : 'bg-[#283044]/60 text-[#dae2fd] hover:bg-[#283044]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px]">{s.icon}</span>
                  <span>{s.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right Toolbar Controls */}
          <div className="flex items-center gap-2">
            {/* Audio Toggle */}
            <button
              onClick={toggleSound}
              title={soundActive ? 'Tắt âm thanh' : 'Bật âm thanh'}
              className="p-1 rounded-md text-[#dae2fd] hover:text-white hover:bg-[#283044] transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">
                {soundActive ? 'volume_up' : 'volume_off'}
              </span>
            </button>

            {/* Download Project ZIP Button */}
            <a
              href="/scms-sports-center.zip"
              download="scms-sports-center.zip"
              className="px-2.5 py-1 rounded-lg bg-[#006c49] hover:bg-[#005236] text-white font-['Plus_Jakarta_Sans'] text-[11px] font-bold flex items-center gap-1 transition-all shadow-xs cursor-pointer"
              title="Tải toàn bộ mã nguồn dự án (.ZIP)"
            >
              <span className="material-symbols-outlined text-[15px]">download</span>
              <span className="hidden md:inline">Tải ZIP</span>
            </a>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-[#283044] p-0.5 rounded-lg">
              <button
                onClick={() => setViewMode('mobile')}
                className={`px-2 py-0.5 rounded-md text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                  viewMode === 'mobile' ? 'bg-[#1d4ed8] text-white' : 'text-[#dae2fd]'
                }`}
                title="Chế độ điện thoại chuẩn"
              >
                <span className="material-symbols-outlined text-[14px]">smartphone</span>
                <span className="hidden sm:inline">Khung Phone</span>
              </button>
              <button
                onClick={() => setViewMode('wide')}
                className={`px-2 py-0.5 rounded-md text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                  viewMode === 'wide' ? 'bg-[#1d4ed8] text-white' : 'text-[#dae2fd]'
                }`}
                title="Toàn màn hình responsive"
              >
                <span className="material-symbols-outlined text-[14px]">laptop</span>
                <span className="hidden sm:inline">Mở rộng</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="w-full flex-1 flex justify-center py-2 sm:py-6 px-1 sm:px-4">
        {viewMode === 'mobile' ? (
          /* Phone Mockup Frame */
          <div className="relative w-full max-w-[430px] min-h-[884px] bg-[#faf8ff] rounded-[36px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.25)] border-[8px] border-[#1a1b22] overflow-hidden flex flex-col">
            {/* Phone Notch / Dynamic Island */}
            <div className="absolute top-0 inset-x-0 h-7 z-50 flex items-center justify-between px-6 bg-transparent pointer-events-none">
              <span className="text-[11px] font-bold text-[#1a1b22]">08:42</span>
              <div className="w-20 h-4 bg-[#1a1b22] rounded-full mx-auto" />
              <div className="flex items-center gap-1 text-[#1a1b22]">
                <span className="material-symbols-outlined text-[13px]">signal_cellular_alt</span>
                <span className="material-symbols-outlined text-[13px]">wifi</span>
                <span className="material-symbols-outlined text-[14px]">battery_full</span>
              </div>
            </div>

            {/* Screen Content */}
            <div className="flex-1 flex flex-col w-full overflow-y-auto no-scrollbar pt-5">
              {children}
            </div>

            {/* Bottom Home Indicator */}
            <div className="absolute bottom-1 inset-x-0 h-4 flex items-center justify-center pointer-events-none z-50">
              <div className="w-32 h-1 bg-[#1a1b22]/40 rounded-full" />
            </div>
          </div>
        ) : (
          /* Wide Responsive Layout */
          <div className="w-full max-w-4xl bg-[#faf8ff] rounded-2xl shadow-sm border border-[#eeedf7] min-h-[884px] flex flex-col overflow-hidden">
            <div className="flex-1 flex flex-col w-full overflow-y-auto">
              {children}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
