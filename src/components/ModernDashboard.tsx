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
import { Bell, HelpCircle, Search, Plus, Settings, BarChart3, Users, Calendar, List, LayoutDashboard, Activity } from 'lucide-react';

type TabType = 'board' | 'backlog' | 'sprints' | 'dashboard' | 'activity' | 'team' | 'settings';

export const ModernDashboard: React.FC = () => {
  const { currentUser, logout, project } = useApp();
  const [activeTab, setActiveTab] = useState<TabType>('board');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [isCreateIssueOpen, setIsCreateIssueOpen] = useState(false);

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
      case 'board':
        return <BoardView />;
      case 'backlog':
        return <BacklogView />;
      case 'sprints':
        return <SprintsView />;
      case 'dashboard':
        return <DashboardView />;
      case 'activity':
        return <ActivityView />;
      case 'team':
        return <TeamView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <BoardView />;
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="h-screen flex flex-col bg-[#F4F5F7]">
      {/* Top Navigation Bar - Atlassian Style */}
      <header className="bg-white border-b border-gray-200 h-14 flex items-center px-4 gap-4 flex-shrink-0 relative z-50">
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
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Create Button */}
          <div className="relative">
            <button
              onClick={() => setShowCreateMenu(!showCreateMenu)}
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
                    onClick={() => {
                      setIsCreateIssueOpen(true);
                      setShowCreateMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors"
                  >
                    Create Issue
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Icon Buttons */}
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <HelpCircle className="w-5 h-5 text-gray-600" />
          </button>

          {/* User Avatar */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-medium hover:ring-2 hover:ring-blue-500 transition-all"
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
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-medium">
                        {getInitials(currentUser?.name || 'User')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-[#172B4D] truncate">
                          {currentUser?.name}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {currentUser?.email}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-1">
                    <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      Profile
                    </button>
                    <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      Account settings
                    </button>
                    <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      Theme
                    </button>
                    <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      Switch account
                    </button>
                  </div>

                  <div className="border-t border-gray-100 py-1">
                    <button
                      onClick={() => {
                        logout();
                        setShowUserMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Log out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Project Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center text-blue-600 font-semibold text-sm">
            {project.key}
          </div>
          <div>
            <div className="text-xs text-gray-500">Projects / {project.name}</div>
            <h1 className="text-xl font-semibold text-[#172B4D]">{project.name}</h1>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex gap-6 -mb-4">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-1 pb-4 border-b-2 transition-colors ${
                  isActive
                    ? 'border-[#0052CC] text-[#0052CC] font-medium'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          <div className="p-6">
            {renderView()}
          </div>
        </div>
      </div>

      {/* Modals */}
      {isCreateIssueOpen && (
        <CreateIssueModal
          isOpen={isCreateIssueOpen}
          onClose={() => setIsCreateIssueOpen(false)}
          onSubmit={() => {
            setIsCreateIssueOpen(false);
          }}
        />
      )}
    </div>
  );
};
