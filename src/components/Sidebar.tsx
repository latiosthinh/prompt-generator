'use client';

import React, { useState, useMemo } from 'react';
import { Session } from '@/types/schemas';
import {
  Plus,
  Search,
  Trash2,
  MessageSquare,
  ChevronLeft,
  Sparkles,
  Layers,
} from 'lucide-react';
import { Translations, Locale } from '@/i18n';

interface SidebarProps {
  sessions: Session[];
  activeSessionId: string | null;
  isOpen: boolean;
  onToggle: () => void;
  onSelectSession: (sessionId: string) => void;
  onNewSession: () => void;
  onDeleteSession: (sessionId: string) => void;
  onClearAll: () => void;
  t: Translations;
  currentLocale: Locale;
}

function formatRelativeTime(timestamp: number, t: Translations, locale: Locale): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return t.sidebar.time.justNow;
  if (minutes < 60) return t.sidebar.time.minutesAgo.replace('{m}', String(minutes));
  if (hours < 24) return t.sidebar.time.hoursAgo.replace('{h}', String(hours));
  if (days === 1) return t.sidebar.time.yesterday;
  if (days < 7) return t.sidebar.time.daysAgo.replace('{d}', String(days));
  return new Date(timestamp).toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function getDomainColor(domain: string): string {
  const d = domain.toLowerCase();
  if (d.includes('hình ảnh') || d.includes('image')) return 'bg-pink-500/15 text-pink-400 border-pink-500/30';
  if (d.includes('video')) return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
  if (d.includes('lập trình') || d.includes('code') || d.includes('tech')) return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
  if (d.includes('viết') || d.includes('writing') || d.includes('copy')) return 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30';
  if (d.includes('agent') || d.includes('system')) return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
  return 'bg-[#DA7756]/15 text-[#DA7756] border-[#DA7756]/30';
}

