import React, { useState } from 'react';
import { Member, ShiftInfo, ReceptionNote } from '../types';
import { soundFX } from '../utils/audio';

interface AiAssistantScreenProps {
  members: Member[];
  shiftInfo: ShiftInfo;
  notes: ReceptionNote[];
  onNavigateToOperations: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info', title?: string) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  time: string;
  actions?: { label: string; action: () => void }[];
}

export const AiAssistantScreen: React.FC<AiAssistantScreenProps> = ({
  members,
  shiftInfo,
  notes,
  onNavigateToOperations,
  onShowToast,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-1',
      sender: 'assistant',
      text: `Xin chào ${shiftInfo.staffName || 'Bạn'}! Tôi là Trợ lý AI Vận hành SCMS Sports. Tôi có thể giúp bạn kiểm tra trạng thái hội viên, tạo biên bản bàn giao ca trực, tư vấn gói tập hoặc giải đáp sự cố quầy lễ tân.`,
      time: '08:30',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  const quickPrompts = [
    'Tạo biên bản bàn giao ca sáng',
    'Danh sách hội viên sắp hết hạn',
    'Tư vấn gói tập cho khách mới',
    'Quy định khóa tủ locker',
  ];

  const handleSend = (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsThinking(true);
    soundFX.playSuccess();

    setTimeout(() => {
      let reply = '';
      let actions: { label: string; action: () => void }[] | undefined = undefined;

      const lower = query.toLowerCase();

      if (lower.includes('bàn giao') || lower.includes('ca')) {
        reply = `📋 **BIÊN BẢN BÀN GIAO CA SÁNG (06:00 - 14:00)**\n\n• **Nhân sự trực:** ${shiftInfo.staffName} (${shiftInfo.staffId}) tại ${shiftInfo.desk}\n• **Lượt Check-in:** ${shiftInfo.totalCheckIns} lượt (Đang trên sàn: ${shiftInfo.currentFloorCount}/160 người)\n• **Tổng tiền thu quầy:** ${(shiftInfo.shiftRevenue).toLocaleString('vi-VN')} đ (${shiftInfo.paymentCount} giao dịch)\n• **Tình trạng tủ:** Đã bàn giao 40 chìa khóa RFID, Locker #15 cần kỹ thuật kiểm tra.\n• **Ghi chú chuyển tiếp:** ${notes.filter(n => !n.resolved).map(n => n.content).join('; ') || 'Không có sự cố phát sinh'}.`;
        actions = [
          {
            label: 'Xem danh sách ghi chú quầy',
            action: () => onNavigateToOperations(),
          },
        ];
      } else if (lower.includes('hết hạn') || lower.includes('gia hạn')) {
        const expiring = members.filter(m => m.status === 'expiring');
        reply = `🔔 **HỘI VIÊN SẮP HẾT HẠN CẦN LƯU Ý:**\n\nHiện có **${expiring.length} hội viên** sắp hết hạn trong 5 ngày tới:\n${expiring
          .map(
            m => `• **${m.name}** (${m.id}) - Gói: ${m.plan} - Hạn còn: ${m.expireDays || 3} ngày (SĐT: ${m.phone})`
          )
          .join('\n')}\n\n💡 *Gợi ý:* Lễ tân có thể tư vấn ưu đãi gia hạn giảm 10% khi đóng gia hạn ngay trong ca trực hôm nay.`;
        actions = [
          {
            label: 'Mở danh sách để gia hạn',
            action: () => onNavigateToOperations(),
          },
        ];
      } else if (lower.includes('gói tập') || lower.includes('tư vấn')) {
        reply = `💪 **GỢI Ý GÓI TẬP PHÙ HỢP TẠI SCMS:**\n\n1. **Khách tập trải nghiệm:** Vé ngày 150.000đ (Gym + Hồ bơi trong 24h)\n2. **Khách tập đều đặn:** Gói 03 Tháng Tăng Cơ & Giảm Mỡ (2.450.000đ - tặng 2 buổi PT 1-1)\n3. **Khách VIP cao cấp:** Gói Platinum 12 Tháng (8.900.000đ - All-Access toàn hệ thống, miễn phí khăn, tủ locker cố định)\n\nLễ tân có thể tạo ngay mã VietQR động để khách quét thanh toán tức thì.`;
      } else if (lower.includes('locker') || lower.includes('tủ') || lower.includes('khóa')) {
        reply = `🔐 **QUY ĐỊNH BÀN GIAO & SỰ CỐ TỦ LOCKER:**\n\n• Mỗi hội viên được phát 01 vòng tay RFID tương ứng với số tủ khi check-in.\n• Khi rời phòng tập, hội viên trả chìa khóa tại quầy để mở khóa hoàn tất check-out.\n• Nếu khách báo kẹt tủ (như tủ #15): Lễ tân dùng thẻ Master Key tầng 1 để mở cưỡng bức và chuyển đồ sang tủ phụ dự phòng.`;
      } else {
        reply = `Hệ thống SCMS ghi nhận yêu cầu: "${query}". Bạn có thể quản lý check-in, cập nhật hồ sơ hội viên hoặc kiểm tra doanh số trực tiếp tại màn hình Vận hành.`;
      }

      const botMsg: ChatMessage = {
        id: `b-${Date.now()}`,
        sender: 'assistant',
        text: reply,
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        actions,
      };

      setMessages(prev => [...prev, botMsg]);
      setIsThinking(false);
      soundFX.playSuccess();
    }, 600);
  };

  return (
    <div className="flex flex-col w-full max-w-lg mx-auto px-4 pb-28 pt-2 h-[calc(100vh-130px)]">
      {/* Header Info */}
      <div className="bg-white rounded-2xl p-3 shadow-xs border border-[#eeedf7] flex items-center justify-between shrink-0 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#00247d] text-white flex items-center justify-center shadow-xs">
            <span className="material-symbols-outlined text-[20px]">smart_toy</span>
          </div>
          <div>
            <h2 className="font-['Plus_Jakarta_Sans'] text-xs font-bold text-[#1a1b22]">SCMS AI Copilot</h2>
            <span className="text-[10px] text-[#006c49] font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#006c49]" /> Sẵn sàng hỗ trợ ca trực
            </span>
          </div>
        </div>
        <button
          onClick={() => {
            setMessages([messages[0]]);
            onShowToast('Đã làm mới cuộc hội thoại', 'info');
          }}
          className="text-xs text-[#747686] hover:text-[#1a1b22] px-2 py-1 rounded bg-[#f2f3ff]"
        >
          Làm mới
        </button>
      </div>

      {/* Quick Prompt Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 shrink-0 mb-2">
        {quickPrompts.map(p => (
          <button
            key={p}
            onClick={() => handleSend(p)}
            className="shrink-0 px-2.5 py-1 rounded-full bg-white border border-[#eeedf7] text-[#00247d] hover:bg-[#f2f3ff] font-['Plus_Jakarta_Sans'] text-[11px] font-semibold transition-all shadow-2xs active:scale-95 cursor-pointer"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 py-1">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} space-y-1`}
          >
            <div
              className={`max-w-[88%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-xs whitespace-pre-wrap ${
                msg.sender === 'user'
                  ? 'bg-[#00247d] text-white rounded-tr-xs'
                  : 'bg-white text-[#1a1b22] rounded-tl-xs border border-[#eeedf7]'
              }`}
            >
              {msg.text}

              {msg.actions && msg.actions.length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-[#eeedf7] flex flex-col gap-1.5">
                  {msg.actions.map(act => (
                    <button
                      key={act.label}
                      onClick={act.action}
                      className="w-full py-1.5 px-2 bg-[#f2f3ff] hover:bg-[#eaedff] text-[#00247d] rounded-lg font-['Plus_Jakarta_Sans'] text-[11px] font-bold text-center cursor-pointer transition-colors"
                    >
                      {act.label} →
                    </button>
                  ))}
                </div>
              )}
            </div>
            <span className="text-[9px] text-[#747686] px-1">{msg.time}</span>
          </div>
        ))}

        {isThinking && (
          <div className="flex items-center gap-1.5 p-3 bg-white rounded-2xl w-24 border border-[#eeedf7]">
            <span className="w-2 h-2 rounded-full bg-[#00247d] animate-bounce" />
            <span className="w-2 h-2 rounded-full bg-[#00247d] animate-bounce [animation-delay:0.2s]" />
            <span className="w-2 h-2 rounded-full bg-[#00247d] animate-bounce [animation-delay:0.4s]" />
          </div>
        )}
      </div>

      {/* Input Form */}
      <div className="pt-2 shrink-0">
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSend();
          }}
          className="relative flex items-center bg-white rounded-xl shadow-xs border border-[#eeedf7] p-1.5"
        >
          <input
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder="Hỏi trợ lý về ca trực, hội viên, hóa đơn..."
            className="flex-1 h-10 px-3 bg-transparent text-xs font-medium text-[#1a1b22] focus:outline-none placeholder:text-[#747686]"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="w-10 h-10 rounded-lg bg-[#00247d] hover:bg-[#0037b0] text-white flex items-center justify-center disabled:opacity-40 transition-all active:scale-95 cursor-pointer shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px]">send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
