import React, { useState } from 'react';
import { ActiveTab } from '../types';

interface HeaderProps {
  activeTab: ActiveTab;
  onNavigate: (tab: ActiveTab) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info', title?: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onNavigate, onShowToast }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Hội viên check-in đông',
      time: '3 phút trước',
      desc: 'Ca sáng đã đạt 68/160 người (42% công suất sàn).',
      unread: true,
    },
    {
      id: 2,
      title: 'Nhắc lịch lớp Yoga Zen',
      time: '15 phút trước',
      desc: 'Lớp Vinyasa Flow lúc 09:00 đã có 22/25 học viên đăng ký.',
      unread: true,
    },
    {
      id: 3,
      title: 'Bàn giao ca trước',
      time: '06:05 hôm nay',
      desc: 'Ca đêm đã kiểm đếm đầy đủ 40 chìa tủ và két tiền đầu ca.',
      unread: false,
    },
  ]);

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
    onShowToast('Đã đánh dấu đã đọc tất cả thông báo');
  };

  const getSubTitle = () => {
    switch (activeTab) {
      case 'overview':
        return 'Tổng quan Thể thao';
      case 'operations':
        return 'Van Hanh Hoi Vien';
      case 'ai-assistant':
        return 'Trợ lý AI Vận hành';
      case 'account':
        return 'Tai Khoan';
      default:
        return 'Operations';
    }
  };

  return (
    <>
      <header className="sticky top-0 inset-x-0 z-40 bg-[#faf8ff]/90 backdrop-blur-xl border-b border-[#eeedf7] shadow-[0_1px_8px_rgba(0,0,0,0.03)] pt-safe">
        <div className="h-16 px-4 flex items-center justify-between max-w-5xl mx-auto">
          {/* Logo & Subtitle */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => onNavigate('operations')}>
            <div className="h-9 px-2.5 bg-[#00247d] rounded-lg flex items-center justify-center shadow-sm">
              <span className="font-['Plus_Jakarta_Sans'] text-base text-white tracking-tight font-extrabold">SCMS</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-['Plus_Jakarta_Sans'] text-[11px] font-bold text-[#006c49] uppercase tracking-wider">
                  Sports Center
                </span>
                {activeTab === 'operations' && (
                  <span className="hidden sm:inline-block px-1.5 py-0.2 rounded bg-[#9af2c5] text-[#00714d] text-[10px] font-bold">
                    OPS ADMIN
                  </span>
                )}
              </div>
              <span className="font-['Plus_Jakarta_Sans'] text-sm font-bold text-[#1a1b22] line-clamp-1 leading-none">
                {getSubTitle()}
              </span>
            </div>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-1.5">
            {/* Notification Button */}
            <button
              aria-label="Thông báo hệ thống"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#eeedf7] text-[#444654] active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[24px]">notifications</span>
              {notifications.some(n => n.unread) && (
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-[#ba1a1a] rounded-full ring-2 ring-[#faf8ff]" />
              )}
            </button>

            {/* User Profile Avatar */}
            <button
              aria-label="Menu tài khoản cá nhân"
              onClick={() => onNavigate('account')}
              className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-full hover:bg-[#eeedf7] active:scale-95 transition-all"
            >
              <div className="relative">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCq9ZOnrDRu8_5xK1mM-VD4llIOBHZ6p9s2JbIc0MeQgHgHzmO2MSojt_Tvii5BcI74Me13uEAvXPEosLVa9CMJVINBqoass1KttVqQiOZG_8zpRj_A4dd9AHpo5kPa4azFMvZKqJZgIGa0qQ-k_74bUtL5Cex56gpisXxCw0MZHUj8DXtGHDFXlhYtXl4uCa0HKfhgsdDpABRdPofVwKZHiJIGfla3e3RouHMAUfQLUfLVoyulqDh8"
                  alt="Avatar Lễ tân"
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-[#00247d]/20"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#006c49] rounded-full ring-1 ring-white" />
              </div>
              <span className="hidden md:inline font-['Plus_Jakarta_Sans'] text-xs font-semibold text-[#1a1b22]">
                REC-8802
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Notifications Drawer */}
      {showNotifications && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end" onClick={() => setShowNotifications(false)}>
          <div
            className="w-full max-w-sm bg-white h-full shadow-2xl p-4 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200"
            onClick={e => e.stopPropagation()}
          >
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#eeedf7]">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#00247d] text-[22px]">notifications_active</span>
                  <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-base text-[#1a1b22]">Thông báo ca trực</h3>
                </div>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="w-8 h-8 rounded-full bg-[#eeedf7] flex items-center justify-center text-[#444654] hover:text-[#1a1b22]"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>

              <div className="divide-y divide-[#f2f3ff] mt-2">
                {notifications.map(item => (
                  <div
                    key={item.id}
                    className={`py-3 px-2 rounded-lg transition-colors ${item.unread ? 'bg-[#f2f3ff]' : 'hover:bg-[#faf8ff]'}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-['Plus_Jakarta_Sans'] text-xs font-bold text-[#1a1b22]">{item.title}</p>
                      <span className="text-[10px] text-[#747686]">{item.time}</span>
                    </div>
                    <p className="text-xs text-[#444654] leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-[#eeedf7]">
              <button
                onClick={markAllRead}
                className="w-full py-2.5 rounded-lg bg-[#eeedf7] text-[#00247d] font-['Plus_Jakarta_Sans'] font-semibold text-xs hover:bg-[#dae2fd] transition-colors"
              >
                Đánh dấu đã đọc tất cả
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
