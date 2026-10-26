import React, { useState } from 'react';
import { soundFX } from '../utils/audio';

interface AuthScreenProps {
  onLoginSuccess: (name?: string) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info', title?: string) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess, onShowToast }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegRePassword, setShowRegRePassword] = useState(false);

  // Form states
  const [identifier, setIdentifier] = useState('REC-8802');
  const [password, setPassword] = useState('••••••••');
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Register form states
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regRole, setRegRole] = useState<'member' | 'trainer' | 'staff'>('member');
  const [regPass, setRegPass] = useState('');
  const [regRePass, setRegRePass] = useState('');
  const [regTerms, setRegTerms] = useState(true);

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      soundFX.playError();
      onShowToast('Vui lòng điền đủ tên tài khoản và mật khẩu.', 'error', 'Lỗi đăng nhập');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      soundFX.playSuccess();
      onShowToast('Đăng nhập thành công! Đang đồng bộ phiên hoạt động SCMS Pro...', 'success', 'Thành công');
      setTimeout(() => {
        onLoginSuccess('Nguyễn Minh Tuấn');
      }, 600);
    }, 800);
  };

  // Handle Register
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regTerms) {
      soundFX.playError();
      onShowToast('Bạn cần đồng ý với điều khoản dịch vụ để tiếp tục.', 'error', 'Quy định SCMS');
      return;
    }
    if (regPass.length < 8) {
      soundFX.playError();
      onShowToast('Mật khẩu cần tối thiểu 8 ký tự an toàn.', 'error', 'Mật khẩu yếu');
      return;
    }
    if (regPass !== regRePass) {
      soundFX.playError();
      onShowToast('Mật khẩu và xác nhận mật khẩu không khớp.', 'error', 'Kiểm tra mật khẩu');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      soundFX.playSuccess();
      onShowToast(`Đăng ký tài khoản ${regName} thành công! Đã đăng nhập vào hệ thống.`, 'success', 'Chào mừng');
      setTimeout(() => {
        onLoginSuccess(regName);
      }, 600);
    }, 900);
  };

  // Biometrics
  const handleBiometric = () => {
    onShowToast('Đang quét sinh trắc học Face ID / Vân tay thiết bị...', 'info', 'Sinh trắc học');
    setTimeout(() => {
      soundFX.playSuccess();
      onShowToast('Xác thực Face ID khớp với hồ sơ trưởng ca REC-8802!', 'success', 'Hoàn tất');
      setTimeout(() => {
        onLoginSuccess('Nguyễn Minh Tuấn');
      }, 700);
    }, 1000);
  };

  // Google SSO
  const handleGoogleSSO = () => {
    onShowToast('Đang kết nối dịch vụ tài khoản doanh nghiệp Google...', 'info', 'SSO Google');
    setTimeout(() => {
      soundFX.playSuccess();
      onShowToast('Đã liên kết Google Workspace thành công!', 'success');
      setTimeout(() => {
        onLoginSuccess('Nguyễn Minh Tuấn');
      }, 700);
    }, 1100);
  };

  return (
    <div className="flex flex-col w-full max-w-lg mx-auto px-4 pb-20 pt-2">
      {/* Brand Showcase & Welcome Header */}
      <div className="relative w-full rounded-2xl overflow-hidden mt-2 mb-4 shadow-sm border border-[#eeedf7]">
        <div
          className="w-full h-44 bg-cover bg-center relative flex flex-col justify-end p-4"
          style={{
            backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDBf5zOtWOO04VvtX31FDKsAtY8afpve4ItiZ82kvsvwMpK4pIJ5EtH-nNSqyVYS05djqy_WRr9IWRRyU2DwA4shpknV4XHajDWxpqSqmNhawhhgVkFKx492LELNtwBBMp8BtAQPV8xBzKyWc85L51ruM9DWRBYlLqMZJPHNLeB2C5Fpc5KK2HgiD1ddydAnFUjIa6pq_vdC2AMhvomm-Udqv3wg6_nN9CqkF-WwUZyYxZLk4E_krXM')`,
          }}
        >
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#00247d] via-[#00247d]/80 to-transparent" />

          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center text-[#00247d] shadow-md">
                <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  fitness_center
                </span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-['Plus_Jakarta_Sans'] font-extrabold text-lg text-white tracking-wider">
                    SCMS
                  </span>
                  <span className="px-1.5 py-0.5 rounded-full bg-[#006c49] text-white font-['Plus_Jakarta_Sans'] text-[10px] font-bold">
                    SPORTS PRO
                  </span>
                </div>
                <p className="text-xs text-[#dae2fd] font-medium">Quản lý & Vận hành Thể thao Số 1</p>
              </div>
            </div>

            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-white">
              <span className="w-2 h-2 rounded-full bg-[#9df4c8] animate-ping" />
              <span className="font-['Plus_Jakarta_Sans'] text-[10px] font-bold">Hệ thống v4.2</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dual Mode Segmented Tab Selector */}
      <div className="w-full bg-[#e8e7f2] p-1 rounded-xl flex items-center mb-4 relative shadow-inner">
        <button
          onClick={() => setActiveTab('login')}
          className={`flex-1 py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all duration-200 font-['Plus_Jakarta_Sans'] text-xs font-bold cursor-pointer ${
            activeTab === 'login'
              ? 'bg-white text-[#00247d] shadow-xs'
              : 'text-[#444654] hover:text-[#1a1b22]'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">key</span>
          <span>Đăng nhập</span>
        </button>
        <button
          onClick={() => setActiveTab('register')}
          className={`flex-1 py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all duration-200 font-['Plus_Jakarta_Sans'] text-xs font-bold cursor-pointer ${
            activeTab === 'register'
              ? 'bg-white text-[#006c49] shadow-xs'
              : 'text-[#444654] hover:text-[#1a1b22]'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          <span>Đăng ký mới</span>
        </button>
      </div>

      {/* TAB 1: LOGIN */}
      {activeTab === 'login' ? (
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-[#eeedf7] space-y-4 animate-in fade-in duration-150">
          <div>
            <h2 className="font-['Plus_Jakarta_Sans'] text-lg font-bold text-[#1a1b22]">Chào mừng trở lại!</h2>
            <p className="text-xs text-[#444654] mt-0.5">
              Nhập thông tin xác thực để bắt đầu phiên làm việc hoặc tập luyện
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-3.5">
            {/* Account Identifier */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#1a1b22]">
                Tài khoản truy cập <span className="text-[#ba1a1a]">*</span>
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-[#747686] text-[20px]">badge</span>
                <input
                  type="text"
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  placeholder="Email, SĐT hoặc Mã NV (VD: SC-1029)"
                  required
                  className="w-full bg-[#f2f3ff] pl-10 pr-4 py-2.5 rounded-lg text-xs font-medium text-[#1a1b22] placeholder:text-[#747686] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#00247d] border border-[#eaedff] transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#1a1b22]">
                Mật khẩu bảo mật <span className="text-[#ba1a1a]">*</span>
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-[#747686] text-[20px]">lock</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-[#f2f3ff] pl-10 pr-10 py-2.5 rounded-lg text-xs font-medium text-[#1a1b22] placeholder:text-[#747686] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#00247d] border border-[#eaedff] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-[#747686] hover:text-[#00247d]"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-[#00247d] accent-[#00247d]"
                />
                <span className="text-xs text-[#444654]">Ghi nhớ phiên đăng nhập</span>
              </label>
              <button
                type="button"
                onClick={() =>
                  onShowToast('Vui lòng liên hệ Lễ tân hoặc IT Desk: 1900 8899 để cấp lại mật khẩu.', 'info', 'Quên mật khẩu')
                }
                className="font-['Plus_Jakarta_Sans'] text-xs font-semibold text-[#00247d] hover:underline"
              >
                Quên mật khẩu?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#1d4ed8] hover:bg-[#00247d] text-white py-3 px-4 rounded-lg font-['Plus_Jakarta_Sans'] text-xs font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-md cursor-pointer disabled:opacity-75"
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                  <span>Đang xác thực...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">login</span>
                  <span>Đăng nhập hệ thống</span>
                </>
              )}
            </button>
          </form>

          {/* Fast Biometrics & Single Sign-On */}
          <div className="pt-2 flex flex-col items-center space-y-3">
            <div className="w-full flex items-center gap-2">
              <div className="flex-1 h-px bg-[#eeedf7]" />
              <span className="font-['Plus_Jakarta_Sans'] text-[10px] font-bold text-[#747686] uppercase tracking-wider">
                hoặc đăng nhập nhanh
              </span>
              <div className="flex-1 h-px bg-[#eeedf7]" />
            </div>

            <div className="grid grid-cols-2 gap-2 w-full">
              <button
                type="button"
                onClick={handleBiometric}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-[#f2f3ff] hover:bg-[#eaedff] text-[#1a1b22] active:scale-95 transition-all cursor-pointer border border-[#eaedff]"
              >
                <span className="material-symbols-outlined text-[#00247d] text-[20px]">fingerprint</span>
                <span className="font-['Plus_Jakarta_Sans'] text-xs font-bold">Touch / Face ID</span>
              </button>
              <button
                type="button"
                onClick={handleGoogleSSO}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-[#f2f3ff] hover:bg-[#eaedff] text-[#1a1b22] active:scale-95 transition-all cursor-pointer border border-[#eaedff]"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.02 0 12s.45 3.82 1.25 5.42l4.03-3.15Z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
                    fill="#EA4335"
                  />
                </svg>
                <span className="font-['Plus_Jakarta_Sans'] text-xs font-bold">Google Work</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* TAB 2: REGISTER */
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-[#eeedf7] space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-['Plus_Jakarta_Sans'] text-lg font-bold text-[#1a1b22]">Đăng ký thành viên</h2>
              <p className="text-xs text-[#444654] mt-0.5">Tạo hồ sơ vận hành SCMS Sports Network</p>
            </div>
            <span className="px-2 py-0.5 rounded bg-[#9af2c5] text-[#00714d] font-['Plus_Jakarta_Sans'] text-[10px] font-bold">
              Tức thì
            </span>
          </div>

          <form onSubmit={handleRegister} className="space-y-3">
            {/* Full Name */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#1a1b22]">
                Họ và tên đầy đủ <span className="text-[#ba1a1a]">*</span>
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-[#747686] text-[20px]">person</span>
                <input
                  type="text"
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                  placeholder="Nguyễn Văn An"
                  required
                  className="w-full bg-[#f2f3ff] pl-10 pr-4 py-2.5 rounded-lg text-xs font-medium text-[#1a1b22] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#006c49] border border-[#eaedff]"
                />
              </div>
            </div>

            {/* Phone & Email */}
            <div className="grid grid-cols-1 gap-2.5">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#1a1b22]">
                  Số điện thoại <span className="text-[#ba1a1a]">*</span>
                </label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3 text-[#747686] text-[20px]">call</span>
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={e => setRegPhone(e.target.value)}
                    placeholder="0908 123 456"
                    required
                    className="w-full bg-[#f2f3ff] pl-10 pr-4 py-2.5 rounded-lg text-xs font-medium text-[#1a1b22] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#006c49] border border-[#eaedff]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#1a1b22]">
                  Địa chỉ Email <span className="text-[#ba1a1a]">*</span>
                </label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3 text-[#747686] text-[20px]">mail</span>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={e => setRegEmail(e.target.value)}
                    placeholder="name@scms-center.vn"
                    required
                    className="w-full bg-[#f2f3ff] pl-10 pr-4 py-2.5 rounded-lg text-xs font-medium text-[#1a1b22] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#006c49] border border-[#eaedff]"
                  />
                </div>
              </div>
            </div>

            {/* Role Selector */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#1a1b22]">Vai trò hoạt động</label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { key: 'member', label: 'Hội viên mới' },
                  { key: 'trainer', label: 'HLV Thể thao' },
                  { key: 'staff', label: 'Nhân viên CLB' },
                ].map(r => (
                  <button
                    key={r.key}
                    type="button"
                    onClick={() => setRegRole(r.key as any)}
                    className={`py-2 px-1 rounded-lg text-center font-['Plus_Jakarta_Sans'] text-xs font-semibold transition-colors cursor-pointer border ${
                      regRole === r.key
                        ? 'bg-[#9af2c5] text-[#00714d] border-[#006c49]'
                        : 'bg-[#f2f3ff] text-[#444654] border-[#eaedff] hover:bg-[#eaedff]'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Passwords */}
            <div className="space-y-2.5">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#1a1b22]">
                  Mật khẩu <span className="text-[#ba1a1a]">*</span>
                </label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3 text-[#747686] text-[20px]">lock</span>
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    value={regPass}
                    onChange={e => setRegPass(e.target.value)}
                    placeholder="Tối thiểu 8 ký tự"
                    required
                    className="w-full bg-[#f2f3ff] pl-10 pr-10 py-2.5 rounded-lg text-xs font-medium text-[#1a1b22] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#006c49] border border-[#eaedff]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-3 text-[#747686] hover:text-[#006c49]"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showRegPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#1a1b22]">
                  Xác nhận mật khẩu <span className="text-[#ba1a1a]">*</span>
                </label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3 text-[#747686] text-[20px]">verified</span>
                  <input
                    type={showRegRePassword ? 'text' : 'password'}
                    value={regRePass}
                    onChange={e => setRegRePass(e.target.value)}
                    placeholder="Nhập lại mật khẩu"
                    required
                    className="w-full bg-[#f2f3ff] pl-10 pr-10 py-2.5 rounded-lg text-xs font-medium text-[#1a1b22] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#006c49] border border-[#eaedff]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegRePassword(!showRegRePassword)}
                    className="absolute right-3 text-[#747686] hover:text-[#006c49]"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showRegRePassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Terms Agreement */}
            <div className="flex items-start gap-2 pt-1">
              <input
                id="reg-terms-box"
                type="checkbox"
                checked={regTerms}
                onChange={e => setRegTerms(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded text-[#006c49] accent-[#006c49]"
                required
              />
              <label htmlFor="reg-terms-box" className="text-xs text-[#444654] leading-tight select-none">
                Tôi đồng ý với{' '}
                <span
                  onClick={() => onShowToast('Chính sách điều khoản và an toàn phòng tập SCMS 2024.', 'info')}
                  className="text-[#00247d] underline cursor-pointer"
                >
                  Điều khoản dịch vụ
                </span>{' '}
                và quy tắc vận hành thể thao SCMS.
              </label>
            </div>

            {/* Create Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#006c49] hover:bg-[#005236] text-white py-3 px-4 rounded-lg font-['Plus_Jakarta_Sans'] text-xs font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-md cursor-pointer disabled:opacity-75"
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                  <span>Đang khởi tạo tài khoản...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
                  <span>Tạo tài khoản SCMS</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Operational Hotline Badge */}
      <div className="mt-4 bg-[#f2f3ff] border border-[#eaedff] rounded-xl p-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#dae2fd] flex items-center justify-center text-[#00247d]">
            <span className="material-symbols-outlined text-[18px]">support_agent</span>
          </div>
          <div>
            <p className="font-['Plus_Jakarta_Sans'] text-xs font-bold text-[#1a1b22]">Hỗ trợ kỹ thuật SCMS</p>
            <p className="text-[11px] text-[#444654]">Hotline 24/7: 1900 8899</p>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-[#dae2fd] text-[#00247d] font-['Plus_Jakarta_Sans'] text-[10px] font-bold">
          Bảo mật ISO
        </span>
      </div>
    </div>
  );
};
