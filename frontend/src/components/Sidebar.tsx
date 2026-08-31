import React from 'react';
import {
  LayoutDashboard,
  Mountain,
  Layers,
  Calendar,
  Users,
  CheckSquare,
  BarChart3,
  QrCode,
  Code2,
  Clock,
  LogOut,
  Building2,
  ChevronRight,
  Activity,
} from 'lucide-react';
import { UserAccount } from './AuthLanding';

export type TabType =
  | 'dashboard'
  | 'routes'
  | 'aging'
  | 'history'
  | 'planner'
  | 'setters'
  | 'tasks'
  | 'analytics'
  | 'qrcode'
  | 'django';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  activeTasksCount: number;
  expiredCount: number;
  currentUser: UserAccount | null;
  onOpenLanding: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  activeTasksCount,
  expiredCount,
  currentUser,
  onOpenLanding,
}) => {
  const overviewGroup = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, hotkey: '1' },
    { id: 'routes', label: 'Baza Dróg', icon: Mountain, hotkey: '2' },
    { id: 'history', label: 'Historia Resetów', icon: Layers, hotkey: '3' },
  ];

  const operationsGroup = [
    { id: 'planner', label: 'Planowanie Resetu', icon: Calendar, hotkey: '4' },
    { id: 'setters', label: 'Zespół Setterów', icon: Users, hotkey: '5' },
    { id: 'tasks', label: 'Zadania (Kanban)', icon: CheckSquare, badge: activeTasksCount, hotkey: '6' },
  ];

  const insightGroup = [
    { id: 'analytics', label: 'Analityka Ocen', icon: BarChart3, hotkey: '7' },
    { id: 'qrcode', label: 'Etykiety QR', icon: QrCode, hotkey: '8' },
    {
      id: 'django',
      label: 'Architektura Django',
      icon: Code2,
      tag: 'DRF',
    },
  ];

  const renderNavItem = (item: {
    id: string;
    label: string;
    icon: React.ElementType;
    badge?: number;
    tag?: string;
    hotkey?: string;
  }) => {
    const Icon = item.icon;
    const isActive = activeTab === item.id;

    return (
      <button
        key={item.id}
        onClick={() => setActiveTab(item.id as TabType)}
        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all duration-150 cursor-pointer group ${
          isActive
            ? 'bg-zinc-900 text-white font-semibold shadow-xs'
            : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100/80'
        }`}
      >
        <div className="flex items-center space-x-2.5">
          <Icon
            className={`w-4 h-4 transition-colors ${
              isActive ? 'text-[#ff4d00]' : 'text-zinc-400 group-hover:text-zinc-700'
            }`}
          />
          <span className="tracking-tight">{item.label}</span>
        </div>

        <div className="flex items-center space-x-1.5">
          {item.badge !== undefined && item.badge > 0 && (
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                isActive
                  ? 'bg-[#ff4d00] text-white'
                  : 'bg-zinc-200/80 text-zinc-800'
              }`}
            >
              {item.badge}
            </span>
          )}

          {item.tag && (
            <span
              className={`px-1.5 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider font-bold ${
                isActive
                  ? 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                  : 'bg-zinc-100 text-zinc-600 border border-zinc-200'
              }`}
            >
              {item.tag}
            </span>
          )}

          {item.hotkey && (
            <span
              className={`hidden group-hover:inline-block text-[10px] font-mono px-1 py-0.2 rounded border ${
                isActive
                  ? 'text-zinc-400 border-zinc-700 bg-zinc-800'
                  : 'text-zinc-400 border-zinc-200 bg-white'
              }`}
            >
              {item.hotkey}
            </span>
          )}
        </div>
      </button>
    );
  };

  return (
    <aside className="w-60 bg-white border-r border-zinc-200/80 flex flex-col shrink-0 min-h-screen text-zinc-900 select-none">
      {/* Brand Logo Header */}
      <div className="px-4 py-4.5 flex items-center justify-between border-b border-zinc-200/80">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-zinc-950 text-white flex items-center justify-center font-black shadow-xs shrink-0 border border-zinc-800">
            <Mountain className="w-4 h-4 text-[#ff4d00] stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h1 className="font-bold text-sm text-zinc-950 tracking-tight leading-none">Belay Route</h1>
              <span className="px-1 py-0.2 rounded text-[9px] font-mono font-bold bg-[#ff4d00]/10 text-[#ff4d00] border border-[#ff4d00]/20">
                PRO
              </span>
            </div>
            <p className="text-[9px] font-mono tracking-widest text-zinc-400 uppercase mt-0.5 font-medium">
              TACTICAL GYM OS
            </p>
          </div>
        </div>
      </div>

      {/* Sidebar Navigation */}
      <nav className="flex-1 px-2.5 py-4 space-y-5 overflow-y-auto">
        {/* OVERVIEW */}
        <div>
          <h2 className="px-2.5 text-[9px] font-mono font-bold uppercase tracking-widest text-zinc-400 mb-1.5">
            OGÓLNE
          </h2>
          <div className="space-y-0.5">{overviewGroup.map(renderNavItem)}</div>
        </div>

        {/* OPERATIONS */}
        <div>
          <h2 className="px-2.5 text-[9px] font-mono font-bold uppercase tracking-widest text-zinc-400 mb-1.5">
            OPERACJE
          </h2>
          <div className="space-y-0.5">{operationsGroup.map(renderNavItem)}</div>
        </div>

        {/* INSIGHT */}
        <div>
          <h2 className="px-2.5 text-[9px] font-mono font-bold uppercase tracking-widest text-zinc-400 mb-1.5">
            ANALIZA & CORE
          </h2>
          <div className="space-y-0.5">{insightGroup.map(renderNavItem)}</div>
        </div>
      </nav>

      {/* Logged User & Gym Status Footer */}
      <div className="p-3 mx-2.5 mb-3 rounded-xl bg-zinc-50 border border-zinc-200/80 text-xs text-zinc-600 space-y-2.5">
        {currentUser && (
          <div className="pb-2 border-b border-zinc-200/70">
            <div className="flex items-center space-x-2 text-zinc-900 font-semibold mb-0.5">
              <Building2 className="w-3.5 h-3.5 text-[#ff4d00] shrink-0" />
              <span className="truncate text-xs font-bold">{currentUser.gymName}</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-zinc-500">
              <span className="truncate font-medium">{currentUser.name}</span>
              <span className="text-[9px] bg-zinc-200 text-zinc-800 border border-zinc-300 px-1 py-0.2 rounded font-mono shrink-0 font-bold">
                {currentUser.role}
              </span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-zinc-700">
          <span className="font-semibold flex items-center space-x-1.5 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>API Engine</span>
          </span>
          <span className="font-mono text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
            CONNECTED
          </span>
        </div>

        {expiredCount > 0 && (
          <div className="text-[10px] text-amber-900 bg-amber-50/80 border border-amber-200/80 px-2 py-1 rounded-md flex items-center space-x-1.5 font-medium">
            <Clock className="w-3 h-3 text-amber-600 shrink-0" />
            <span>{expiredCount} dróg do rotacji (&gt;45d)</span>
          </div>
        )}

        <button
          onClick={onOpenLanding}
          className="w-full pt-1.5 border-t border-zinc-200/70 text-center text-[10px] text-zinc-500 hover:text-zinc-950 flex items-center justify-center space-x-1.5 transition cursor-pointer font-semibold"
        >
          <LogOut className="w-3 h-3 text-[#ff4d00]" />
          <span>Wyloguj / Zmień konto</span>
        </button>
      </div>
    </aside>
  );
};

