import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { IssueDetailModal } from '../IssueDetailModal';
import { Issue } from '../../types';

export const DashboardView: React.FC = () => {
  const { issues, sprints, users } = useApp();
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  const byStatus = {
    backlog: issues.filter(i => i.status === 'backlog').length,
    todo: issues.filter(i => i.status === 'todo').length,
    'in-progress': issues.filter(i => i.status === 'in-progress').length,
    'in-review': issues.filter(i => i.status === 'in-review').length,
    done: issues.filter(i => i.status === 'done').length,
  };

  const byType = {
    task: issues.filter(i => i.type === 'task').length,
    story: issues.filter(i => i.type === 'story').length,
    bug: issues.filter(i => i.type === 'bug').length,
    epic: issues.filter(i => i.type === 'epic').length,
  };

  const activeSprint = sprints.find(s => s.status === 'active');
  const activeSprintIssues = activeSprint ? issues.filter(i => i.sprintId === activeSprint.id) : [];
  const activeSprintDone = activeSprintIssues.filter(i => i.status === 'done').length;
  const activeSprintProgress = activeSprintIssues.length > 0
    ? Math.round((activeSprintDone / activeSprintIssues.length) * 100)
    : 0;

  const recentIssues = [...issues]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 8);

  const typeIcons: Record<string, string> = { story: '📖', task: '✅', bug: '🐛', epic: '🎯' };

  const statCards = [
    { label: 'Backlog', count: byStatus.backlog, color: 'text-gray-600', bg: 'bg-gray-50' },
    { label: 'To Do', count: byStatus.todo, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'In Progress', count: byStatus['in-progress'], color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'In Review', count: byStatus['in-review'], color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Done', count: byStatus.done, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Total Issues', count: issues.length, color: 'text-[#0052CC]', bg: 'bg-blue-50' },
  ];

  return (
    <div>
      <h2 className="text-2xl font-semibold text-[#172B4D] mb-6">Dashboard</h2>

      {/* Status Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {statCards.map(card => (
          <div key={card.label} className={`${card.bg} p-5 rounded-lg border border-gray-200`}>
            <div className={`text-3xl font-bold ${card.color}`}>{card.count}</div>
            <div className="text-sm text-gray-600 mt-1">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Issue Types Breakdown */}
        <div className="bg-white p-5 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">By Type</h3>
          <div className="space-y-3">
            {Object.entries(byType).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <span>{typeIcons[type]}</span>
                  <span className="capitalize text-gray-700">{type}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#0052CC] rounded-full"
                      style={{ width: issues.length > 0 ? `${(count / issues.length) * 100}%` : '0%' }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-600 w-6 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Sprint */}
        <div className="bg-white p-5 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">Active Sprint</h3>
          {activeSprint ? (
            <div className="space-y-3">
              <div>
                <div className="font-medium text-gray-800">{activeSprint.name}</div>
                {activeSprint.goal && (
                  <div className="text-xs text-gray-500 mt-0.5">{activeSprint.goal}</div>
                )}
              </div>
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>{activeSprintDone} / {activeSprintIssues.length} issues done</span>
                  <span>{activeSprintProgress}%</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all"
                    style={{ width: `${activeSprintProgress}%` }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center pt-1">
                {[
                  { label: 'To Do', count: activeSprintIssues.filter(i => i.status === 'todo').length },
                  { label: 'In Progress', count: activeSprintIssues.filter(i => i.status === 'in-progress').length },
                  { label: 'In Review', count: activeSprintIssues.filter(i => i.status === 'in-review').length },
                  { label: 'Done', count: activeSprintDone },
                ].map(s => (
                  <div key={s.label} className="bg-gray-50 rounded-lg p-2">
                    <div className="text-lg font-bold text-gray-800">{s.count}</div>
                    <div className="text-xs text-gray-500">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 text-sm">No active sprint</div>
              <div className="text-gray-400 text-xs mt-1">Start a sprint from Backlog view</div>
            </div>
          )}
        </div>
      </div>

      {/* Team Stats */}
      <div className="bg-white p-5 rounded-lg border border-gray-200 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">Team Performance</h3>
        <div className="grid grid-cols-2 gap-3">
          {users.map(user => {
            const assigned = issues.filter(i => i.assigneeId === user.id).length;
            const completed = issues.filter(i => i.assigneeId === user.id && i.status === 'done').length;
            return (
              <div key={user.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-gray-800 truncate">{user.name}</div>
                  <div className="text-xs text-gray-500">{assigned} assigned · {completed} done</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recently Updated Issues */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Recently Updated Issues</h3>
        </div>
        {recentIssues.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No issues yet.</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentIssues.map(issue => (
              <div
                key={issue.id}
                onClick={() => setSelectedIssue(issue)}
                className="px-4 py-2.5 hover:bg-gray-50 cursor-pointer flex items-center gap-3 group"
              >
                <span className="text-sm flex-shrink-0">{typeIcons[issue.type] ?? '📋'}</span>
                <span className="text-xs text-gray-400 font-medium w-20 flex-shrink-0">{issue.key}</span>
                <span className="text-sm text-gray-800 flex-1 truncate group-hover:text-[#0052CC]">{issue.title}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                  issue.status === 'done' ? 'bg-green-100 text-green-700'
                  : issue.status === 'in-progress' ? 'bg-blue-100 text-blue-700'
                  : issue.status === 'in-review' ? 'bg-purple-100 text-purple-700'
                  : 'bg-gray-100 text-gray-600'
                }`}>
                  {issue.status}
                </span>
                <span className="text-xs text-gray-400 flex-shrink-0 hidden sm:block">
                  {new Date(issue.updatedAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedIssue && (
        <IssueDetailModal
          issue={selectedIssue}
          onClose={() => setSelectedIssue(null)}
        />
      )}
    </div>
  );
};