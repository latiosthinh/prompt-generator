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
  if (d.includes('hình ảnh') || d.includes('image')) return 'bg-pink-500/10 text-pink-700 dark:text-pink-400 border-pink-200 dark:border-pink-900/40';
  if (d.includes('lập trình') || d.includes('code') || d.includes('tech')) return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/40';
  if (d.includes('viết') || d.includes('writing') || d.includes('copy')) return 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-900/40';
  if (d.includes('agent') || d.includes('system')) return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900/40';
  return 'bg-[#C15F3D]/10 text-[#C15F3D] border-[#C15F3D]/20 dark:border-[#DA7756]/30 dark:text-[#DA7756]';
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
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-2xs md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col border-r border-[#E6DFD3] bg-[#F5F0E6] transition-all duration-300 dark:border-[#38312C] dark:bg-[#1F1A18] ${
          isOpen ? 'w-72 sm:w-76 translate-x-0' : '-translate-x-full md:w-0 md:translate-x-0 md:border-r-0 overflow-hidden'
        }`}
      >
        {/* Top bar: Brand & New Chat */}
        <div className="flex items-center justify-between border-b border-[#E6DFD3] p-3.5 dark:border-[#38312C]">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-sm bg-[#C15F3D] text-white dark:bg-[#DA7756]">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#2B2520] dark:text-[#EDE5DC]">
              {t.sidebar.title}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onNewSession}
              title={t.sidebar.newTooltip}
              className="inline-flex items-center gap-1 rounded-sm bg-[#FFFFFF] px-2 py-1 text-xs font-medium text-[#2B2520] border border-[#E6DFD3] shadow-2xs hover:bg-[#EDE7DC] dark:bg-[#282320] dark:border-[#38312C] dark:text-[#EDE5DC] dark:hover:bg-[#332A26] cursor-pointer"
            >
              <Plus className="h-3 w-3" />
              <span>{t.sidebar.newButton}</span>
            </button>
            <button
              type="button"
              onClick={onToggle}
              className="rounded-sm p-1 text-[#8E8377] hover:bg-[#E6DFD3] hover:text-[#2B2520] dark:hover:bg-[#282320] dark:hover:text-white md:hidden cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Search & Domain Filter Bar */}
        <div className="space-y-2 border-b border-[#E6DFD3] p-2.5 dark:border-[#38312C]">
          <div className="relative">
            <Search className="absolute top-2 left-2.5 h-3.5 w-3.5 text-[#8E8377]" />
            <input
              type="text"
              placeholder={t.sidebar.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-sm border border-[#E6DFD3] bg-[#FFFFFF] py-1 pr-2.5 pl-7.5 text-xs text-[#2B2520] outline-hidden placeholder:text-[#8E8377] focus:border-[#C15F3D] dark:border-[#38312C] dark:bg-[#282320] dark:text-[#EDE5DC]"
            />
          </div>

          {uniqueDomains.length > 0 && (
            <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none text-[10px]">
              <button
                type="button"
                onClick={() => setSelectedDomainFilter(null)}
                className={`shrink-0 rounded-xs px-2 py-0.5 font-medium transition cursor-pointer ${
                  selectedDomainFilter === null
                    ? 'bg-[#2B2520] text-white dark:bg-[#EDE5DC] dark:text-[#2B2520]'
                    : 'bg-[#EDE7DC] text-[#6B6258] hover:bg-[#E2DACB] dark:bg-[#282320] dark:text-[#B5A89B]'
                }`}
              >
                {t.sidebar.filterAll}
              </button>
              {uniqueDomains.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setSelectedDomainFilter(selectedDomainFilter === d ? null : d)}
                  className={`shrink-0 rounded-xs px-2 py-0.5 font-medium transition cursor-pointer ${
                    selectedDomainFilter === d
                      ? 'bg-[#2B2520] text-white dark:bg-[#EDE5DC] dark:text-[#2B2520]'
                      : 'bg-[#EDE7DC] text-[#6B6258] hover:bg-[#E2DACB] dark:bg-[#282320] dark:text-[#B5A89B]'
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
            <div className="py-12 text-center text-xs text-[#8E8377] dark:text-[#7E7368]">
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
                  className={`group relative flex flex-col gap-1 rounded-sm border p-2.5 text-left transition cursor-pointer ${
                    isActive
                      ? 'border-[#C15F3D] bg-[#F9EFE9] dark:border-[#DA7756] dark:bg-[#33231D]'
                      : 'border-transparent hover:border-[#E6DFD3] hover:bg-[#EDE7DC]/70 dark:hover:border-[#38312C] dark:hover:bg-[#282320]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4
                      className={`text-xs font-semibold line-clamp-1 ${
                        isActive
                          ? 'text-[#C15F3D] dark:text-[#DA7756]'
                          : 'text-[#2B2520] dark:text-[#EDE5DC]'
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
                      className="opacity-0 group-hover:opacity-100 rounded-xs p-0.5 text-[#8E8377] hover:text-red-600 transition"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>

                  <p className="text-[11px] text-[#6B6258] dark:text-[#B5A89B] line-clamp-2 leading-relaxed">
                    {session.seed}
                  </p>

                  <div className="flex items-center justify-between pt-1 text-[10px] text-[#8E8377] dark:text-[#7E7368]">
                    <span className={`inline-flex items-center rounded-xs border px-1 py-0.2 font-medium ${getDomainColor(session.domain)}`}>
                      {session.domain}
                    </span>

                    <div className="flex items-center gap-2">
                      {roundCount > 1 && (
                        <span className="flex items-center gap-0.5 text-[#C15F3D] dark:text-[#DA7756]">
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
          <div className="border-t border-[#E6DFD3] p-2.5 dark:border-[#38312C]">
            <button
              type="button"
              onClick={onClearAll}
              className="w-full flex items-center justify-center gap-1.5 rounded-sm border border-[#E6DFD3] bg-[#FFFFFF] px-2.5 py-1 text-xs text-[#6B6258] hover:bg-red-50 hover:text-red-700 hover:border-red-200 dark:border-[#38312C] dark:bg-[#282320] dark:text-[#B5A89B] dark:hover:bg-red-950/40 dark:hover:text-red-400 transition cursor-pointer"
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
