import React from 'react';

import {
  Search,
  Command,
  LogOut,
  Calendar,
} from 'lucide-react';

import { UserAccount } from './AuthLanding';

interface HeaderProps {
  onOpenPlanningClick: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  currentUser: UserAccount | null;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenPlanningClick,
  searchQuery,
  setSearchQuery,
  currentUser,
  onLogout,
}) => {
  return (
    <header className="bg-white/95 border-b border-zinc-200/80 backdrop-blur-md sticky top-0 z-30 px-6 py-2.5 flex items-center justify-between gap-4">
      {/* Left: Search Bar */}
      <div className="flex items-center space-x-3 flex-1 max-w-xl">
        <div className="relative w-full">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Szukaj po nazwie, wycenie (np. 7A, V4), sektorze..."
            className="w-full bg-zinc-100/80 hover:bg-zinc-100 focus:bg-white text-zinc-900 text-xs pl-9 pr-14 py-1.5 rounded-lg border border-zinc-200/80 focus:border-[#ff4d00] focus:ring-1 focus:ring-[#ff4d00]/20 transition outline-none font-medium placeholder:text-zinc-400"
          />

          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-0.5 text-[10px] font-mono text-zinc-400 bg-white border border-zinc-200 px-1.5 py-0.5 rounded shadow-2xs">
            <Command className="w-2.5 h-2.5" />
            <span>K</span>
          </div>
        </div>
      </div>

      {/* Right: User & Actions */}
      <div className="flex items-center space-x-2">
        {/* User Account Info */}
        {currentUser && (
          <div className="hidden sm:flex items-center space-x-2 px-2.5 py-1 rounded-lg bg-zinc-50 border border-zinc-200/80">
            {currentUser.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-5 h-5 rounded-md object-cover ring-1 ring-zinc-300"
              />
            ) : (
              <div className="w-5 h-5 rounded-md bg-zinc-100 ring-1 ring-zinc-300 flex items-center justify-center">
                <span className="text-[9px] font-bold text-zinc-600">
                  {currentUser.name?.charAt(0).toUpperCase() || '?'}
                </span>
              </div>
            )}

            <div className="text-left leading-tight">
              <div className="text-xs font-bold text-zinc-900 truncate max-w-[120px]">
                {currentUser.name}
              </div>
            </div>
          </div>
        )}

        {/* Logout */}
        {currentUser && (
          <button
            onClick={onLogout}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 text-xs font-semibold text-zinc-600 hover:text-rose-700 bg-white hover:bg-rose-50 rounded-lg border border-zinc-200 hover:border-rose-200 transition cursor-pointer"
            title="Wyloguj"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Wyloguj</span>
          </button>
        )}

        {/* Planning Shortcut */}
        <button
          onClick={onOpenPlanningClick}
          className="hidden md:flex items-center space-x-1.5 px-2.5 py-1.5 text-xs font-semibold text-zinc-700 hover:text-zinc-950 bg-white hover:bg-zinc-100 rounded-lg border border-zinc-200 transition cursor-pointer"
        >
          <Calendar className="w-3.5 h-3.5 text-zinc-500" />
          <span>Harmonogram</span>
        </button>
      </div>
    </header>
  );
};