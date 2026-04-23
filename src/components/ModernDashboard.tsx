import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BoardView } from './views/BoardView';
import { BacklogView } from './views/BacklogView';
import { SprintsView } from './views/SprintsView';
import { DashboardView } from './views/DashboardView';
import { ActivityView } from './views/ActivityView';
import { TeamView } from './views/TeamView';
import { SettingsView } from './views/SettingsView';
import { CreateIssueModal } from './CreateIssueModal';
import {
  Bell, HelpCircle, Search, Plus, Settings, BarChart3,
  Users, Calendar, List, LayoutDashboard, Activity,
  X, User, Palette, RefreshCw, LogOut, Moon, Sun,
  CheckCircle2, Info, AlertTriangle,
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

  // Modal states
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showThemePanel, setShowThemePanel] = useState(false);
  const [isDarkHint, setIsDarkHint] = useState(false);

  const tabs = [
    { id: 'board' as TabType, label: 'Board', icon: LayoutDashboard },
    { id: 'backlog' as TabType, label: 'Backlog', icon: List },
    { id: 'sprints' as TabType, label: 'Sprints', icon: Calendar },
    { id: 'dashboard' as TabType, label: 'Dashboard', icon: BarChart3 },
    { id: 'activity' as TabType, label: 'Activity', icon: Activity },
    { id: 'team' as TabType, label: 'Team', icon: Users },
    { id: 'settings' as TabType, label: 'Settings', icon: Settings },
  ];

  const renderView = () => {
    switch (activeTab) {
      case 'board': return <BoardView />;
      case 'backlog': return <BacklogView />;
      case 'sprints': return <SprintsView />;
      case 'dashboard': return <DashboardView />;
      case 'activity': return <ActivityView />;
      case 'team': return <TeamView />;
      case 'settings': return <SettingsView />;
      default: return <BoardView />;
    }
  };

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase();

  const handleCreateIssueSubmit = (issueData: {
    key: string;
    title: string;
    description: string;
    type: import('../types').IssueType;
    priority: import('../types').IssuePriority;
    status: import('../types').IssueStatus;
    assigneeId?: string;
    sprintId?: string;
    labels: string[];
    estimatedHours?: number;
  }) => {
    addIssue({
      ...issueData,
      reporterId: currentUser!.id,
      comments: [],
      workLogs: [],
      links: [],
      attachments: [],
    });
    setIsCreateIssueOpen(false);
  };

  // Recent notifications from activities (last 8)
  const recentActivities = activities.slice(0, 8);
  const unreadCount = Math.min(recentActivities.length, 9);

  const closeAllMenus = () => {
    setShowUserMenu(false);
    setShowCreateMenu(false);
    setShowNotifications(false);
    setShowHelpMenu(false);
  };

  return (
    <div className="h-screen flex flex-col bg-[#F4F5F7] overflow-hidden">
      {/* ── TOP NAVIGATION BAR ── */}
      <header className="bg-white border-b border-gray-200 h-14 flex items-center px-4 gap-4 flex-shrink-0 z-50">
        {/* Logo */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded flex items-center justify-center text-white font-bold text-sm">
            J
          </div>
          <span className="font-semibold text-gray-800 hidden sm:block">TaskFlow</span>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1 flex-shrink-0 ml-auto">
          {/* Create Button */}
          <div className="relative mr-2">
            <button
              onClick={() => { closeAllMenus(); setShowCreateMenu(v => !v); }}
              className="px-4 py-1.5 bg-[#0052CC] hover:bg-[#0065FF] text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create
            </button>
            {showCreateMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowCreateMenu(false)} />
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <button
                    onClick={() => { setIsCreateIssueOpen(true); setShowCreateMenu(false); }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4 text-gray-400" />
                    Create Issue
                  </button>
                  <button
                    onClick={() => { setActiveTab('backlog'); setShowCreateMenu(false); }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <Calendar className="w-4 h-4 text-gray-400" />
                    Create Sprint
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => { closeAllMenus(); setShowNotifications(v => !v); }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
              title="Notifications"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
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
                      <div className="px-4 py-8 text-center text-sm text-gray-400">
                        No recent activity
                      </div>
                    ) : (
                      recentActivities.map(act => {
                        const actUser = users.find(u => u.id === act.userId);
                        return (
                          <div key={act.id} className="px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0">
                            <div className="flex items-start gap-2">
                              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-xs font-medium flex-shrink-0 mt-0.5">
                                {actUser?.name.split(' ').map(n => n[0]).join('') ?? '?'}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-700 leading-relaxed">
                                  <span className="font-medium">{actUser?.name ?? 'Someone'}</span>{' '}
                                  {act.details}
                                </p>
                                <p className="text-xs text-gray-400 mt-0.5">
                                  {new Date(act.createdAt).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
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
              title="Help"
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
                  {[
                    { icon: <Info className="w-4 h-4" />, label: 'Getting Started', action: () => setActiveTab('dashboard') },
                    { icon: <CheckCircle2 className="w-4 h-4" />, label: 'Keyboard Shortcuts', action: () => {} },
                    { icon: <AlertTriangle className="w-4 h-4" />, label: 'Report a Bug', action: () => {} },
                  ].map(item => (
                    <button
                      key={item.label}
                      onClick={() => { item.action(); setShowHelpMenu(false); }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <span className="text-gray-400">{item.icon}</span>
                      {item.label}
                    </button>
                  ))}
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
                  {/* User Profile Block */}
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

                  {/* Menu Items */}
                  <div className="py-1">
                    <button
                      onClick={() => { setShowProfileModal(true); setShowUserMenu(false); }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-3"
                    >
                      <User className="w-4 h-4 text-gray-400" />
                      Profile
                    </button>
                    <button
                      onClick={() => { setActiveTab('settings'); setShowUserMenu(false); }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-3"
                    >
                      <Settings className="w-4 h-4 text-gray-400" />
                      Account settings
                    </button>
                    <button
                      onClick={() => { setShowThemePanel(true); setShowUserMenu(false); }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-3"
                    >
                      <Palette className="w-4 h-4 text-gray-400" />
                      Theme
                    </button>
                    <button
                      onClick={() => { logout(); }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-3"
                    >
                      <RefreshCw className="w-4 h-4 text-gray-400" />
                      Switch account
                    </button>
                  </div>

                  <div className="border-t border-gray-100 py-1">
                    <button
                      onClick={() => { logout(); setShowUserMenu(false); }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3"
                    >
                      <LogOut className="w-4 h-4" />
                      Log out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── PROJECT HEADER + TABS ── */}
      <div className="bg-white border-b border-gray-200 px-6 flex-shrink-0">
        <div className="flex items-center gap-3 pt-4 pb-2">
          <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center text-blue-600 font-semibold text-sm flex-shrink-0">
            {project.key}
          </div>
          <div>
            <div className="text-xs text-gray-500">Projects / {project.name}</div>
            <h1 className="text-xl font-semibold text-[#172B4D] leading-tight">{project.name}</h1>
          </div>
        </div>

        {/* Tab Navigation */}
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

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          {renderView()}
        </div>
      </div>

      {/* ── MODALS ── */}

      {/* Create Issue Modal */}
      {isCreateIssueOpen && (
        <CreateIssueModal
          isOpen={isCreateIssueOpen}
          onClose={() => setIsCreateIssueOpen(false)}
          onSubmit={handleCreateIssueSubmit}
        />
      )}

      {/* Profile Modal */}
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
              {/* Avatar */}
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl font-bold">
                  {getInitials(currentUser?.name || 'User')}
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Full Name</label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800">
                    {currentUser?.name}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Email</label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800">
                    {currentUser?.email}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Role</label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm">
                    <span className={`capitalize font-medium ${currentUser?.role === 'admin' ? 'text-purple-700' : 'text-blue-700'}`}>
                      {currentUser?.role}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-[#0052CC]">
                      {issues.filter(i => i.assigneeId === currentUser?.id).length}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">Issues Assigned</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {issues.filter(i => i.assigneeId === currentUser?.id && i.status === 'done').length}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">Completed</div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Member Since</label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">
                    {currentUser?.createdAt ? new Date(currentUser.createdAt).toLocaleDateString() : '—'}
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
              <button
                onClick={() => { setShowProfileModal(false); setActiveTab('settings'); }}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Go to Settings
              </button>
              <button
                onClick={() => setShowProfileModal(false)}
                className="px-4 py-2 text-sm bg-[#0052CC] text-white rounded-lg hover:bg-[#0065FF]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Theme Panel */}
      {showThemePanel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Theme</h2>
              <button onClick={() => setShowThemePanel(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-3">
              <p className="text-sm text-gray-500 mb-4">Choose your preferred appearance.</p>
              {[
                { id: 'light', label: 'Light', desc: 'Default clean interface', icon: <Sun className="w-5 h-5" /> },
                { id: 'dark', label: 'Dark', desc: 'Coming soon', icon: <Moon className="w-5 h-5" />, disabled: true },
              ].map(theme => (
                <button
                  key={theme.id}
                  disabled={theme.disabled}
                  onClick={() => { if (!theme.disabled) { setIsDarkHint(false); setShowThemePanel(false); } else { setIsDarkHint(true); } }}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                    theme.disabled
                      ? 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed'
                      : !isDarkHint
                      ? 'border-[#0052CC] bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`${theme.disabled ? 'text-gray-400' : 'text-[#0052CC]'}`}>
                    {theme.icon}
                  </div>
                  <div>
                    <div className="font-medium text-sm text-gray-900">{theme.label}</div>
                    <div className="text-xs text-gray-500">{theme.desc}</div>
                  </div>
                  {!theme.disabled && (
                    <CheckCircle2 className="w-4 h-4 text-[#0052CC] ml-auto" />
                  )}
                </button>
              ))}
              {isDarkHint && (
                <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  🌙 Dark mode is coming soon! We're working on it.
                </p>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setShowThemePanel(false)}
                className="px-4 py-2 text-sm bg-[#0052CC] text-white rounded-lg hover:bg-[#0065FF]"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};