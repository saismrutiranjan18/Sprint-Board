import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { BoardView } from './views/BoardView';
import { BacklogView } from './views/BacklogView';
import { SprintsView } from './views/SprintsView';
import { DashboardView } from './views/DashboardView';
import { ActivityView } from './views/ActivityView';
import { TeamView } from './views/TeamView';
import { SettingsView } from './views/SettingsView';
import { CreateIssueModal } from './CreateIssueModal';
import { IssueDetailModal } from './IssueDetailModal';
import { Issue } from '../types';
import {
  Bell, HelpCircle, Search, Plus, Settings, BarChart3,
  Users, Calendar, List, LayoutDashboard, Activity,
  X, User, LogOut, Moon, Sun, Kanban,
  CheckCircle2, Info, AlertTriangle, Keyboard,
  Bug, ShieldCheck, ChevronRight,
} from 'lucide-react';

type TabType = 'board' | 'backlog' | 'sprints' | 'dashboard' | 'activity' | 'team' | 'settings';

export const ModernDashboard: React.FC = () => {
  const { currentUser, logout, project, addIssue, issues, activities, users } = useApp();

  const [activeTab, setActiveTab] = useState<TabType>('board');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHelpMenu, setShowHelpMenu] = useState(false);
  const [isCreateIssueOpen, setIsCreateIssueOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showThemePanel, setShowThemePanel] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [showBugModal, setShowBugModal] = useState(false);
  const [bugSubmitted, setBugSubmitted] = useState(false);
  const [bugText, setBugText] = useState('');

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [searchSelectedIssue, setSearchSelectedIssue] = useState<Issue | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const tabs = [
    { id: 'board' as TabType,      label: 'Board',     icon: LayoutDashboard },
    { id: 'backlog' as TabType,    label: 'Backlog',   icon: List },
    { id: 'sprints' as TabType,    label: 'Sprints',   icon: Calendar },
    { id: 'dashboard' as TabType,  label: 'Dashboard', icon: BarChart3 },
    { id: 'activity' as TabType,   label: 'Activity',  icon: Activity },
    { id: 'team' as TabType,       label: 'Team',      icon: Users },
    { id: 'settings' as TabType,   label: 'Settings',  icon: Settings },
  ];

  const renderView = () => {
    switch (activeTab) {
      case 'board':     return <BoardView />;
      case 'backlog':   return <BacklogView />;
      case 'sprints':   return <SprintsView />;
      case 'dashboard': return <DashboardView />;
      case 'activity':  return <ActivityView />;
      case 'team':      return <TeamView />;
      case 'settings':  return <SettingsView />;
      default:          return <BoardView />;
    }
  };

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase();

  const handleCreateIssueSubmit = (issueData: {
    key: string; title: string; description: string;
    type: import('../types').IssueType;
    priority: import('../types').IssuePriority;
    status: import('../types').IssueStatus;
    assigneeId?: string; sprintId?: string;
    labels: string[]; estimatedHours?: number;
  }) => {
    addIssue({
      ...issueData,
      reporterId: currentUser!.id,
      comments: [], workLogs: [], links: [], attachments: [],
    });
    setIsCreateIssueOpen(false);
  };

  // Search filtering
  const searchResults = searchQuery.trim().length >= 1
    ? issues
        .filter(i =>
          i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          i.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (i.description ?? '').toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 8)
    : [];

  const openSearch = () => {
    setShowSearch(true);
    setTimeout(() => searchRef.current?.focus(), 50);
  };

  const closeSearch = () => {
    setShowSearch(false);
    setSearchQuery('');
  };

  // Global keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        showSearch ? closeSearch() : openSearch();
        return;
      }
      if (e.key === 'Escape') {
        closeSearch();
        setShowShortcutsModal(false);
        setShowBugModal(false);
        setShowProfileModal(false);
        setShowThemePanel(false);
        closeAllMenus();
        return;
      }
      // Press C to create issue (only when no input active)
      const tag = (document.activeElement as HTMLElement)?.tagName;
      if (e.key === 'c' && !e.ctrlKey && !e.metaKey && tag !== 'INPUT' && tag !== 'TEXTAREA') {
        setIsCreateIssueOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [showSearch]);

  const recentActivities = activities.slice(0, 8);
  const unreadCount = Math.min(recentActivities.length, 9);

  const closeAllMenus = () => {
    setShowUserMenu(false);
    setShowCreateMenu(false);
    setShowNotifications(false);
    setShowHelpMenu(false);
  };

  const handleBugSubmit = () => {
    if (!bugText.trim()) return;
    setBugSubmitted(true);
    setBugText('');
    setTimeout(() => { setBugSubmitted(false); setShowBugModal(false); }, 2000);
  };

  return (
    <div className="h-screen flex flex-col bg-[#F4F5F7] overflow-hidden">

      {/* ── TOP NAVIGATION BAR ─────────────────────────────────────────── */}
      <header className="bg-white border-b border-gray-200 h-14 flex items-center px-4 gap-4 flex-shrink-0 z-50">

        {/* Logo — Kanban icon */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center text-white shadow-sm">
            <Kanban style={{ width: 18, height: 18 }} />
          </div>
          <span className="font-bold text-gray-800 hidden sm:block tracking-tight">SprintBoard</span>
        </div>

        {/* Search — functional button that opens overlay */}
        <div className="flex-1 max-w-md">
          <button
            onClick={openSearch}
            className="w-full flex items-center gap-2 pl-3 pr-4 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-400 hover:bg-gray-100 hover:border-gray-300 transition-all text-left"
          >
            <Search className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1">Search issues…</span>
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 bg-white border border-gray-200 rounded text-[10px] text-gray-400 font-mono">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-1 flex-shrink-0 ml-auto">

          {/* Create */}
          <div className="relative mr-2">
            <button
              onClick={() => { closeAllMenus(); setShowCreateMenu(v => !v); }}
              className="px-4 py-1.5 bg-[#0052CC] hover:bg-[#0065FF] text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" /> Create
            </button>
            {showCreateMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowCreateMenu(false)} />
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <button
                    onClick={() => { setIsCreateIssueOpen(true); setShowCreateMenu(false); }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4 text-gray-400" /> Create Issue
                  </button>
                  <button
                    onClick={() => { setActiveTab('backlog'); setShowCreateMenu(false); }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Calendar className="w-4 h-4 text-gray-400" /> Create Sprint
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => { closeAllMenus(); setShowNotifications(v => !v); }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            {showNotifications && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 text-sm">Notifications</h3>
                    <span className="text-xs text-gray-400">{recentActivities.length} recent</span>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {recentActivities.length === 0 ? (
                      <p className="px-4 py-8 text-center text-sm text-gray-400">No recent activity</p>
                    ) : recentActivities.map(act => {
                      const actUser = users.find(u => u.id === act.userId);
                      return (
                        <div key={act.id} className="px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0">
                          <div className="flex items-start gap-2">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-xs font-medium flex-shrink-0 mt-0.5">
                              {actUser?.name.split(' ').map(n => n[0]).join('') ?? '?'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-700 leading-relaxed">
                                <span className="font-medium">{actUser?.name ?? 'Someone'}</span>{' '}{act.details}
                              </p>
                              <p className="text-xs text-gray-400 mt-0.5">
                                {new Date(act.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="px-4 py-2 border-t border-gray-100">
                    <button
                      onClick={() => { setActiveTab('activity'); setShowNotifications(false); }}
                      className="text-xs text-[#0052CC] hover:underline"
                    >
                      View all activity →
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Help */}
          <div className="relative">
            <button
              onClick={() => { closeAllMenus(); setShowHelpMenu(v => !v); }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <HelpCircle className="w-5 h-5 text-gray-600" />
            </button>
            {showHelpMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowHelpMenu(false)} />
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100 mb-1">
                    <p className="text-xs font-semibold text-gray-500 uppercase">Help & Resources</p>
                  </div>
                  <button
                    onClick={() => { setActiveTab('dashboard'); setShowHelpMenu(false); }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                  >
                    <Info className="w-4 h-4 text-gray-400" /> Getting Started
                  </button>
                  <button
                    onClick={() => { setShowShortcutsModal(true); setShowHelpMenu(false); }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                  >
                    <Keyboard className="w-4 h-4 text-gray-400" /> Keyboard Shortcuts
                  </button>
                  <button
                    onClick={() => { setShowBugModal(true); setShowHelpMenu(false); }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                  >
                    <Bug className="w-4 h-4 text-gray-400" /> Report a Bug
                  </button>
                </div>
              </>
            )}
          </div>

          {/* User Avatar */}
          <div className="relative ml-1">
            <button
              onClick={() => { closeAllMenus(); setShowUserMenu(v => !v); }}
              className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-medium hover:ring-2 hover:ring-blue-500 transition-all"
              title={currentUser?.name}
            >
              {getInitials(currentUser?.name || 'User')}
            </button>
            {showUserMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-medium flex-shrink-0">
                        {getInitials(currentUser?.name || 'User')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-[#172B4D] truncate">{currentUser?.name}</div>
                        <div className="text-xs text-gray-500 truncate">{currentUser?.email}</div>
                        <div className="text-xs text-gray-400 capitalize">{currentUser?.role}</div>
                      </div>
                    </div>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => { setShowProfileModal(true); setShowUserMenu(false); }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                    >
                      <User className="w-4 h-4 text-gray-400" /> Profile
                    </button>
                    <button
                      onClick={() => { setActiveTab('settings'); setShowUserMenu(false); }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                    >
                      <Settings className="w-4 h-4 text-gray-400" /> Account settings
                    </button>
                    <button
                      onClick={() => { setShowThemePanel(true); setShowUserMenu(false); }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                    >
                      <Sun className="w-4 h-4 text-gray-400" /> Theme
                    </button>
                  </div>
                  <div className="border-t border-gray-100 py-1">
                    <button
                      onClick={() => { logout(); setShowUserMenu(false); }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3"
                    >
                      <LogOut className="w-4 h-4" /> Log out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── PROJECT HEADER + TABS ───────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 px-6 flex-shrink-0">
        <div className="flex items-center gap-3 pt-4 pb-2">
          <div className="w-8 h-8 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-[#0052CC] font-bold text-xs">{project.key}</span>
          </div>
          <div>
            <div className="text-xs text-gray-400">Projects / {project.name}</div>
            <h1 className="text-xl font-bold text-[#172B4D] leading-tight">{project.name}</h1>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-3 border-b-2 transition-colors whitespace-nowrap text-sm ${
                  isActive
                    ? 'border-[#0052CC] text-[#0052CC] font-medium'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* ── MAIN CONTENT ────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">{renderView()}</div>
      </div>

      {/* ══════════ MODALS ══════════ */}

      {isCreateIssueOpen && (
        <CreateIssueModal
          isOpen={isCreateIssueOpen}
          onClose={() => setIsCreateIssueOpen(false)}
          onSubmit={handleCreateIssueSubmit}
        />
      )}

      {/* ── SEARCH OVERLAY ─────────────────────────────────────────────── */}
      {showSearch && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4">
          <div className="absolute inset-0 bg-black bg-opacity-40" onClick={closeSearch} />
          <div className="relative w-full max-w-xl bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
              <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search issues by title, key or description…"
                className="flex-1 text-sm text-gray-800 placeholder-gray-400 outline-none bg-transparent"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              )}
              <kbd className="hidden sm:inline-flex px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded text-[10px] text-gray-400 font-mono">Esc</kbd>
            </div>
            {searchQuery.trim() ? (
              <div className="max-h-80 overflow-y-auto">
                {searchResults.length === 0 ? (
                  <p className="px-4 py-8 text-center text-sm text-gray-400">No issues found for "{searchQuery}"</p>
                ) : searchResults.map(issue => (
                  <button
                    key={issue.id}
                    onClick={() => { setSearchSelectedIssue(issue); closeSearch(); }}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 border-b border-gray-50 last:border-0"
                  >
                    <span className="text-xs text-gray-400 font-mono w-16 flex-shrink-0">{issue.key}</span>
                    <span className="text-sm text-gray-800 flex-1 truncate">{issue.title}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                      issue.status === 'done' ? 'bg-green-100 text-green-700' :
                      issue.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                      issue.status === 'in-review' ? 'bg-purple-100 text-purple-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>{issue.status}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                  </button>
                ))}
              </div>
            ) : (
              <p className="px-4 py-6 text-center text-sm text-gray-400">Start typing to search across all issues</p>
            )}
          </div>
        </div>
      )}

      {searchSelectedIssue && (
        <IssueDetailModal issue={searchSelectedIssue} onClose={() => setSearchSelectedIssue(null)} />
      )}

      {/* ── KEYBOARD SHORTCUTS ─────────────────────────────────────────── */}
      {showShortcutsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Keyboard className="w-5 h-5 text-gray-500" />
                <h2 className="text-lg font-semibold text-gray-900">Keyboard Shortcuts</h2>
              </div>
              <button onClick={() => setShowShortcutsModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-1">
              {[
                { keys: ['⌘', 'K'], label: 'Open search' },
                { keys: ['C'],       label: 'Create new issue' },
                { keys: ['Esc'],     label: 'Close any modal or overlay' },
                { keys: ['Enter'],   label: 'Submit a comment' },
                { keys: ['Tab'],     label: 'Navigate between form fields' },
              ].map(({ keys, label }) => (
                <div key={label} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                  <span className="text-sm text-gray-700">{label}</span>
                  <div className="flex items-center gap-1">
                    {keys.map(k => (
                      <kbd key={k} className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-mono text-gray-600 shadow-sm">{k}</kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
              <button onClick={() => setShowShortcutsModal(false)} className="px-4 py-2 text-sm bg-[#0052CC] text-white rounded-lg hover:bg-[#0065FF]">
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── REPORT A BUG ───────────────────────────────────────────────── */}
      {showBugModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Bug className="w-5 h-5 text-red-500" />
                <h2 className="text-lg font-semibold text-gray-900">Report a Bug</h2>
              </div>
              <button onClick={() => setShowBugModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            {bugSubmitted ? (
              <div className="px-6 py-10 text-center">
                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className="font-semibold text-gray-900">Thank you for the report!</p>
                <p className="text-sm text-gray-500 mt-1">We'll look into it shortly.</p>
              </div>
            ) : (
              <div className="p-6 space-y-4">
                <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-100 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700">This is a demo app — reports are stored locally only.</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Describe the bug</label>
                  <textarea
                    value={bugText}
                    onChange={e => setBugText(e.target.value)}
                    rows={4}
                    placeholder="What happened? What did you expect to happen?"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
                <div className="flex gap-3 justify-end">
                  <button onClick={() => setShowBugModal(false)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                  <button
                    onClick={handleBugSubmit}
                    disabled={!bugText.trim()}
                    className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                  >
                    Submit Report
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── PROFILE ────────────────────────────────────────────────────── */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Your Profile</h2>
              <button onClick={() => setShowProfileModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl font-bold">
                  {getInitials(currentUser?.name || 'User')}
                </div>
              </div>
              <div className="space-y-3">
                {[{ label: 'Full Name', value: currentUser?.name }, { label: 'Email', value: currentUser?.email }].map(f => (
                  <div key={f.label}>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">{f.label}</label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800">{f.value}</div>
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Role</label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm">
                    <span className={`capitalize font-medium flex items-center gap-1.5 ${currentUser?.role === 'admin' ? 'text-purple-700' : 'text-blue-700'}`}>
                      {currentUser?.role === 'admin' && <ShieldCheck className="w-3.5 h-3.5" />}
                      {currentUser?.role}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-[#0052CC]">{issues.filter(i => i.assigneeId === currentUser?.id).length}</div>
                    <div className="text-xs text-gray-500 mt-0.5">Assigned</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-green-600">{issues.filter(i => i.assigneeId === currentUser?.id && i.status === 'done').length}</div>
                    <div className="text-xs text-gray-500 mt-0.5">Completed</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
              <button onClick={() => { setShowProfileModal(false); setActiveTab('settings'); }} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Go to Settings</button>
              <button onClick={() => setShowProfileModal(false)} className="px-4 py-2 text-sm bg-[#0052CC] text-white rounded-lg hover:bg-[#0065FF]">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ── THEME ──────────────────────────────────────────────────────── */}
      {showThemePanel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Theme</h2>
              <button onClick={() => setShowThemePanel(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div className="p-6 space-y-3">
              <div className="flex items-center gap-4 p-4 rounded-xl border-2 border-[#0052CC] bg-blue-50">
                <Sun className="w-5 h-5 text-[#0052CC]" />
                <div><div className="font-medium text-sm text-gray-900">Light</div><div className="text-xs text-gray-500">Default clean interface</div></div>
                <CheckCircle2 className="w-4 h-4 text-[#0052CC] ml-auto" />
              </div>
              <div className="flex items-center gap-4 p-4 rounded-xl border-2 border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed">
                <Moon className="w-5 h-5 text-gray-400" />
                <div><div className="font-medium text-sm text-gray-900">Dark</div><div className="text-xs text-gray-400">Coming soon</div></div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
              <button onClick={() => setShowThemePanel(false)} className="px-4 py-2 text-sm bg-[#0052CC] text-white rounded-lg hover:bg-[#0065FF]">Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};