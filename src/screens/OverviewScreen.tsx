import React from 'react';
import { ShiftInfo, Member } from '../types';

interface OverviewScreenProps {
  shiftInfo: ShiftInfo;
  members: Member[];
  onNavigateToOperations: () => void;
}

export const OverviewScreen: React.FC<OverviewScreenProps> = ({
  shiftInfo,
  members,
  onNavigateToOperations,
}) => {
  const zones = [
    { name: 'Khu Gym & Máy tập', current: 34, max: 80, icon: 'fitness_center', color: '#00247d', bg: '#dce1ff' },
    { name: 'Hồ bơi bốn mùa', current: 14, max: 30, icon: 'pool', color: '#004b59', bg: '#b2ecfd' },
    { name: 'Phòng Spin & GX Arena', current: 12, max: 25, icon: 'sports_gymnastics', color: '#006c49', bg: '#9af2c5' },
    { name: 'Studio Pilates Reformer', current: 8, max: 15, icon: 'self_improvement', color: '#063ab2', bg: '#dae2fd' },
    { name: 'Khu Xông hơi & Phục hồi', current: 4, max: 10, icon: 'hot_tub', color: '#ba1a1a', bg: '#ffdad6' },
  ];

  const hourlyData = [
    { hour: '06:00', count: 42, peak: false },
    { hour: '07:00', count: 78, peak: true },
    { hour: '08:00', count: 64, peak: false },
    { hour: '09:00', count: 32, peak: false },
    { hour: '11:30', count: 45, peak: false },
    { hour: '17:30', count: 85, peak: true },
    { hour: '19:00', count: 92, peak: true },
    { hour: '20:30', count: 50, peak: false },
  ];

  const activeTrainers = [
    { name: 'HLV Tuấn Anh', spec: 'Spinning & HIIT', floor: 'Studio Spin Neon', status: 'Đang đứng lớp' },
    { name: 'Master Ananya', spec: 'Vinyasa Flow', floor: 'Studio Yoga Zen A', status: 'Chuẩn bị lớp 09:00' },
    { name: 'PT Huỳnh', spec: 'Tăng cơ giảm mỡ', floor: 'Cụm tạ tự do Tầng 1', status: 'Kèm hội viên VIP' },
    { name: 'HLV Linh Chi', spec: 'Pilates Reformer', floor: 'Phòng Private Tầng 2', status: 'Sẵn sàng' },
  ];

  return (
    <div className="flex flex-col w-full max-w-lg mx-auto px-4 pb-28 pt-2 space-y-4">
      {/* Welcome Banner */}
      <div className="bg-[#00247d] text-white rounded-2xl p-4 shadow-sm relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#1d4ed8] rounded-full opacity-40 blur-xl pointer-events-none" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-full bg-[#9af2c5] text-[#00714d] text-[10px] font-bold">
                Trực tiếp
              </span>
              <span className="text-xs text-[#dae2fd]">SCMS Landmark Club</span>
            </div>
            <h1 className="font-['Plus_Jakarta_Sans'] text-lg font-bold mt-1">Tổng quan mặt sàn thể thao</h1>
            <p className="text-xs text-[#dae2fd] mt-0.5">
              Hiện có <strong className="text-white font-extrabold">{shiftInfo.currentFloorCount}</strong> hội viên đang tập luyện
            </p>
          </div>

          <button
            onClick={onNavigateToOperations}
            className="px-3 py-2 bg-white text-[#00247d] font-['Plus_Jakarta_Sans'] text-xs font-bold rounded-xl shadow-xs active:scale-95 transition-transform shrink-0 flex items-center gap-1 cursor-pointer"
          >
            <span>Vào bàn lễ tân</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>
      </div>

      {/* Real-time Zone Occupancy */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-[#eeedf7] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#00247d] text-[20px]">grid_view</span>
            <h2 className="font-['Plus_Jakarta_Sans'] text-xs font-bold text-[#1a1b22] uppercase tracking-wide">
              Mật độ các khu vực
            </h2>
          </div>
          <span className="text-[11px] text-[#747686]">Sức chứa tổng: 160 người</span>
        </div>

        <div className="space-y-2.5">
          {zones.map(zone => {
            const percent = Math.min(100, Math.round((zone.current / zone.max) * 100));
            return (
              <div key={zone.name} className="p-2.5 rounded-xl bg-[#f2f3ff] border border-[#eaedff]">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: zone.bg, color: zone.color }}
                    >
                      <span className="material-symbols-outlined text-[16px]">{zone.icon}</span>
                    </div>
                    <span className="font-semibold text-[#1a1b22]">{zone.name}</span>
                  </div>
                  <span className="font-bold text-[#1a1b22]">
                    {zone.current} <span className="text-[#747686] font-normal">/ {zone.max} ({percent}%)</span>
                  </span>
                </div>
                <div className="w-full bg-[#eeedf7] h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${percent}%`, backgroundColor: zone.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hourly Trend Chart */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-[#eeedf7] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#006c49] text-[20px]">equalizer</span>
            <h2 className="font-['Plus_Jakarta_Sans'] text-xs font-bold text-[#1a1b22] uppercase tracking-wide">
              Lưu lượng hội viên trong ngày
            </h2>
          </div>
          <span className="text-[10px] text-[#006c49] font-bold">Khung giờ cao điểm: 17:30 - 20:30</span>
        </div>

        <div className="h-28 flex items-end justify-between gap-1 pt-4 pb-1 px-1">
          {hourlyData.map(d => {
            const height = Math.round((d.count / 100) * 80);
            return (
              <div key={d.hour} className="flex-1 flex flex-col items-center gap-1 group">
                <span className="text-[9px] text-[#747686] opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                  {d.count}
                </span>
                <div
                  className={`w-full rounded-t-md transition-all ${
                    d.peak ? 'bg-[#00247d] shadow-xs' : 'bg-[#dce1ff] hover:bg-[#b7c4ff]'
                  }`}
                  style={{ height: `${height}px` }}
                />
                <span className="text-[9px] text-[#747686] font-medium truncate">{d.hour}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Trainers & Staff on Floor */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-[#eeedf7] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#00247d] text-[20px]">sports</span>
            <h2 className="font-['Plus_Jakarta_Sans'] text-xs font-bold text-[#1a1b22] uppercase tracking-wide">
              Huấn luyện viên đang trực sàn
            </h2>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-[#9af2c5] text-[#00714d] text-[10px] font-bold">
            4 HLV có mặt
          </span>
        </div>

        <div className="divide-y divide-[#eeedf7]">
          {activeTrainers.map(t => (
            <div key={t.name} className="py-2.5 flex items-center justify-between">
              <div>
                <p className="font-['Plus_Jakarta_Sans'] text-xs font-bold text-[#1a1b22]">{t.name}</p>
                <p className="text-[11px] text-[#444654]">
                  {t.spec} • <span className="text-[#00247d] font-medium">{t.floor}</span>
                </p>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#f2f3ff] text-[#444654] font-medium border border-[#eaedff]">
                {t.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
