export type ActiveTab = 'overview' | 'operations' | 'ai-assistant' | 'account' | 'auth';

export type MemberStatus = 'active' | 'expiring' | 'daypass' | 'suspended';

export interface Member {
  id: string; // e.g. SCMS-88391
  name: string;
  phone: string;
  avatar: string;
  altText: string;
  plan: string;
  locker: string;
  status: MemberStatus;
  category: string; // 'vip' | 'expiring' | 'daypass' | 'regular'
  checkInTime?: string;
  lastCheckIn?: string;
  isCheckedIn: boolean;
  sessionsLeft?: number;
  expireDays?: number;
  notes?: string;
  tier?: 'VIP' | 'VIP Pilates' | 'Khách vãng lai' | 'Standard';
}

export interface ReceptionNote {
  id: string;
  content: string;
  author: string;
  time: string;
  priority: 'normal' | 'urgent' | 'hold';
  resolved?: boolean;
}

export interface ClassSession {
  id: string;
  name: string;
  instructor: string;
  time: string;
  room: string;
  capacity: number;
  booked: number;
  category: 'Yoga' | 'Spinning' | 'GX' | 'Pilates';
}

export interface PosDevice {
  id: string;
  name: string;
  model: string;
  status: 'connected' | 'ready' | 'offline';
  statusText: string;
  icon: string;
}

export interface ShiftInfo {
  shiftName: string;
  timeRange: string;
  desk: string;
  staffId: string;
  staffName: string;
  role: string;
  clubLocation: string;
  area: string;
  totalCheckIns: number;
  currentFloorCount: number;
  maxFloorCapacity: number;
  shiftRevenue: number;
  paymentCount: number;
}
