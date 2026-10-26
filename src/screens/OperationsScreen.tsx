import React, { useState, useMemo } from 'react';
import { Member, ReceptionNote, ShiftInfo, ClassSession } from '../types';
import { AVAILABLE_PACKAGES } from '../data/mockData';
import { soundFX } from '../utils/audio';

interface OperationsScreenProps {
  members: Member[];
  onUpdateMember: (member: Member) => void;
  onAddMember: (member: Member) => void;
  shiftInfo: ShiftInfo;
  onUpdateShift: (shift: ShiftInfo) => void;
  notes: ReceptionNote[];
  onAddNote: (note: ReceptionNote) => void;
  onToggleNote: (id: string) => void;
  classes: ClassSession[];
  onBookClass: (classId: string) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info', title?: string) => void;
}

export const OperationsScreen: React.FC<OperationsScreenProps> = ({
  members,
  onUpdateMember,
  onAddMember,
  shiftInfo,
  onUpdateShift,
  notes,
  onAddNote,
  onToggleNote,
  classes,
  onBookClass,
  onShowToast,
}) => {
  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'checked-in' | 'expiring' | 'day-pass' | 'vip'>('all');
  const [sortAsc, setSortAsc] = useState(false);

  // Modals state
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [showNewMemberModal, setShowNewMemberModal] = useState(false);
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [renewingMember, setRenewingMember] = useState<Member | null>(null);
  const [showClassModal, setShowClassModal] = useState(false);
  const [showVietQRModal, setShowVietQRModal] = useState(false);
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);

  // QR Modal scanner state
  const [isScanning, setIsScanning] = useState(false);

  // New Member form state (2-step)
  const [newMemberStep, setNewMemberStep] = useState(1);
  const [newMemberData, setNewMemberData] = useState({
    name: '',
    phone: '',
    planId: 'month-1',
    locker: '23',
    vip: false,
    initialPayment: 'vietqr',
  });

  // Note form state
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNotePriority, setNewNotePriority] = useState<'normal' | 'urgent' | 'hold'>('normal');

  // Filtered members calculation
  const filteredMembers = useMemo(() => {
    let result = members.filter(m => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.id.toLowerCase().includes(q) ||
        m.phone.includes(q) ||
        m.locker.includes(q);

      if (!matchSearch) return false;

      if (activeFilter === 'checked-in') return m.isCheckedIn;
      if (activeFilter === 'expiring') return m.status === 'expiring';
      if (activeFilter === 'day-pass') return m.status === 'daypass';
      if (activeFilter === 'vip') return m.tier?.includes('VIP') || m.category.includes('vip');
      return true;
    });

    result = [...result].sort((a, b) => {
      if (sortAsc) return a.name.localeCompare(b.name);
      return (b.checkInTime ? 1 : 0) - (a.checkInTime ? 1 : 0);
    });

    return result;
  }, [members, searchQuery, activeFilter, sortAsc]);

  // Handle Quick Check-In
  const handleCheckIn = (member: Member) => {
    const updated: Member = {
      ...member,
      isCheckedIn: true,
      checkInTime: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' hôm nay',
      category: `${member.category} checked-in`,
    };
    onUpdateMember(updated);
    onUpdateShift({
      ...shiftInfo,
      totalCheckIns: shiftInfo.totalCheckIns + 1,
      currentFloorCount: shiftInfo.currentFloorCount + 1,
    });
    soundFX.playSuccess();
    onShowToast(`Check-in thành công: ${member.name} (Tủ #${member.locker})`, 'success', 'Vào sàn hợp lệ');
  };

  // Handle Check-Out / Tra Tu
  const handleCheckOut = (member: Member) => {
    const updated: Member = {
      ...member,
      isCheckedIn: false,
      lastCheckIn: 'Vừa trả tủ',
      category: member.category.replace('checked-in', '').trim(),
    };
    onUpdateMember(updated);
    onUpdateShift({
      ...shiftInfo,
      currentFloorCount: Math.max(0, shiftInfo.currentFloorCount - 1),
    });
    soundFX.playSuccess();
    onShowToast(`Đã thu hồi tủ #${member.locker} của ${member.name}`, 'info', 'Hoàn tất trả tủ');
  };

  // Trigger quick search focus
  const triggerVaoSan = () => {
    const searchEl = document.getElementById('memberSearchInput');
    searchEl?.focus();
    onShowToast('Sẵn sàng quét thẻ hoặc nhập SĐT để Check-in!', 'info');
  };

  // Save changes from Edit Modal
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    onUpdateMember(editingMember);
    setEditingMember(null);
    soundFX.playSuccess();
    onShowToast(`Đã cập nhật thông tin cho ${editingMember.name}`, 'success');
  };

  // Create new member submit
  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault();
    const pkg = AVAILABLE_PACKAGES.find(p => p.id === newMemberData.planId) || AVAILABLE_PACKAGES[1];
    const newId = `SCMS-${Math.floor(10000 + Math.random() * 90000)}`;

    const newM: Member = {
      id: newId,
      name: newMemberData.name,
      phone: newMemberData.phone,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
      altText: `Hội viên mới ${newMemberData.name}`,
      plan: pkg.name,
      locker: newMemberData.locker || '50',
      status: 'active',
      category: newMemberData.vip ? 'vip checked-in' : 'checked-in',
      checkInTime: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' hôm nay',
      isCheckedIn: true,
      tier: newMemberData.vip ? 'VIP' : 'Standard',
      notes: `Đăng ký mới tại bàn ${shiftInfo.desk}`,
    };

    onAddMember(newM);
    onUpdateShift({
      ...shiftInfo,
      totalCheckIns: shiftInfo.totalCheckIns + 1,
      currentFloorCount: shiftInfo.currentFloorCount + 1,
      shiftRevenue: shiftInfo.shiftRevenue + pkg.price,
      paymentCount: shiftInfo.paymentCount + 1,
    });

    soundFX.playCashRegister();
    setShowNewMemberModal(false);
    setNewMemberStep(1);
    setNewMemberData({ name: '', phone: '', planId: 'month-1', locker: '23', vip: false, initialPayment: 'vietqr' });
    onShowToast(`Đăng ký thành công hội viên ${newM.name} (${newM.id})`, 'success', 'Thành viên mới');
  };

  // Renew member submit
  const handleRenewSubmit = (pkgId: string) => {
    if (!renewingMember) return;
    const pkg = AVAILABLE_PACKAGES.find(p => p.id === pkgId);
    if (!pkg) return;

    const updated: Member = {
      ...renewingMember,
      status: 'active',
      plan: `${pkg.name} (Đã gia hạn)`,
      expireDays: 30,
      sessionsLeft: 12,
      category: renewingMember.category.replace('expiring', '').trim(),
    };

    onUpdateMember(updated);
    onUpdateShift({
      ...shiftInfo,
      shiftRevenue: shiftInfo.shiftRevenue + pkg.price,
      paymentCount: shiftInfo.paymentCount + 1,
    });

    soundFX.playCashRegister();
    setShowRenewModal(false);
    setRenewingMember(null);
    onShowToast(`Gia hạn thành công gói ${pkg.name} cho ${updated.name}`, 'success', 'Gia hạn hoàn tất');
  };

  // Add Note Submit
  const handleAddNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim()) return;

    const note: ReceptionNote = {
      id: `note-${Date.now()}`,
      content: newNoteContent.trim(),
      author: shiftInfo.staffId,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      priority: newNotePriority,
      resolved: false,
    };

    onAddNote(note);
    setNewNoteContent('');
    setShowAddNoteModal(false);
    soundFX.playSuccess();
    onShowToast('Đã thêm ghi chú ca trực mới', 'success');
  };

  // Scan simulation
  const simulateScanCard = (id: string) => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setShowScannerModal(false);
      const target = members.find(m => m.id === id);
      if (target) {
        handleCheckIn(target);
      } else {
        soundFX.playError();
        onShowToast(`Không tìm thấy thẻ ${id} trong hệ thống!`, 'error');
      }
    }, 900);
  };

  return (
    <div className="flex flex-col w-full max-w-lg mx-auto px-4 pb-24 pt-3 space-y-4">
      {/* 1. Compact Shift Header Card */}
      <div className="bg-white rounded-xl p-3 shadow-xs border border-[#eeedf7] flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-[#eeedf7] flex items-center justify-center shrink-0 text-[#00247d]">
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              badge
            </span>
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-['Plus_Jakarta_Sans'] text-xs text-[#1a1b22] font-bold truncate">
                {shiftInfo.shiftName}
              </span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#9af2c5] text-[#00714d]">
                {shiftInfo.timeRange}
              </span>
            </div>
            <p className="text-[11px] text-[#444654] truncate">
              {shiftInfo.desk} • Nhân viên: {shiftInfo.staffId} ({shiftInfo.staffName})
            </p>
          </div>
        </div>
        <div className="shrink-0 flex items-center gap-1.5 bg-[#f2f3ff] px-2 py-1 rounded-full">
          <span className="w-2 h-2 rounded-full bg-[#006c49] animate-pulse" />
          <span className="font-['Plus_Jakarta_Sans'] text-[11px] font-bold text-[#006c49]">Trực tuyến</span>
        </div>
      </div>

      {/* 2. Smart Search & QR Bar */}
      <div className="flex flex-col space-y-2">
        <div className="flex items-stretch gap-2">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#747686] text-[20px]">
              search
            </span>
            <input
              id="memberSearchInput"
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Tìm SĐT, Tên, Mã SCMS..."
              className="w-full h-11 pl-10 pr-9 bg-white rounded-lg text-xs font-medium text-[#1a1b22] placeholder:text-[#747686] focus:outline-none focus:ring-2 focus:ring-[#00247d]/30 border border-[#eeedf7] shadow-xs transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#747686] hover:text-[#1a1b22] p-1"
                aria-label="Xóa tìm kiếm"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            )}
          </div>

          {/* Big Action QR Scan */}
          <button
            onClick={() => setShowScannerModal(true)}
            className="h-11 px-4 bg-[#1d4ed8] hover:bg-[#00247d] text-white rounded-lg flex items-center justify-center gap-1.5 font-['Plus_Jakarta_Sans'] text-xs font-bold active:scale-95 transition-all shadow-xs shrink-0 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">qr_code_scanner</span>
            <span>Quét QR</span>
          </button>
        </div>

        {/* Quick Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 -mx-1 px-1">
          <button
            onClick={() => setActiveFilter('all')}
            className={`shrink-0 px-3 py-1.5 rounded-full font-['Plus_Jakarta_Sans'] text-xs transition-colors cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-[#00247d] text-white font-bold'
                : 'bg-white text-[#444654] border border-[#eeedf7] hover:bg-[#f2f3ff]'
            }`}
          >
            Tất cả ({members.length})
          </button>
          <button
            onClick={() => setActiveFilter('checked-in')}
            className={`shrink-0 px-3 py-1.5 rounded-full font-['Plus_Jakarta_Sans'] text-xs transition-colors cursor-pointer ${
              activeFilter === 'checked-in'
                ? 'bg-[#00247d] text-white font-bold'
                : 'bg-white text-[#444654] border border-[#eeedf7] hover:bg-[#f2f3ff]'
            }`}
          >
            Đã check-in ({members.filter(m => m.isCheckedIn).length})
          </button>
          <button
            onClick={() => setActiveFilter('expiring')}
            className={`shrink-0 px-3 py-1.5 rounded-full font-['Plus_Jakarta_Sans'] text-xs transition-colors cursor-pointer ${
              activeFilter === 'expiring'
                ? 'bg-[#00247d] text-white font-bold'
                : 'bg-white text-[#444654] border border-[#eeedf7] hover:bg-[#f2f3ff]'
            }`}
          >
            Sắp hết hạn ({members.filter(m => m.status === 'expiring').length})
          </button>
          <button
            onClick={() => setActiveFilter('day-pass')}
            className={`shrink-0 px-3 py-1.5 rounded-full font-['Plus_Jakarta_Sans'] text-xs transition-colors cursor-pointer ${
              activeFilter === 'day-pass'
                ? 'bg-[#00247d] text-white font-bold'
                : 'bg-white text-[#444654] border border-[#eeedf7] hover:bg-[#f2f3ff]'
            }`}
          >
            Vé ngày ({members.filter(m => m.status === 'daypass').length})
          </button>
          <button
            onClick={() => setActiveFilter('vip')}
            className={`shrink-0 px-3 py-1.5 rounded-full font-['Plus_Jakarta_Sans'] text-xs transition-colors cursor-pointer ${
              activeFilter === 'vip'
                ? 'bg-[#00247d] text-white font-bold'
                : 'bg-white text-[#444654] border border-[#eeedf7] hover:bg-[#f2f3ff]'
            }`}
          >
            VIP / Platinum
          </button>
        </div>
      </div>

      {/* 3. Operational Metrics / KPIs */}
      <div className="grid grid-cols-3 gap-2">
        {/* Metric 1 */}
        <div className="bg-white rounded-xl p-3 shadow-xs border border-[#eeedf7] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-['Plus_Jakarta_Sans'] text-[10px] text-[#444654] uppercase tracking-wider font-bold">
              Đã Check-in
            </span>
            <span className="material-symbols-outlined text-[#006c49] text-[16px]">how_to_reg</span>
          </div>
          <div className="mt-2">
            <span className="font-['Plus_Jakarta_Sans'] text-2xl font-extrabold text-[#1a1b22] leading-tight">
              {shiftInfo.totalCheckIns}
            </span>
            <div className="flex items-center gap-0.5 mt-0.5">
              <span className="material-symbols-outlined text-[#006c49] text-[14px]">trending_up</span>
              <span className="font-['Plus_Jakarta_Sans'] text-[11px] font-bold text-[#006c49]">+18%</span>
            </div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white rounded-xl p-3 shadow-xs border border-[#eeedf7] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-['Plus_Jakarta_Sans'] text-[10px] text-[#444654] uppercase tracking-wider font-bold">
              Có mặt sàn
            </span>
            <span className="material-symbols-outlined text-[#00247d] text-[16px]">fitness_center</span>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-1">
              <span className="font-['Plus_Jakarta_Sans'] text-2xl font-extrabold text-[#00247d] leading-tight">
                {shiftInfo.currentFloorCount}
              </span>
              <span className="text-[11px] text-[#747686]">/ {shiftInfo.maxFloorCapacity}</span>
            </div>
            <div className="w-full bg-[#eeedf7] h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div
                className="bg-[#00247d] h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.round((shiftInfo.currentFloorCount / shiftInfo.maxFloorCapacity) * 100))}%` }}
              />
            </div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white rounded-xl p-3 shadow-xs border border-[#eeedf7] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-['Plus_Jakarta_Sans'] text-[10px] text-[#444654] uppercase tracking-wider font-bold">
              Thu Quầy
            </span>
            <span className="material-symbols-outlined text-[#006c49] text-[16px]">payments</span>
          </div>
          <div className="mt-2">
            <span className="font-['Plus_Jakarta_Sans'] text-lg font-bold text-[#1a1b22] tracking-tight">
              {(shiftInfo.shiftRevenue / 1000000).toFixed(2)}M
            </span>
            <p className="text-[10px] text-[#747686] mt-0.5">{shiftInfo.paymentCount} lượt thanh toán</p>
          </div>
        </div>
      </div>

      {/* 4. Quick Action Grid (Tactile Touch Buttons) */}
      <div className="bg-white rounded-xl p-3.5 shadow-xs border border-[#eeedf7] space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="font-['Plus_Jakarta_Sans'] text-xs font-bold text-[#1a1b22] uppercase tracking-wide">
            Thao tác quầy tốc độ
          </h2>
          <span className="font-['Plus_Jakarta_Sans'] text-[11px] text-[#747686]">Phím tắt lễ tân</span>
        </div>
        <div className="grid grid-cols-5 gap-1.5 pt-1">
          {/* Action 1 */}
          <button
            onClick={triggerVaoSan}
            className="flex flex-col items-center justify-center p-2 rounded-lg bg-[#f2f3ff] hover:bg-[#eaedff] active:scale-95 transition-all text-center cursor-pointer"
          >
            <div className="w-9 h-9 rounded-full bg-[#9af2c5] text-[#00714d] flex items-center justify-center mb-1 shadow-xs">
              <span className="material-symbols-outlined text-[18px]">login</span>
            </div>
            <span className="font-['Plus_Jakarta_Sans'] text-[10px] font-bold text-[#1a1b22] leading-tight">
              Vào sàn
            </span>
          </button>

          {/* Action 2 */}
          <button
            onClick={() => setShowNewMemberModal(true)}
            className="flex flex-col items-center justify-center p-2 rounded-lg bg-[#f2f3ff] hover:bg-[#eaedff] active:scale-95 transition-all text-center cursor-pointer"
          >
            <div className="w-9 h-9 rounded-full bg-[#dce1ff] text-[#063ab2] flex items-center justify-center mb-1 shadow-xs">
              <span className="material-symbols-outlined text-[18px]">person_add</span>
            </div>
            <span className="font-['Plus_Jakarta_Sans'] text-[10px] font-bold text-[#1a1b22] leading-tight">
              Đăng ký mới
            </span>
          </button>

          {/* Action 3 */}
          <button
            onClick={() => {
              const exp = members.find(m => m.status === 'expiring') || members[0];
              setRenewingMember(exp);
              setShowRenewModal(true);
            }}
            className="flex flex-col items-center justify-center p-2 rounded-lg bg-[#f2f3ff] hover:bg-[#eaedff] active:scale-95 transition-all text-center cursor-pointer"
          >
            <div className="w-9 h-9 rounded-full bg-[#dae2fd] text-[#00247d] flex items-center justify-center mb-1 shadow-xs">
              <span className="material-symbols-outlined text-[18px]">autorenew</span>
            </div>
            <span className="font-['Plus_Jakarta_Sans'] text-[10px] font-bold text-[#1a1b22] leading-tight">
              Gia hạn
            </span>
          </button>

          {/* Action 4 */}
          <button
            onClick={() => setShowClassModal(true)}
            className="flex flex-col items-center justify-center p-2 rounded-lg bg-[#f2f3ff] hover:bg-[#eaedff] active:scale-95 transition-all text-center cursor-pointer"
          >
            <div className="w-9 h-9 rounded-full bg-[#eeedf7] text-[#444654] flex items-center justify-center mb-1 shadow-xs">
              <span className="material-symbols-outlined text-[18px]">event_seat</span>
            </div>
            <span className="font-['Plus_Jakarta_Sans'] text-[10px] font-bold text-[#1a1b22] leading-tight">
              Xếp lớp GX
            </span>
          </button>

          {/* Action 5 */}
          <button
            onClick={() => setShowVietQRModal(true)}
            className="flex flex-col items-center justify-center p-2 rounded-lg bg-[#f2f3ff] hover:bg-[#eaedff] active:scale-95 transition-all text-center cursor-pointer"
          >
            <div className="w-9 h-9 rounded-full bg-[#b2ecfd] text-[#064e5c] flex items-center justify-center mb-1 shadow-xs">
              <span className="material-symbols-outlined text-[18px]">point_of_sale</span>
            </div>
            <span className="font-['Plus_Jakarta_Sans'] text-[10px] font-bold text-[#1a1b22] leading-tight">
              Hóa đơn QR
            </span>
          </button>
        </div>

        {/* Highlighted Banner for POS Invoices */}
        <div
          onClick={() => setShowVietQRModal(true)}
          className="mt-2 bg-[#00247d] text-white p-2.5 rounded-lg flex items-center justify-between cursor-pointer hover:bg-[#0037b0] transition-colors"
        >
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-white/10 flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-[18px]">receipt_long</span>
            </div>
            <div>
              <p className="font-['Plus_Jakarta_Sans'] text-xs font-bold leading-tight">Xuất & In hóa đơn thu tiền</p>
              <p className="text-[10px] text-[#dae2fd]">Hỗ trợ VietQR tĩnh/động, Thẻ & Tiền mặt</p>
            </div>
          </div>
          <span className="material-symbols-outlined text-[20px] text-white/80">chevron_right</span>
        </div>
      </div>

      {/* 5. Real-Time Member Hub Cards */}
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between px-0.5">
          <div className="flex items-center gap-2">
            <h2 className="font-['Plus_Jakarta_Sans'] text-xs font-bold text-[#1a1b22] uppercase tracking-wide">
              Danh sách hội viên sàn
            </h2>
            <span className="px-2 py-0.5 bg-[#eaedff] rounded-full font-['Plus_Jakarta_Sans'] text-[10px] text-[#00247d] font-bold">
              {filteredMembers.length} hội viên hiển thị
            </span>
          </div>
          <button
            onClick={() => setSortAsc(!sortAsc)}
            className="flex items-center gap-1 font-['Plus_Jakarta_Sans'] text-xs font-semibold text-[#00247d] hover:underline cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">swap_vert</span>
            <span>{sortAsc ? 'A - Z' : 'Gần nhất'}</span>
          </button>
        </div>

        {/* Member cards list */}
        {filteredMembers.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center shadow-xs border border-[#eeedf7]">
            <div className="w-12 h-12 rounded-full bg-[#f2f3ff] text-[#747686] mx-auto flex items-center justify-center mb-2">
              <span className="material-symbols-outlined text-[24px]">person_search</span>
            </div>
            <h3 className="font-['Plus_Jakarta_Sans'] text-sm font-bold text-[#1a1b22]">Không tìm thấy hội viên</h3>
            <p className="text-xs text-[#444654] mt-1">Vui lòng kiểm tra lại số điện thoại hoặc mã hội viên đã nhập.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveFilter('all');
              }}
              className="mt-3 px-4 py-2 bg-[#eeedf7] hover:bg-[#dae2fd] text-[#00247d] rounded-lg font-['Plus_Jakarta_Sans'] text-xs font-bold transition-colors cursor-pointer"
            >
              Xóa bộ lọc tìm kiếm
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredMembers.map(member => {
              const isVip = member.tier?.includes('VIP') || member.category.includes('vip');
              const isExp = member.status === 'expiring';
              const isDayPass = member.status === 'daypass';

              return (
                <div
                  key={member.id}
                  className="bg-white rounded-xl p-3.5 shadow-xs border border-[#eeedf7] hover:border-[#b7c4ff] transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="relative shrink-0">
                        <img
                          src={member.avatar}
                          alt={member.altText}
                          className="w-12 h-12 rounded-xl object-cover bg-[#eeedf7] ring-1 ring-black/5"
                        />
                        <span
                          className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white ${
                            member.isCheckedIn ? 'bg-[#006c49] text-white' : 'bg-[#747686] text-white'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[10px]">
                            {member.isCheckedIn ? 'done' : 'schedule'}
                          </span>
                        </span>
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="font-['Plus_Jakarta_Sans'] text-sm font-bold text-[#1a1b22] truncate">
                            {member.name}
                          </h3>
                          {isVip && (
                            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#dce1ff] text-[#063ab2]">
                              {member.tier || 'VIP'}
                            </span>
                          )}
                          {isExp && (
                            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#ffdad6] text-[#ba1a1a]">
                              Sắp hết hạn
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-[#444654] mt-0.5">
                          Mã: <span className="font-semibold text-[#1a1b22]">{member.id}</span> • SĐT: {member.phone}
                        </p>

                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span className="px-2 py-0.5 rounded-md text-[11px] bg-[#f2f3ff] text-[#1a1b22] font-medium border border-[#eaedff]">
                            {member.plan}
                          </span>
                          <span className="text-[11px] text-[#444654] font-medium flex items-center gap-1 bg-[#faf8ff] px-1.5 py-0.5 rounded">
                            <span className="material-symbols-outlined text-[13px] text-[#00247d]">lock</span>
                            <span>Tủ Locker #{member.locker}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status badge */}
                    <div className="shrink-0">
                      {member.status === 'active' && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold bg-[#9af2c5] text-[#00714d]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#006c49]" />
                          Hợp lệ
                        </span>
                      )}
                      {member.status === 'expiring' && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold bg-[#ffdad6] text-[#ba1a1a]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a]" />
                          Sắp hết
                        </span>
                      )}
                      {member.status === 'daypass' && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold bg-[#b2ecfd] text-[#004b59]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#004b59]" />
                          Vé ngày
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bottom action row */}
                  <div className="mt-3 pt-2.5 border-t border-[#eeedf7] flex items-center justify-between">
                    <span className="text-[11px] text-[#444654]">
                      {member.isCheckedIn ? `Vào sàn lúc: ${member.checkInTime || 'Sáng nay'}` : `Lần tập: ${member.lastCheckIn || 'Chưa vào sàn'}`}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {member.isCheckedIn ? (
                        <button
                          onClick={() => handleCheckOut(member)}
                          className="px-2.5 py-1.5 rounded-lg bg-[#eeedf7] hover:bg-[#dae2fd] text-[#1a1b22] font-['Plus_Jakarta_Sans'] text-xs font-semibold active:scale-95 transition-all cursor-pointer"
                        >
                          Trả tủ
                        </button>
                      ) : (
                        <button
                          onClick={() => handleCheckIn(member)}
                          className="px-3 py-1.5 rounded-lg bg-[#1d4ed8] hover:bg-[#00247d] text-white font-['Plus_Jakarta_Sans'] text-xs font-bold active:scale-95 transition-all shadow-xs cursor-pointer flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[14px]">login</span>
                          Check-in
                        </button>
                      )}

                      {isExp && (
                        <button
                          onClick={() => {
                            setRenewingMember(member);
                            setShowRenewModal(true);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-[#9af2c5] hover:bg-[#6cf8bb] text-[#00714d] font-['Plus_Jakarta_Sans'] text-xs font-bold active:scale-95 transition-all cursor-pointer"
                        >
                          Gia hạn ngay
                        </button>
                      )}

                      <button
                        onClick={() => setEditingMember(member)}
                        className="px-2.5 py-1.5 rounded-lg bg-[#eeedf7] hover:bg-[#dae2fd] text-[#00247d] font-['Plus_Jakarta_Sans'] text-xs font-semibold flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[15px]">edit</span>
                        <span>Cập nhật</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 6. Reception Notes & Special Requests Card */}
      <div className="bg-white rounded-xl p-3.5 shadow-xs border border-[#eeedf7] space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#00247d] text-[20px]">sticky_note_2</span>
            <h2 className="font-['Plus_Jakarta_Sans'] text-xs font-bold text-[#1a1b22] uppercase tracking-wide">
              Ghi chú & Bàn giao ca trực
            </h2>
          </div>
          <button
            onClick={() => setShowAddNoteModal(true)}
            className="px-2.5 py-1 bg-[#eeedf7] hover:bg-[#dae2fd] text-[#00247d] rounded-lg font-['Plus_Jakarta_Sans'] text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>Thêm ghi chú</span>
          </button>
        </div>

        <div className="space-y-2">
          {notes.map(note => {
            const isUrgent = note.priority === 'urgent';
            const isHold = note.priority === 'hold';

            return (
              <div
                key={note.id}
                onClick={() => onToggleNote(note.id)}
                className={`p-2.5 rounded-lg flex items-start justify-between gap-2 transition-all cursor-pointer border ${
                  note.resolved
                    ? 'bg-[#faf8ff] border-[#eeedf7] opacity-60'
                    : 'bg-[#f2f3ff] border-[#eaedff] hover:bg-[#eaedff]'
                }`}
                title="Bấm để đánh dấu hoàn tất / mở lại"
              >
                <div className="flex items-start gap-2">
                  <span
                    className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                      note.resolved
                        ? 'bg-[#747686]'
                        : isUrgent
                        ? 'bg-[#ba1a1a]'
                        : isHold
                        ? 'bg-[#006c49]'
                        : 'bg-[#00247d]'
                    }`}
                  />
                  <div>
                    <p
                      className={`text-xs text-[#1a1b22] leading-snug ${
                        note.resolved ? 'line-through text-[#747686]' : ''
                      }`}
                    >
                      {note.content}
                    </p>
                    <span className="text-[10px] text-[#747686] mt-0.5 block">
                      Bởi {note.author} • {note.time}
                      {note.resolved && ' • (Đã xử lý xong)'}
                    </span>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-1">
                  {isUrgent && (
                    <span className="font-['Plus_Jakarta_Sans'] text-[10px] font-bold text-[#ba1a1a] bg-[#ffdad6] px-1.5 py-0.5 rounded">
                      Cần sửa
                    </span>
                  )}
                  {isHold && (
                    <span className="font-['Plus_Jakarta_Sans'] text-[10px] font-bold text-[#00714d] bg-[#9af2c5] px-1.5 py-0.5 rounded">
                      Đang giữ
                    </span>
                  )}
                  {note.priority === 'normal' && (
                    <span className="font-['Plus_Jakarta_Sans'] text-[10px] font-bold text-[#00247d] bg-[#dae2fd] px-1.5 py-0.5 rounded">
                      Thông tin
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL 1: Edit / Update Member */}
      {editingMember && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl p-4 shadow-2xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#eeedf7]">
              <div>
                <span className="text-[10px] font-bold text-[#00247d] uppercase tracking-wider">Cập nhật thông tin</span>
                <h3 className="font-['Plus_Jakarta_Sans'] text-base font-bold text-[#1a1b22]">
                  Chỉnh sửa: {editingMember.id}
                </h3>
              </div>
              <button
                onClick={() => setEditingMember(null)}
                className="w-8 h-8 rounded-full bg-[#eeedf7] flex items-center justify-center text-[#444654]"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="mt-3 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#1a1b22] mb-1">Họ và tên hội viên</label>
                <input
                  type="text"
                  value={editingMember.name}
                  onChange={e => setEditingMember({ ...editingMember, name: e.target.value })}
                  className="w-full h-10 px-3 bg-[#f2f3ff] rounded-lg text-xs font-medium text-[#1a1b22] focus:outline-none focus:ring-2 focus:ring-[#00247d]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1a1b22] mb-1">Số điện thoại liên hệ</label>
                <input
                  type="text"
                  value={editingMember.phone}
                  onChange={e => setEditingMember({ ...editingMember, phone: e.target.value })}
                  className="w-full h-10 px-3 bg-[#f2f3ff] rounded-lg text-xs font-medium text-[#1a1b22] focus:outline-none focus:ring-2 focus:ring-[#00247d]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-[#1a1b22] mb-1">Số Tủ Locker (#)</label>
                  <input
                    type="text"
                    value={editingMember.locker}
                    onChange={e => setEditingMember({ ...editingMember, locker: e.target.value })}
                    className="w-full h-10 px-3 bg-[#f2f3ff] rounded-lg text-xs font-medium text-[#1a1b22] focus:outline-none focus:ring-2 focus:ring-[#00247d]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1a1b22] mb-1">Trạng thái thẻ</label>
                  <select
                    value={editingMember.status}
                    onChange={e => setEditingMember({ ...editingMember, status: e.target.value as any })}
                    className="w-full h-10 px-2 bg-[#f2f3ff] rounded-lg text-xs font-medium text-[#1a1b22] focus:outline-none focus:ring-2 focus:ring-[#00247d]"
                  >
                    <option value="active">Hợp lệ (Active)</option>
                    <option value="expiring">Sắp hết hạn</option>
                    <option value="daypass">Vé ngày</option>
                    <option value="suspended">Tạm khóa</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1a1b22] mb-1">Gói hội viên đang dùng</label>
                <input
                  type="text"
                  value={editingMember.plan}
                  onChange={e => setEditingMember({ ...editingMember, plan: e.target.value })}
                  className="w-full h-10 px-3 bg-[#f2f3ff] rounded-lg text-xs font-medium text-[#1a1b22] focus:outline-none focus:ring-2 focus:ring-[#00247d]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1a1b22] mb-1">Ghi chú quầy</label>
                <input
                  type="text"
                  value={editingMember.notes || ''}
                  onChange={e => setEditingMember({ ...editingMember, notes: e.target.value })}
                  placeholder="Ghi chú sở thích, huấn luyện viên..."
                  className="w-full h-10 px-3 bg-[#f2f3ff] rounded-lg text-xs font-medium text-[#1a1b22] focus:outline-none focus:ring-2 focus:ring-[#00247d]"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="w-1/2 h-10 rounded-lg bg-[#eeedf7] text-[#1a1b22] font-['Plus_Jakarta_Sans'] text-xs font-semibold"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="w-1/2 h-10 rounded-lg bg-[#00247d] text-white font-['Plus_Jakarta_Sans'] text-xs font-bold flex items-center justify-center gap-1 shadow-xs"
                >
                  <span className="material-symbols-outlined text-[16px]">save</span>
                  <span>Lưu thay đổi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: QR Scanner Simulator */}
      {showScannerModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl p-4 shadow-2xl space-y-3 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-[#eeedf7]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#1d4ed8] text-[22px]">qr_code_scanner</span>
                <h3 className="font-['Plus_Jakarta_Sans'] text-sm font-bold text-[#1a1b22]">Quét QR Thẻ Hội Viên</h3>
              </div>
              <button
                onClick={() => setShowScannerModal(false)}
                className="w-7 h-7 rounded-full bg-[#eeedf7] flex items-center justify-center text-[#444654]"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            {/* Viewfinder Graphic */}
            <div className="relative w-full h-56 bg-[#131b2e] rounded-xl overflow-hidden flex flex-col items-center justify-center p-4">
              <div className="absolute inset-6 border-2 border-dashed border-[#9af2c5] rounded-xl flex items-center justify-center">
                {isScanning ? (
                  <div className="w-full h-0.5 bg-[#6cf8bb] shadow-[0_0_12px_#6cf8bb] animate-bounce" />
                ) : (
                  <span className="material-symbols-outlined text-white/30 text-5xl">center_focus_strong</span>
                )}
              </div>
              <p className="text-white/80 text-[11px] font-['Plus_Jakarta_Sans'] z-10 bg-black/50 px-3 py-1 rounded-full mt-auto">
                {isScanning ? 'Đang nhận diện mã QR...' : 'Hướng camera vào mã QR trên thẻ hoặc app'}
              </p>
            </div>

            {/* Preset Fast Testing Cards */}
            <div>
              <p className="text-[11px] font-semibold text-[#444654] mb-1.5">Mẫu thẻ thử nghiệm:</p>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => simulateScanCard('SCMS-88391')}
                  className="p-2 text-left bg-[#f2f3ff] hover:bg-[#dae2fd] rounded-lg text-[11px] font-medium transition-colors"
                >
                  <p className="font-bold text-[#1a1b22]">SCMS-88391</p>
                  <p className="text-[#747686]">Nguyễn Văn Nam (VIP)</p>
                </button>
                <button
                  onClick={() => simulateScanCard('SCMS-99215')}
                  className="p-2 text-left bg-[#f2f3ff] hover:bg-[#dae2fd] rounded-lg text-[11px] font-medium transition-colors"
                >
                  <p className="font-bold text-[#1a1b22]">SCMS-99215</p>
                  <p className="text-[#747686]">Phạm Thùy Linh</p>
                </button>
                <button
                  onClick={() => simulateScanCard('DAYPASS-901')}
                  className="p-2 text-left bg-[#f2f3ff] hover:bg-[#dae2fd] rounded-lg text-[11px] font-medium transition-colors"
                >
                  <p className="font-bold text-[#1a1b22]">DAYPASS-901</p>
                  <p className="text-[#747686]">Trần Quốc Bảo</p>
                </button>
                <button
                  onClick={() => simulateScanCard('SCMS-55102')}
                  className="p-2 text-left bg-[#f2f3ff] hover:bg-[#dae2fd] rounded-lg text-[11px] font-medium transition-colors"
                >
                  <p className="font-bold text-[#1a1b22]">SCMS-55102</p>
                  <p className="text-[#747686]">Đặng Hoàng Long</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: New Member Registration (2-Step) */}
      {showNewMemberModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-4 shadow-2xl space-y-3 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-[#eeedf7]">
              <div>
                <span className="text-[10px] font-bold text-[#006c49] uppercase tracking-wider">Hồ sơ cấp tốc</span>
                <h3 className="font-['Plus_Jakarta_Sans'] text-base font-bold text-[#1a1b22]">
                  Đăng ký hội viên mới ({newMemberStep}/2)
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowNewMemberModal(false);
                  setNewMemberStep(1);
                }}
                className="w-7 h-7 rounded-full bg-[#eeedf7] flex items-center justify-center text-[#444654]"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateMember} className="space-y-3">
              {newMemberStep === 1 ? (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-[#1a1b22] mb-1">
                      Họ và tên khách hàng <span className="text-[#ba1a1a]">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ví dụ: Hoàng Tuấn Kiệt"
                      value={newMemberData.name}
                      onChange={e => setNewMemberData({ ...newMemberData, name: e.target.value })}
                      className="w-full h-10 px-3 bg-[#f2f3ff] rounded-lg text-xs font-medium text-[#1a1b22] focus:outline-none focus:ring-2 focus:ring-[#00247d]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1a1b22] mb-1">
                      Số điện thoại <span className="text-[#ba1a1a]">*</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="0912 345 678"
                      value={newMemberData.phone}
                      onChange={e => setNewMemberData({ ...newMemberData, phone: e.target.value })}
                      className="w-full h-10 px-3 bg-[#f2f3ff] rounded-lg text-xs font-medium text-[#1a1b22] focus:outline-none focus:ring-2 focus:ring-[#00247d]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1a1b22] mb-1">Gói dịch vụ đăng ký</label>
                    <select
                      value={newMemberData.planId}
                      onChange={e => setNewMemberData({ ...newMemberData, planId: e.target.value })}
                      className="w-full h-10 px-2 bg-[#f2f3ff] rounded-lg text-xs font-medium text-[#1a1b22] focus:outline-none focus:ring-2 focus:ring-[#00247d]"
                    >
                      {AVAILABLE_PACKAGES.map(pkg => (
                        <option key={pkg.id} value={pkg.id}>
                          {pkg.name} — {pkg.price.toLocaleString('vi-VN')} đ
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      disabled={!newMemberData.name || !newMemberData.phone}
                      onClick={() => setNewMemberStep(2)}
                      className="w-full h-10 bg-[#00247d] text-white rounded-lg font-['Plus_Jakarta_Sans'] text-xs font-bold disabled:opacity-50"
                    >
                      Tiếp theo: Cấp tủ & Thanh toán →
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-2.5 rounded-lg bg-[#f2f3ff] space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#444654]">Hội viên:</span>
                      <strong className="text-[#1a1b22]">{newMemberData.name}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#444654]">Gói đăng ký:</span>
                      <strong className="text-[#00247d]">
                        {AVAILABLE_PACKAGES.find(p => p.id === newMemberData.planId)?.name}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#444654]">Thành tiền:</span>
                      <strong className="text-[#006c49]">
                        {AVAILABLE_PACKAGES.find(p => p.id === newMemberData.planId)?.price.toLocaleString('vi-VN')} đ
                      </strong>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-[#1a1b22] mb-1">Gán Locker #</label>
                      <input
                        type="text"
                        value={newMemberData.locker}
                        onChange={e => setNewMemberData({ ...newMemberData, locker: e.target.value })}
                        className="w-full h-10 px-3 bg-[#f2f3ff] rounded-lg text-xs font-medium text-[#1a1b22] focus:outline-none focus:ring-2 focus:ring-[#00247d]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#1a1b22] mb-1">Hình thức trả</label>
                      <select
                        value={newMemberData.initialPayment}
                        onChange={e => setNewMemberData({ ...newMemberData, initialPayment: e.target.value })}
                        className="w-full h-10 px-2 bg-[#f2f3ff] rounded-lg text-xs font-medium text-[#1a1b22] focus:outline-none"
                      >
                        <option value="vietqr">VietQR chuyển khoản</option>
                        <option value="cash">Tiền mặt tại quầy</option>
                        <option value="pos">Quẹt thẻ POS</option>
                      </select>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={newMemberData.vip}
                      onChange={e => setNewMemberData({ ...newMemberData, vip: e.target.checked })}
                      className="w-4 h-4 rounded text-[#00247d] accent-[#00247d]"
                    />
                    <span className="text-xs font-medium text-[#1a1b22]">Cấp thẻ thành viên VIP Club</span>
                  </label>

                  <div className="pt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setNewMemberStep(1)}
                      className="w-1/3 h-10 rounded-lg bg-[#eeedf7] text-[#1a1b22] font-['Plus_Jakarta_Sans'] text-xs font-semibold"
                    >
                      Quay lại
                    </button>
                    <button
                      type="submit"
                      className="w-2/3 h-10 rounded-lg bg-[#006c49] text-white font-['Plus_Jakarta_Sans'] text-xs font-bold flex items-center justify-center gap-1 shadow-xs"
                    >
                      <span className="material-symbols-outlined text-[16px]">how_to_reg</span>
                      <span>Hoàn tất & Check-in</span>
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: VietQR Payment Invoice */}
      {showVietQRModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl p-4 shadow-2xl space-y-3 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-[#eeedf7]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#006c49] text-[22px]">qr_code_2</span>
                <h3 className="font-['Plus_Jakarta_Sans'] text-sm font-bold text-[#1a1b22]">Thanh toán VietQR Quầy</h3>
              </div>
              <button
                onClick={() => setShowVietQRModal(false)}
                className="w-7 h-7 rounded-full bg-[#eeedf7] flex items-center justify-center text-[#444654]"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            <div className="text-center space-y-1 bg-[#f2f3ff] p-3.5 rounded-xl border border-[#eaedff]">
              <p className="text-xs text-[#747686]">Tổng tiền giao dịch</p>
              <p className="font-['Plus_Jakarta_Sans'] text-2xl text-[#00247d] font-extrabold">150.000 đ</p>
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#9af2c5] text-[#00714d]">
                Nội dung: SCMS 88391 VE NGAY
              </span>

              {/* VietQR standard code */}
              <div className="w-40 h-40 mx-auto mt-2 bg-white p-2 rounded-lg shadow-xs flex items-center justify-center border border-[#eeedf7]">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCRjTeliLslRj81tXq4wYCtufyTsIxD8pnSfPZz17aXvEJweWl8MTaKTiqzxZagXip1LK70rS0eALjO1W3b28vmsiAwyD2_qvhyycX_DeVJIIxV1ht3W9KKrrpbLeIzzYQzihaTE44fukCA-YhbLxGbSC6H7_qRnvF6Felm2UbNv7jDcVV1dRNr2-Wh9p2zBYkqNGjsSAIPEpWpGmAt9aAPj075aZpKKflgi2A14SCFjs30Kx9rvVRR"
                  alt="Mã VietQR quầy SCMS"
                  className="w-full h-full object-contain"
                />
              </div>

              <p className="text-[10px] text-[#747686] mt-1">Quét bằng ứng dụng ngân hàng bất kỳ để xác nhận tức thì</p>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => {
                  soundFX.playPrinter();
                  onShowToast('Đang gửi lệnh in hóa đơn POS...', 'info');
                }}
                className="w-1/3 h-10 rounded-lg bg-[#eeedf7] hover:bg-[#dae2fd] text-[#1a1b22] font-['Plus_Jakarta_Sans'] text-xs font-semibold flex items-center justify-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">print</span>
                <span>In Bill</span>
              </button>
              <button
                onClick={() => {
                  soundFX.playCashRegister();
                  setShowVietQRModal(false);
                  onShowToast('Xác nhận đã nhận tiền thành công! Hóa đơn đã lưu vào ca.', 'success');
                }}
                className="w-2/3 h-10 bg-[#00247d] text-white rounded-lg font-['Plus_Jakarta_Sans'] text-xs font-bold shadow-xs active:scale-95 transition-transform"
              >
                Xác nhận đã nhận tiền
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: GX & Yoga Class Booking */}
      {showClassModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-4 shadow-2xl space-y-3 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-[#eeedf7]">
              <div>
                <span className="text-[10px] font-bold text-[#00247d] uppercase tracking-wider">Lịch phòng tập</span>
                <h3 className="font-['Plus_Jakarta_Sans'] text-base font-bold text-[#1a1b22]">Xếp lớp GX & Yoga hôm nay</h3>
              </div>
              <button
                onClick={() => setShowClassModal(false)}
                className="w-7 h-7 rounded-full bg-[#eeedf7] flex items-center justify-center text-[#444654]"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {classes.map(cls => (
                <div key={cls.id} className="p-3 bg-[#f2f3ff] rounded-xl border border-[#eaedff] flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-['Plus_Jakarta_Sans'] text-xs font-bold text-[#1a1b22]">{cls.name}</h4>
                      <span className="px-1.5 py-0.2 rounded bg-[#dae2fd] text-[#00247d] text-[9px] font-bold">
                        {cls.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#444654] mt-0.5">
                      {cls.time} • {cls.room}
                    </p>
                    <p className="text-[10px] text-[#747686]">
                      HLV: <span className="font-semibold text-[#1a1b22]">{cls.instructor}</span> • Đã đặt: {cls.booked}/{cls.capacity}
                    </p>
                  </div>
                  <button
                    disabled={cls.booked >= cls.capacity}
                    onClick={() => {
                      onBookClass(cls.id);
                      soundFX.playSuccess();
                      onShowToast(`Đã xếp chỗ lớp ${cls.name} thành công!`, 'success');
                    }}
                    className="px-3 py-1.5 bg-[#00247d] disabled:bg-[#c4c5d6] text-white rounded-lg font-['Plus_Jakarta_Sans'] text-xs font-bold active:scale-95 transition-all shrink-0 cursor-pointer"
                  >
                    {cls.booked >= cls.capacity ? 'Hết chỗ' : 'Đặt chỗ'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: Renew Subscription */}
      {showRenewModal && renewingMember && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl p-4 shadow-2xl space-y-3 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-[#eeedf7]">
              <div>
                <span className="text-[10px] font-bold text-[#006c49] uppercase tracking-wider">Gia hạn gói tập</span>
                <h3 className="font-['Plus_Jakarta_Sans'] text-sm font-bold text-[#1a1b22]">
                  {renewingMember.name} ({renewingMember.id})
                </h3>
              </div>
              <button
                onClick={() => setShowRenewModal(false)}
                className="w-7 h-7 rounded-full bg-[#eeedf7] flex items-center justify-center text-[#444654]"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            <p className="text-xs text-[#444654]">Chọn gói dịch vụ để gia hạn thêm cho hội viên:</p>

            <div className="space-y-1.5">
              {AVAILABLE_PACKAGES.slice(1).map(pkg => (
                <div
                  key={pkg.id}
                  onClick={() => handleRenewSubmit(pkg.id)}
                  className="p-2.5 rounded-lg bg-[#f2f3ff] hover:bg-[#eaedff] border border-[#eaedff] flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div>
                    <p className="font-['Plus_Jakarta_Sans'] text-xs font-bold text-[#1a1b22]">{pkg.name}</p>
                    <p className="text-[10px] text-[#747686]">{pkg.duration}</p>
                  </div>
                  <span className="font-['Plus_Jakarta_Sans'] text-xs font-bold text-[#006c49]">
                    {pkg.price.toLocaleString('vi-VN')} đ
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 7: Add Reception Note */}
      {showAddNoteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl p-4 shadow-2xl space-y-3 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-[#eeedf7]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#00247d] text-[20px]">post_add</span>
                <h3 className="font-['Plus_Jakarta_Sans'] text-sm font-bold text-[#1a1b22]">Thêm Ghi Chú Ca Trực</h3>
              </div>
              <button
                onClick={() => setShowAddNoteModal(false)}
                className="w-7 h-7 rounded-full bg-[#eeedf7] flex items-center justify-center text-[#444654]"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            <form onSubmit={handleAddNoteSubmit} className="space-y-2.5">
              <div>
                <label className="block text-xs font-semibold text-[#1a1b22] mb-1">Nội dung ghi chú</label>
                <textarea
                  value={newNoteContent}
                  onChange={e => setNewNoteContent(e.target.value)}
                  placeholder="Nhập ghi chú locker, đồ khách gửi, bàn giao ca..."
                  rows={3}
                  className="w-full p-2.5 bg-[#f2f3ff] rounded-lg text-xs font-medium text-[#1a1b22] focus:outline-none focus:ring-2 focus:ring-[#00247d]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1a1b22] mb-1">Mức độ ưu tiên</label>
                <select
                  value={newNotePriority}
                  onChange={e => setNewNotePriority(e.target.value as any)}
                  className="w-full h-9 px-2 bg-[#f2f3ff] rounded-lg text-xs font-medium text-[#1a1b22] focus:outline-none"
                >
                  <option value="normal">Bình thường (Thông tin)</option>
                  <option value="urgent">Quan trọng (Cần xử lý ngay)</option>
                  <option value="hold">Đang giữ đồ khách</option>
                </select>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddNoteModal(false)}
                  className="w-1/2 h-9 rounded-lg bg-[#eeedf7] text-[#1a1b22] font-['Plus_Jakarta_Sans'] text-xs font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="w-1/2 h-9 rounded-lg bg-[#00247d] text-white font-['Plus_Jakarta_Sans'] text-xs font-bold shadow-xs"
                >
                  Lưu ghi chú
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
