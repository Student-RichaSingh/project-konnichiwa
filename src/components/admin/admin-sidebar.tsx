"use client";

import React from 'react';
import Image from 'next/image';
import { 
  FiGrid, 
  FiCalendar, 
  FiList, 
  FiCheckSquare, 
  FiMail, 
  FiUsers, 
  FiAward,
  FiUser, 
  FiLogOut 
} from 'react-icons/fi';
import { UserType } from './types';

type TabType = 'overview' | 'events' | 'registrations' | 'attendance' | 'mail' | 'users' | 'people' | 'profile';

interface AdminSidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  pendingCount: number;
  adminUser: UserType | null;
  onLogout: () => void;
}

export function AdminSidebar({
  activeTab,
  setActiveTab,
  pendingCount,
  adminUser,
  onLogout,
}: AdminSidebarProps) {
  const navItems: { id: TabType; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'overview', label: 'Overview', icon: <FiGrid className="size-4" /> },
    { id: 'events', label: 'Events', icon: <FiCalendar className="size-4" /> },
    { id: 'registrations', label: 'Registrations', icon: <FiList className="size-4" /> },
    { id: 'attendance', label: 'Attendance', icon: <FiCheckSquare className="size-4" /> },
    { id: 'mail', label: 'Mail Manager', icon: <FiMail className="size-4" /> },
    { id: 'users', label: 'Users & Roles', icon: <FiUsers className="size-4" />, badge: pendingCount },
    { id: 'people', label: 'People / Alumni', icon: <FiAward className="size-4" /> },
    { id: 'profile', label: 'Profile', icon: <FiUser className="size-4" /> },
  ];

  const handleSelectTab = (id: TabType) => {
    setActiveTab(id);
    if (setMobileOpen) {
      setMobileOpen(false);
    }
  };

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full space-y-6">
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="size-9 rounded-md bg-white/5 border border-white/10 flex items-center justify-center p-1.5 shrink-0 group-hover:border-[#F47174]/50 transition-all">
              <Image
                src="/logo.png"
                alt="PTSC logo"
                width={24}
                height={24}
                className="size-full object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white tracking-tight flex items-center gap-1 font-sans">
                PTSC<span className="text-[#F47174] font-black">.</span>
              </span>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
                Admin Console
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-1">
            <Link
              href="/"
              title="View Public Website"
              className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            >
              <FiExternalLink className="size-4" />
            </Link>

            {/* Close button for mobile drawer */}
            {setMobileOpen && (
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/5 transition-all lg:hidden"
                aria-label="Close sidebar menu"
              >
                <FiX className="size-5" />
              </button>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <div className="space-y-1">
          <div className="px-3 pb-1 text-[11px] font-bold font-mono uppercase tracking-widest text-slate-400">
            Navigation
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`flex items-center justify-between w-full px-3 py-2.5 rounded-md text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-white/10 text-white font-semibold border border-white/20'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? 'text-[#F47174]' : 'text-slate-400'}>
                      {item.icon}
                    </span>
                    <span className="tracking-tight">{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="text-[11px] font-mono font-semibold px-1.5 py-0.5 bg-white/10 text-slate-200 rounded border border-white/10">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* User Footer */}
      <div className="pt-4 border-t border-white/10 flex flex-col gap-3 px-1">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-full bg-white/10 border border-white/15 flex items-center justify-center font-mono text-xs font-bold text-white uppercase">
            {adminUser?.firstName?.[0] || 'A'}
          </div>
          <div className="flex flex-col text-[11px] overflow-hidden">
            <span className="font-semibold text-white truncate">
              {adminUser?.firstName} {adminUser?.lastName}
            </span>
            <span className="text-[10px] text-white/40 font-mono truncate">
              @{adminUser?.username}
            </span>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center justify-center gap-2 w-full py-2 rounded-lg border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-xs font-mono text-white/70 hover:text-white transition-all"
        >
          <FiLogOut className="size-3.5" /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Static Sidebar */}
      <aside className="hidden lg:flex w-64 border-r border-white/10 bg-[#0B0E17] flex-col justify-between p-4 shrink-0 selection:bg-[#F47174]/30 font-sans z-20 h-screen sticky top-0">
        {sidebarContent}
      </aside>

      {/* Mobile Backdrop & Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity" 
            onClick={() => setMobileOpen && setMobileOpen(false)}
          />
          {/* Slide-over Menu */}
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-[#0B0E17] border-r border-white/10 p-4 shadow-2xl z-50 overflow-y-auto animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