export function Sidebar({
  sessions,
  activeSessionId,
  isOpen,
  onToggle,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onClearAll,
  t,
  currentLocale,
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomainFilter, setSelectedDomainFilter] = useState<string | null>(null);

  // Extract unique domains
  const uniqueDomains = useMemo(() => {
    const domains = new Set<string>();
    sessions.forEach((s) => {
      if (s.domain) domains.add(s.domain);
    });
    return Array.from(domains);
  }, [sessions]);

  // Filtered sessions
  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      const matchesSearch =
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.seed.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDomain = !selectedDomainFilter || s.domain === selectedDomainFilter;
      return matchesSearch && matchesDomain;
    });
  }, [sessions, searchQuery, selectedDomainFilter]);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onToggle}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-2xs md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-14 bottom-0 left-0 z-40 flex flex-col border-r border-[#2B2520] bg-[#14110F] transition-all duration-300 ${
          isOpen ? 'w-72 sm:w-76 translate-x-0' : '-translate-x-full md:w-0 md:translate-x-0 md:border-r-0 overflow-hidden'
        }`}
      >
        {/* Top bar: Brand & New Chat */}
        <div className="flex items-center justify-between border-b border-[#2B2520] p-3">
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded bg-[#DA7756] text-white">
              <Sparkles className="h-3 w-3" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#FBF9F5]">
              {t.sidebar.title}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onNewSession}
              title={t.sidebar.newTooltip}
              className="inline-flex items-center gap-1 rounded bg-[#1E1917] px-2.5 py-1 text-xs font-semibold text-[#EDE5DC] border border-[#38312C] hover:border-[#DA7756] hover:text-[#DA7756] transition cursor-pointer"
            >
              <Plus className="h-3 w-3" />
              <span>{t.sidebar.newButton}</span>
            </button>
            <button
              type="button"
              onClick={onToggle}
              className="rounded p-1 text-[#8E8377] hover:bg-[#1E1917] hover:text-[#EDE5DC] md:hidden cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Search & Domain Filter Bar */}
        <div className="space-y-2 border-b border-[#2B2520] p-2.5">
          <div className="relative">
            <Search className="absolute top-2 left-2.5 h-3.5 w-3.5 text-[#8E8377]" />
            <input
              type="text"
              placeholder={t.sidebar.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md border border-[#38312C] bg-[#1E1917] py-1 pr-2.5 pl-7.5 text-xs text-[#EDE5DC] outline-hidden placeholder:text-[#8E8377] focus:border-[#DA7756]"
            />
          </div>

          {uniqueDomains.length > 0 && (
            <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none text-[10px]">
              <button
                type="button"
                onClick={() => setSelectedDomainFilter(null)}
                className={`shrink-0 rounded px-2 py-0.5 font-medium transition cursor-pointer ${
                  selectedDomainFilter === null
                    ? 'bg-[#DA7756] text-white font-bold'
                    : 'bg-[#1E1917] text-[#8E8377] hover:text-[#EDE5DC]'
                }`}
              >
                {t.sidebar.filterAll}
              </button>
              {uniqueDomains.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setSelectedDomainFilter(selectedDomainFilter === d ? null : d)}
                  className={`shrink-0 rounded px-2 py-0.5 font-medium transition cursor-pointer ${
                    selectedDomainFilter === d
                      ? 'bg-[#DA7756] text-white font-bold'
                      : 'bg-[#1E1917] text-[#8E8377] hover:text-[#EDE5DC]'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sessions list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredSessions.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#8E8377]">
              <MessageSquare className="mx-auto mb-2 h-5 w-5 opacity-40" />
              {searchQuery || selectedDomainFilter ? t.sidebar.emptySearch : t.sidebar.emptyHistory}
            </div>
          ) : (
            filteredSessions.map((session) => {
              const isActive = session.id === activeSessionId;
              const roundCount = session.rounds?.length || 1;

              return (
                <div
                  key={session.id}
                  onClick={() => onSelectSession(session.id)}
                  className={`group relative flex flex-col gap-1 rounded-lg border p-2.5 text-left transition cursor-pointer ${
                    isActive
                      ? 'border-[#DA7756]/50 bg-[#1E1917] shadow-xs'
                      : 'border-transparent hover:border-[#38312C] hover:bg-[#1A1614]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4
                      className={`text-xs font-semibold line-clamp-1 ${
                        isActive
                          ? 'text-[#DA7756]'
                          : 'text-[#EDE5DC]'
                      }`}
                    >
                      {session.title || session.seed}
                    </h4>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSession(session.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 rounded p-0.5 text-[#8E8377] hover:text-red-400 transition cursor-pointer"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>

                  <p className="text-[11px] text-[#8E8377] line-clamp-2 leading-relaxed font-mono">
                    {session.seed}
                  </p>

                  <div className="flex items-center justify-between pt-1 text-[10px] text-[#8E8377]">
                    <span className={`inline-flex items-center rounded-sm border px-1 py-0.2 font-medium font-mono ${getDomainColor(session.domain)}`}>
                      {session.domain}
                    </span>

                    <div className="flex items-center gap-2 font-mono">
                      {roundCount > 1 && (
                        <span className="flex items-center gap-0.5 text-[#DA7756]">
                          <Layers className="h-2.5 w-2.5" />
                          <span>{t.sidebar.roundPrefix}{roundCount}</span>
                        </span>
                      )}
                      <span>{formatRelativeTime(session.updatedAt, t, currentLocale)}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer: Clear All */}
        {sessions.length > 0 && (
          <div className="border-t border-[#2B2520] p-2.5">
            <button
              type="button"
              onClick={onClearAll}
              className="w-full flex items-center justify-center gap-1.5 rounded-md border border-[#38312C] bg-[#1E1917] px-2.5 py-1 text-xs text-[#8E8377] hover:bg-red-950/40 hover:text-red-400 hover:border-red-900/50 transition cursor-pointer"
            >
              <Trash2 className="h-3 w-3" />
              <span>{t.sidebar.clearAll}</span>
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
