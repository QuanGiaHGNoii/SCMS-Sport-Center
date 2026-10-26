/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ActiveTab, Member, ReceptionNote, ShiftInfo, ClassSession } from './types';
import {
  INITIAL_MEMBERS,
  INITIAL_SHIFT_INFO,
  INITIAL_NOTES,
  INITIAL_CLASSES,
} from './data/mockData';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { Toast, ToastProps } from './components/Toast';
import { DeviceFrameWrapper } from './components/DeviceFrameWrapper';
import { OperationsScreen } from './screens/OperationsScreen';
import { AuthScreen } from './screens/AuthScreen';
import { AccountScreen } from './screens/AccountScreen';
import { OverviewScreen } from './screens/OverviewScreen';
import { AiAssistantScreen } from './screens/AiAssistantScreen';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('operations');

  // Core persistent states
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [shiftInfo, setShiftInfo] = useState<ShiftInfo>(INITIAL_SHIFT_INFO);
  const [notes, setNotes] = useState<ReceptionNote[]>(INITIAL_NOTES);
  const [classes, setClasses] = useState<ClassSession[]>(INITIAL_CLASSES);

  // Toast notification state
  const [toast, setToast] = useState<ToastProps>({
    show: false,
    message: '',
    title: 'Hệ thống SCMS',
    type: 'success',
  });

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success', title: string = 'Hệ thống SCMS') => {
    setToast({
      show: true,
      message,
      type,
      title,
    });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3200);
  };

  // Member CRUD handlers
  const handleUpdateMember = (updated: Member) => {
    setMembers(prev => prev.map(m => (m.id === updated.id ? updated : m)));
  };

  const handleAddMember = (newM: Member) => {
    setMembers(prev => [newM, ...prev]);
  };

  // Notes handlers
  const handleAddNote = (newNote: ReceptionNote) => {
    setNotes(prev => [newNote, ...prev]);
  };

  const handleToggleNote = (noteId: string) => {
    setNotes(prev =>
      prev.map(n => (n.id === noteId ? { ...n, resolved: !n.resolved } : n))
    );
    showToast('Đã cập nhật trạng thái ghi chú ca trực', 'info');
  };

  // Class booking handler
  const handleBookClass = (classId: string) => {
    setClasses(prev =>
      prev.map(c =>
        c.id === classId && c.booked < c.capacity ? { ...c, booked: c.booked + 1 } : c
      )
    );
  };

  // Auth handlers
  const handleLoginSuccess = (name?: string) => {
    if (name) {
      setShiftInfo(prev => ({ ...prev, staffName: name }));
    }
    setActiveTab('operations');
  };

  const handleSignOut = () => {
    setActiveTab('auth');
    showToast('Đã kết thúc phiên làm việc an toàn.', 'info', 'Đăng xuất thành công');
  };

  const checkedInCount = members.filter(m => m.isCheckedIn).length;

  return (
    <DeviceFrameWrapper activeTab={activeTab} onNavigate={setActiveTab}>
      <div className="flex-1 flex flex-col w-full relative min-h-full bg-[#faf8ff]">
        {/* Render Toast notification */}
        <Toast
          show={toast.show}
          title={toast.title}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(prev => ({ ...prev, show: false }))}
        />

        {/* Global Header (shown except on auth screen) */}
        {activeTab !== 'auth' && (
          <Header
            activeTab={activeTab}
            onNavigate={setActiveTab}
            onShowToast={showToast}
          />
        )}

        {/* Screen Content */}
        <main className="flex-1 flex flex-col w-full">
          {activeTab === 'operations' && (
            <OperationsScreen
              members={members}
              onUpdateMember={handleUpdateMember}
              onAddMember={handleAddMember}
              shiftInfo={shiftInfo}
              onUpdateShift={setShiftInfo}
              notes={notes}
              onAddNote={handleAddNote}
              onToggleNote={handleToggleNote}
              classes={classes}
              onBookClass={handleBookClass}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'auth' && (
            <AuthScreen
              onLoginSuccess={handleLoginSuccess}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'account' && (
            <AccountScreen
              shiftInfo={shiftInfo}
              onUpdateShift={setShiftInfo}
              onSignOut={handleSignOut}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'overview' && (
            <OverviewScreen
              shiftInfo={shiftInfo}
              members={members}
              onNavigateToOperations={() => setActiveTab('operations')}
            />
          )}

          {activeTab === 'ai-assistant' && (
            <AiAssistantScreen
              members={members}
              shiftInfo={shiftInfo}
              notes={notes}
              onNavigateToOperations={() => setActiveTab('operations')}
              onShowToast={showToast}
            />
          )}
        </main>

        {/* Bottom Navigation (shown except on auth screen) */}
        {activeTab !== 'auth' && (
          <BottomNav
            activeTab={activeTab}
            onNavigate={setActiveTab}
            checkedInCount={checkedInCount}
          />
        )}
      </div>
    </DeviceFrameWrapper>
  );
}
