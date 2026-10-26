import React, { useState } from 'react';
import { ShiftInfo } from '../types';
import { soundFX } from '../utils/audio';

interface AccountScreenProps {
  shiftInfo: ShiftInfo;
  onUpdateShift: (shift: ShiftInfo) => void;
  onSignOut: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info', title?: string) => void;
}

export const AccountScreen: React.FC<AccountScreenProps> = ({
  shiftInfo,
  onUpdateShift,
  onSignOut,
  onShowToast,
}) => {
  // Form profile
  const [fullName, setFullName] = useState(shiftInfo.staffName || 'Nguyễn Minh Tuấn');
  const [phone, setPhone] = useState('0918 345 678');
  const [email, setEmail] = useState('tuan.nm@scms-sports.vn');
  const [preferredShift, setPreferredShift] = useState('ca_sang');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Settings
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [language, setLanguage] = useState<'VI' | 'EN'>('VI');

  // Modals
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  // Handle Save Profile
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);

    setTimeout(() => {
      setIsSavingProfile(false);
      onUpdateShift({
        ...shiftInfo,
        staffName: fullName,
      });
      soundFX.playSuccess();
      onShowToast(`Thông tin nhân sự ${shiftInfo.staffId} đã được đồng bộ!`, 'success', 'Đã lưu hồ sơ');
    }, 700);
  };

  // Test Zebra Scanner
  const handleTestScanner = () => {
    soundFX.playSuccess();
    onShowToast('Tia laser kích hoạt thành công! Máy quét Zebra DS2208 hoạt động chuẩn xác.', 'success', 'Test POS');
  };

  // Test Printer
  const handleTestPrinter = () => {
    soundFX.playPrinter();
    setShowPrintModal(true);
    onShowToast('Đang gửi lệnh in phiếu thử nghiệm đến máy Epson TM-T82III...', 'info');
  };

  // Toggle sound
  const handleToggleAudio = (enabled: boolean) => {
    setAudioEnabled(enabled);
    soundFX.enabled = enabled;
    onShowToast(enabled ? 'Đã bật âm thanh check-in và quầy POS' : 'Đã tắt âm thanh hệ thống', 'info');
  };

  return (
    <div className="flex flex-col w-full max-w-lg mx-auto px-4 pb-28 pt-2 space-y-4">
      {/* 1. Profile Card Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-white shadow-xs border border-[#eeedf7] p-4 flex flex-col gap-3">
        {/* Kinetic Accents */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#9af2c5] opacity-25 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-[#b7c4ff] opacity-30 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCq9ZOnrDRu8_5xK1mM-VD4llIOBHZ6p9s2JbIc0MeQgHgHzmO2MSojt_Tvii5BcI74Me13uEAvXPEosLVa9CMJVINBqoass1KttVqQiOZG_8zpRj_A4dd9AHpo5kPa4azFMvZKqJZgIGa0qQ-k_74bUtL5Cex56gpisXxCw0MZHUj8DXtGHDFXlhYtXl4uCa0HKfhgsdDpABRdPofVwKZHiJIGfla3e3RouHMAUfQLUfLVoyulqDh8"
                alt="Nguyễn Minh Tuấn"
                className="w-16 h-16 rounded-full object-cover shadow-sm ring-2 ring-[#00247d]/20"
              />
              <span
                className="absolute bottom-0 right-0 w-4 h-4 bg-[#006c49] rounded-full ring-2 ring-white"
                title="Đang trực ca"
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-['Plus_Jakarta_Sans'] text-base font-bold text-[#1a1b22]">{fullName}</span>
                <span className="material-symbols-outlined text-[18px] text-[#006c49]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  verified
                </span>
              </div>
              <span className="text-xs text-[#444654]">{shiftInfo.role}</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-['Plus_Jakarta_Sans'] text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#eeedf7] text-[#00247d]">
                  ID: {shiftInfo.staffId}
                </span>
                <span className="text-[10px] text-[#006c49] font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#006c49]" />
                  Đang trực ca
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              const nameInput = document.getElementById('input-fullname');
              nameInput?.focus();
              nameInput?.scrollIntoView({ behavior: 'smooth' });
            }}
            aria-label="Sửa nhanh thông tin"
            className="w-9 h-9 rounded-full bg-[#eeedf7] hover:bg-[#dae2fd] transition-colors flex items-center justify-center text-[#00247d] cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">edit_square</span>
          </button>
        </div>

        {/* Facility Location Bar */}
        <div className="flex items-center justify-between px-3 py-2 bg-[#f2f3ff] rounded-xl border border-[#eaedff]">
          <div className="flex items-center gap-1.5 text-[#444654]">
            <span className="material-symbols-outlined text-[18px] text-[#00247d]">location_on</span>
            <span className="font-['Plus_Jakarta_Sans'] text-xs font-bold text-[#1a1b22]">{shiftInfo.clubLocation}</span>
          </div>
          <span className="text-[11px] text-[#747686]">{shiftInfo.area}</span>
        </div>
      </div>

      {/* 2. Operational Performance KPI Bento */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="font-['Plus_Jakarta_Sans'] text-[10px] text-[#747686] uppercase tracking-wider font-bold">
            Hiệu suất ca trực tháng này
          </span>
          <span className="font-['Plus_Jakarta_Sans'] text-[10px] text-[#006c49] font-bold">Cập nhật 5 phút trước</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {/* KPI 1 */}
          <div className="bg-white rounded-xl p-3 shadow-xs border border-[#eeedf7] flex flex-col justify-between">
            <div className="w-8 h-8 rounded-lg bg-[#f2f3ff] flex items-center justify-center text-[#00247d] mb-1">
              <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
            </div>
            <div>
              <span className="font-['Plus_Jakarta_Sans'] text-lg font-extrabold text-[#1a1b22] block leading-tight">
                1.420
              </span>
              <span className="text-[11px] text-[#747686]">Check-in</span>
            </div>
            <div className="mt-2 flex items-center text-[#006c49] font-['Plus_Jakarta_Sans'] text-[11px] font-bold">
              <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
              <span>+12%</span>
            </div>
          </div>

          {/* KPI 2 */}
          <div className="bg-white rounded-xl p-3 shadow-xs border border-[#eeedf7] flex flex-col justify-between">
            <div className="w-8 h-8 rounded-lg bg-[#9af2c5] flex items-center justify-center text-[#00714d] mb-1">
              <span className="material-symbols-outlined text-[18px]">point_of_sale</span>
            </div>
            <div>
              <span className="font-['Plus_Jakarta_Sans'] text-lg font-extrabold text-[#1a1b22] block leading-tight truncate">
                68.5M
              </span>
              <span className="text-[11px] text-[#747686]">Doanh số quầy</span>
            </div>
            <div className="mt-2 flex items-center text-[#006c49] font-['Plus_Jakarta_Sans'] text-[11px] font-bold">
              <span className="material-symbols-outlined text-[14px]">trending_up</span>
              <span>Đạt 114%</span>
            </div>
          </div>

          {/* KPI 3 */}
          <div className="bg-white rounded-xl p-3 shadow-xs border border-[#eeedf7] flex flex-col justify-between">
            <div className="w-8 h-8 rounded-lg bg-[#dae2fd] flex items-center justify-center text-[#00247d] mb-1">
              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                star
              </span>
            </div>
            <div>
              <span className="font-['Plus_Jakarta_Sans'] text-lg font-extrabold text-[#1a1b22] block leading-tight">
                4.9<span className="text-xs text-[#747686] font-normal">/5</span>
              </span>
              <span className="text-[11px] text-[#747686]">Đánh giá</span>
            </div>
            <div className="mt-2 text-[#747686] font-['Plus_Jakarta_Sans'] text-[11px]">
              <span>98 lượt vote</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Form: Cập nhật thông tin cá nhân */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-[#eeedf7]">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-[#dce1ff] flex items-center justify-center text-[#063ab2]">
            <span className="material-symbols-outlined text-[18px]">badge</span>
          </div>
          <div>
            <h3 className="font-['Plus_Jakarta_Sans'] text-xs font-bold text-[#1a1b22] leading-tight">
              Cập nhật hồ sơ nhân sự
            </h3>
            <p className="text-[11px] text-[#747686]">Thông tin hiển thị trên biên nhận và hệ thống kiểm soát ca</p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-[#1a1b22] mb-1">Họ và tên hiển thị</label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-[#747686] text-[20px]">person</span>
              <input
                id="input-fullname"
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full h-10 pl-10 pr-3 rounded-lg bg-[#f2f3ff] text-[#1a1b22] text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#00247d] border border-[#eaedff]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1a1b22] mb-1">Số điện thoại liên hệ nội bộ</label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-[#747686] text-[20px]">call</span>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full h-10 pl-10 pr-3 rounded-lg bg-[#f2f3ff] text-[#1a1b22] text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#00247d] border border-[#eaedff]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1a1b22] mb-1">Email công vụ (@scms-sports.vn)</label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-[#747686] text-[20px]">mail</span>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full h-10 pl-10 pr-3 rounded-lg bg-[#f2f3ff] text-[#1a1b22] text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#00247d] border border-[#eaedff]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1a1b22] mb-1">Khung giờ ca trực ưu tiên</label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-[#747686] text-[20px]">schedule</span>
              <select
                value={preferredShift}
                onChange={e => setPreferredShift(e.target.value)}
                className="w-full h-10 pl-10 pr-8 rounded-lg bg-[#f2f3ff] text-[#1a1b22] text-xs font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-[#00247d] border border-[#eaedff]"
              >
                <option value="ca_sang">Ca Sáng (06:00 - 14:00)</option>
                <option value="ca_chieu">Ca Chiều / Tối (14:00 - 22:00)</option>
                <option value="ca_linh_hoat">Ca Xoay linh hoạt theo phân bổ</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 pointer-events-none text-[#747686] text-[20px]">
                expand_more
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSavingProfile}
            className="w-full mt-2 h-10 rounded-lg bg-[#00247d] hover:bg-[#0037b0] text-white font-['Plus_Jakarta_Sans'] text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs active:scale-[0.99] transition-transform cursor-pointer disabled:opacity-75"
          >
            {isSavingProfile ? (
              <>
                <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
                <span>Đang đồng bộ...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                <span>Lưu thông tin hồ sơ</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* 4. Thiết bị vận hành & Phần cứng POS */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-[#eeedf7]">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-[#9af2c5] flex items-center justify-center text-[#00714d]">
            <span className="material-symbols-outlined text-[18px]">devices</span>
          </div>
          <div>
            <h3 className="font-['Plus_Jakarta_Sans'] text-xs font-bold text-[#1a1b22] leading-tight">
              Phần cứng quầy POS
            </h3>
            <p className="text-[11px] text-[#747686]">Kết nối máy quét thẻ và máy in biên nhận</p>
          </div>
        </div>

        <div className="space-y-2">
          {/* Scanner */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#f2f3ff] border border-[#eaedff]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center text-[#00247d] shadow-xs">
                <span className="material-symbols-outlined text-[20px]">qr_code_scanner</span>
              </div>
              <div>
                <p className="font-['Plus_Jakarta_Sans'] text-xs font-bold text-[#1a1b22]">Máy quét QR Zebra DS2208</p>
                <span className="text-[10px] text-[#006c49] font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#006c49]" /> Sẵn sàng quét thẻ
                </span>
              </div>
            </div>
            <button
              onClick={handleTestScanner}
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-[#eaedff] text-[#00247d] font-['Plus_Jakarta_Sans'] text-xs font-bold border border-[#eeedf7] transition-colors cursor-pointer"
            >
              Thử máy
            </button>
          </div>

          {/* Printer */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#f2f3ff] border border-[#eaedff]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center text-[#00247d] shadow-xs">
                <span className="material-symbols-outlined text-[20px]">print</span>
              </div>
              <div>
                <p className="font-['Plus_Jakarta_Sans'] text-xs font-bold text-[#1a1b22]">Máy in bill Epson TM-T82III</p>
                <span className="text-[10px] text-[#006c49] font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#006c49]" /> Bluetooth kết nối OK
                </span>
              </div>
            </div>
            <button
              onClick={handleTestPrinter}
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-[#eaedff] text-[#00247d] font-['Plus_Jakarta_Sans'] text-xs font-bold border border-[#eeedf7] transition-colors cursor-pointer"
            >
              In test
            </button>
          </div>
        </div>
      </div>

      {/* 5. Bảo mật & Tùy chọn */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-[#eeedf7]">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-[#dae2fd] flex items-center justify-center text-[#00247d]">
            <span className="material-symbols-outlined text-[18px]">security</span>
          </div>
          <div>
            <h3 className="font-['Plus_Jakarta_Sans'] text-xs font-bold text-[#1a1b22] leading-tight">
              Bảo mật & Tùy chọn
            </h3>
            <p className="text-[11px] text-[#747686]">Cài đặt mã PIN và trải nghiệm tương tác</p>
          </div>
        </div>

        <div className="divide-y divide-[#eeedf7]">
          {/* Biometric */}
          <div className="py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[#00247d] text-[20px]">fingerprint</span>
              <div>
                <p className="font-['Plus_Jakarta_Sans'] text-xs font-bold text-[#1a1b22]">Xác thực sinh trắc học</p>
                <p className="text-[10px] text-[#747686]">Vân tay / Face ID khi mở két thu ngân</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={biometricEnabled}
                onChange={e => setBiometricEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-[#dae2fd] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#006c49]" />
            </label>
          </div>

          {/* Sound */}
          <div className="py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[#00247d] text-[20px]">volume_up</span>
              <div>
                <p className="font-['Plus_Jakarta_Sans'] text-xs font-bold text-[#1a1b22]">Âm thanh check-in</p>
                <p className="text-[10px] text-[#747686]">Phát chuông xác nhận khi hội viên quét đúng</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={audioEnabled}
                onChange={e => handleToggleAudio(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-[#dae2fd] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#006c49]" />
            </label>
          </div>

          {/* Language */}
          <div className="py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[#00247d] text-[20px]">translate</span>
              <div>
                <p className="font-['Plus_Jakarta_Sans'] text-xs font-bold text-[#1a1b22]">Ngôn ngữ hệ thống</p>
                <p className="text-[10px] text-[#747686]">Tiếng Việt (Mặc định)</p>
              </div>
            </div>
            <div className="inline-flex rounded-lg bg-[#eeedf7] p-0.5">
              <button
                type="button"
                onClick={() => setLanguage('VI')}
                className={`px-2.5 py-1 font-['Plus_Jakarta_Sans'] text-[10px] font-bold rounded-md transition-colors ${
                  language === 'VI' ? 'bg-white text-[#00247d] shadow-xs' : 'text-[#747686]'
                }`}
              >
                VI
              </button>
              <button
                type="button"
                onClick={() => {
                  setLanguage('EN');
                  onShowToast('English display mode activated', 'info');
                }}
                className={`px-2.5 py-1 font-['Plus_Jakarta_Sans'] text-[10px] font-bold rounded-md transition-colors ${
                  language === 'EN' ? 'bg-white text-[#00247d] shadow-xs' : 'text-[#747686]'
                }`}
              >
                EN
              </button>
            </div>
          </div>

          {/* Change Password */}
          <div
            onClick={() => setShowPasswordModal(true)}
            className="pt-2.5 flex items-center justify-between cursor-pointer hover:bg-[#faf8ff] p-1 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[#00247d] text-[20px]">lock_reset</span>
              <div>
                <p className="font-['Plus_Jakarta_Sans'] text-xs font-bold text-[#1a1b22]">Đổi mật khẩu tài khoản</p>
                <p className="text-[10px] text-[#747686]">Lần cập nhật gần nhất: 14 ngày trước</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-[#747686] text-[18px]">chevron_right</span>
          </div>
        </div>
      </div>

      {/* 6. Safe Sign Out Action Button */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-[#eeedf7]">
        <div className="flex items-start gap-2.5 mb-3">
          <div className="w-9 h-9 rounded-full bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[20px]">lock_clock</span>
          </div>
          <div>
            <h4 className="font-['Plus_Jakarta_Sans'] text-xs font-bold text-[#1a1b22]">Kết thúc & Đăng xuất ca</h4>
            <p className="text-[11px] text-[#444654] mt-0.5 leading-relaxed">
              Đảm bảo bạn đã kiểm đếm két tiền, đối soát voucher và hoàn tất bàn giao thẻ tủ locker trước khi rời quầy.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowSignOutModal(true)}
          className="w-full h-11 rounded-lg bg-[#ffdad6] text-[#ba1a1a] hover:bg-[#ba1a1a] hover:text-white active:scale-[0.99] transition-all font-['Plus_Jakarta_Sans'] text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs"
        >
          <span className="material-symbols-outlined text-[18px]">logout</span>
          <span>Đăng xuất khỏi hệ thống</span>
        </button>
      </div>

      {/* App Version Info */}
      <div className="text-center py-2">
        <span className="font-['Plus_Jakarta_Sans'] text-[11px] text-[#747686] font-semibold">
          SCMS Sports Center Core v3.4.1 (Build 24080)
        </span>
        <p className="text-[10px] text-[#747686]/80 mt-0.5">© 2025 Sports Club Management System</p>
      </div>

      {/* MODAL: Sign Out Confirmation */}
      {showSignOutModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl p-5 shadow-2xl space-y-3 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-11 h-11 rounded-full bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[24px]">warning</span>
              </div>
              <div>
                <h3 className="font-['Plus_Jakarta_Sans'] text-sm font-bold text-[#1a1b22]">Xác nhận kết thúc ca trực?</h3>
                <span className="text-xs text-[#ba1a1a] font-bold">
                  Tài khoản: {shiftInfo.staffId} ({shiftInfo.staffName})
                </span>
              </div>
            </div>

            <div className="bg-[#f2f3ff] rounded-xl p-3 border border-[#eaedff]">
              <p className="text-xs text-[#1a1b22] leading-relaxed">
                Bạn có chắc chắn muốn đăng xuất ca trực{' '}
                <strong className="text-[#00247d] font-bold">{shiftInfo.staffId}</strong>? Vui lòng đảm bảo:
              </p>
              <ul className="mt-2 space-y-1 text-xs text-[#444654]">
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[15px] text-[#006c49]">check_circle</span>
                  Chốt số dư tiền mặt tại quầy A (5.850.000 đ)
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[15px] text-[#006c49]">check_circle</span>
                  Kiểm tra 40 chìa khóa vòng tay RFID
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[15px] text-[#006c49]">check_circle</span>
                  Chuyển giao nhật ký trực cho nhân sự ca sau
                </li>
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setShowSignOutModal(false)}
                className="h-10 rounded-lg bg-[#eeedf7] text-[#1a1b22] font-['Plus_Jakarta_Sans'] text-xs font-bold"
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => {
                  setShowSignOutModal(false);
                  soundFX.playSuccess();
                  onSignOut();
                }}
                className="h-10 rounded-lg bg-[#ba1a1a] text-white font-['Plus_Jakarta_Sans'] text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-transform"
              >
                <span className="material-symbols-outlined text-[16px]">logout</span>
                <span>Xác nhận Đăng xuất</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Thermal POS Test Receipt */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-xs bg-white rounded-2xl p-4 shadow-2xl space-y-3 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-[#eeedf7]">
              <span className="text-[10px] font-bold text-[#006c49]">Epson TM-T82III Test Print</span>
              <button onClick={() => setShowPrintModal(false)} className="text-[#747686]">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Receipt Preview */}
            <div className="bg-[#faf8ff] p-3 rounded-lg border border-dashed border-[#747686] font-mono text-[11px] text-[#1a1b22] space-y-1.5">
              <p className="text-center font-bold text-xs uppercase">SCMS SPORTS CENTER</p>
              <p className="text-center text-[10px] text-[#747686]">Hotline: 1900 8899 - Tầng 1 Quầy A</p>
              <p className="border-b border-dashed border-[#747686] pb-1">--------------------------------</p>
              <div className="flex justify-between">
                <span>Ca trực:</span>
                <span>Ca Sáng (06:00-14:00)</span>
              </div>
              <div className="flex justify-between">
                <span>Thu ngân:</span>
                <span>REC-8802 (Tuấn)</span>
              </div>
              <div className="flex justify-between">
                <span>In lúc:</span>
                <span>{new Date().toLocaleTimeString('vi-VN')}</span>
              </div>
              <p className="border-b border-dashed border-[#747686] py-1">--------------------------------</p>
              <div className="flex justify-between font-bold">
                <span>TEST PHẦN CỨNG:</span>
                <span className="text-[#006c49]">PASSED OK</span>
              </div>
              <p className="text-center text-[10px] text-[#747686] pt-1">Cảm ơn quý khách & chúc tập luyện vui vẻ!</p>
            </div>

            <button
              onClick={() => {
                setShowPrintModal(false);
                onShowToast('Phiếu in đã xuất thành công!', 'success');
              }}
              className="w-full h-9 rounded-lg bg-[#00247d] text-white font-['Plus_Jakarta_Sans'] text-xs font-bold"
            >
              Đóng xem trước
            </button>
          </div>
        </div>
      )}

      {/* MODAL: Change Password */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl p-4 shadow-2xl space-y-3 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-[#eeedf7]">
              <h3 className="font-['Plus_Jakarta_Sans'] text-sm font-bold text-[#1a1b22]">Đổi mật khẩu tài khoản</h3>
              <button onClick={() => setShowPasswordModal(false)} className="text-[#747686]">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="space-y-2">
              <div>
                <label className="block text-xs font-semibold text-[#1a1b22] mb-1">Mật khẩu mới</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Tối thiểu 8 ký tự"
                  className="w-full h-10 px-3 bg-[#f2f3ff] rounded-lg text-xs font-medium text-[#1a1b22] focus:outline-none focus:ring-2 focus:ring-[#00247d]"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowPasswordModal(false)}
                className="w-1/2 h-9 rounded-lg bg-[#eeedf7] text-[#1a1b22] font-['Plus_Jakarta_Sans'] text-xs font-semibold"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => {
                  if (newPassword.length < 6) {
                    onShowToast('Mật khẩu cần tối thiểu 6 ký tự', 'error');
                    return;
                  }
                  setShowPasswordModal(false);
                  setNewPassword('');
                  soundFX.playSuccess();
                  onShowToast('Đã đổi mật khẩu thành công!', 'success');
                }}
                className="w-1/2 h-9 rounded-lg bg-[#00247d] text-white font-['Plus_Jakarta_Sans'] text-xs font-bold"
              >
                Cập nhật
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
