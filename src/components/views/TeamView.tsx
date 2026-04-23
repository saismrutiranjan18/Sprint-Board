import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { IssueDetailModal } from '../IssueDetailModal';
import { Issue } from '../../types';

export const TeamView: React.FC = () => {
  const { users, issues } = useApp();
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  return (
    <div>
      <h2 className="text-2xl font-semibold text-[#172B4D] mb-6">Team Members</h2>

      {users.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-500">No team members yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {users.map(user => {
            const userIssues = issues.filter(i => i.assigneeId === user.id);
            const completed = userIssues.filter(i => i.status === 'done').length;
            const inProgress = userIssues.filter(i => i.status === 'in-progress').length;
            const isExpanded = expandedUser === user.id;

            return (
              <div key={user.id} className="bg-white rounded-lg border border-gray-200">
                <div
                  className="p-6 cursor-pointer"
                  onClick={() => setExpandedUser(isExpanded ? null : user.id)}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-medium text-lg flex-shrink-0">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{user.name}</h3>
                      <p className="text-sm text-gray-500 truncate">{user.email}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        user.role === 'admin'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {user.role}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="bg-gray-50 rounded-lg p-2">
                      <div className="text-xl font-bold text-[#0052CC]">{userIssues.length}</div>
                      <div className="text-xs text-gray-500">Assigned</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <div className="text-xl font-bold text-yellow-500">{inProgress}</div>
                      <div className="text-xs text-gray-500">Active</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <div className="text-xl font-bold text-green-500">{completed}</div>
                      <div className="text-xs text-gray-500">Done</div>
                    </div>
                  </div>
                </div>

                {/* Expanded issue list */}
                {isExpanded && userIssues.length > 0 && (
                  <div className="border-t border-gray-100">
                    <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
                      Assigned Issues
                    </div>
                    <div className="divide-y divide-gray-50">
                      {userIssues.map(issue => (
                        <div
                          key={issue.id}
                          onClick={() => setSelectedIssue(issue)}
                          className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center gap-2 group"
                        >
                          <span className="text-xs text-gray-400 font-mono w-16 flex-shrink-0">{issue.key}</span>
                          <span className="text-xs text-gray-700 flex-1 truncate group-hover:text-[#0052CC]">{issue.title}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                            issue.status === 'done' ? 'bg-green-100 text-green-700'
                            : issue.status === 'in-progress' ? 'bg-blue-100 text-blue-700'
                            : issue.status === 'in-review' ? 'bg-purple-100 text-purple-700'
                            : 'bg-gray-100 text-gray-600'
                          }`}>
                            {issue.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {isExpanded && userIssues.length === 0 && (
                  <div className="border-t border-gray-100 px-4 py-4 text-center text-xs text-gray-400">
                    No issues assigned
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {selectedIssue && (
        <IssueDetailModal
          issue={selectedIssue}
          onClose={() => setSelectedIssue(null)}
        />
      )}
    </div>
  );
};