import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CreateSprintModal } from '../CreateSprintModal';
import { CreateIssueModal } from '../CreateIssueModal';
import { IssueDetailModal } from '../IssueDetailModal';
import { Issue } from '../../types';
import { Plus, ChevronDown, ChevronRight } from 'lucide-react';

export const BacklogView: React.FC = () => {
  const { issues, sprints, currentUser, startSprint, completeSprint, addSprint, addIssue } = useApp();
  const [isCreateSprintOpen, setIsCreateSprintOpen] = useState(false);
  const [isCreateIssueOpen, setIsCreateIssueOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [collapsedSprints, setCollapsedSprints] = useState<Set<string>>(new Set());

  const backlogIssues = issues.filter(i => !i.sprintId || i.status === 'backlog');
  const isAdmin = currentUser?.role === 'admin';

  const toggleSprint = (sprintId: string) => {
    setCollapsedSprints(prev => {
      const next = new Set(prev);
      next.has(sprintId) ? next.delete(sprintId) : next.add(sprintId);
      return next;
    });
  };

  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    planned: 'bg-yellow-100 text-yellow-700',
    completed: 'bg-gray-100 text-gray-600',
  };

  const issueTypeIcons: Record<string, string> = {
    story: '📖', task: '✅', bug: '🐛', epic: '🎯',
  };

  const priorityDot: Record<string, string> = {
    lowest: 'bg-gray-300', low: 'bg-blue-400', medium: 'bg-yellow-400',
    high: 'bg-orange-500', highest: 'bg-red-500',
  };

  const handleCreateSprintSubmit = (sprintData: {
    name: string;
    goal: string;
    startDate: string;
    endDate: string;
    status: import('../../types').SprintStatus;
  }) => {
    addSprint(sprintData);
    setIsCreateSprintOpen(false);
  };

  const handleCreateIssueSubmit = (issueData: {
    key: string;
    title: string;
    description: string;
    type: import('../../types').IssueType;
    priority: import('../../types').IssuePriority;
    status: import('../../types').IssueStatus;
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-[#172B4D]">Backlog</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setIsCreateIssueOpen(true)}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            Create Issue
          </button>
          {isAdmin && (
            <button
              onClick={() => setIsCreateSprintOpen(true)}
              className="px-4 py-2 bg-[#0052CC] text-white rounded-lg hover:bg-[#0065FF] transition-colors flex items-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              Create Sprint
            </button>
          )}
        </div>
      </div>

      {/* All Sprints */}
      {sprints.map(sprint => {
        const sprintIssues = issues.filter(i => i.sprintId === sprint.id);
        const completedCount = sprintIssues.filter(i => i.status === 'done').length;
        const isCollapsed = collapsedSprints.has(sprint.id);

        return (
          <div key={sprint.id} className="bg-white rounded-lg border border-gray-200">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <button
                  onClick={() => toggleSprint(sprint.id)}
                  className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                >
                  {isCollapsed
                    ? <ChevronRight className="w-4 h-4" />
                    : <ChevronDown className="w-4 h-4" />}
                </button>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900">{sprint.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[sprint.status]}`}>
                      {sprint.status}
                    </span>
                  </div>
                  {sprint.goal && (
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{sprint.goal}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                <span className="text-xs text-gray-500">
                  {completedCount}/{sprintIssues.length} done
                </span>
                {sprint.status === 'planned' && isAdmin && (
                  <button
                    onClick={() => startSprint(sprint.id)}
                    className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs font-medium"
                  >
                    Start Sprint
                  </button>
                )}
                {sprint.status === 'active' && isAdmin && (
                  <button
                    onClick={() => completeSprint(sprint.id)}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-medium"
                  >
                    Complete Sprint
                  </button>
                )}
              </div>
            </div>

            {!isCollapsed && (
              <div className="border-t border-gray-100">
                {sprintIssues.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-6">No issues in this sprint.</p>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {sprintIssues.map(issue => (
                      <div
                        key={issue.id}
                        onClick={() => setSelectedIssue(issue)}
                        className="px-4 py-2.5 hover:bg-gray-50 cursor-pointer flex items-center gap-3 group"
                      >
                        <span className="text-sm flex-shrink-0">{issueTypeIcons[issue.type] ?? '📋'}</span>
                        <span className="text-xs text-gray-400 font-medium w-20 flex-shrink-0">{issue.key}</span>
                        <span className="text-sm text-gray-800 flex-1 truncate group-hover:text-[#0052CC]">{issue.title}</span>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div className={`w-2 h-2 rounded-full ${priorityDot[issue.priority] ?? 'bg-gray-300'}`} title={issue.priority} />
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            issue.status === 'done' ? 'bg-green-100 text-green-700'
                            : issue.status === 'in-progress' ? 'bg-blue-100 text-blue-700'
                            : issue.status === 'in-review' ? 'bg-purple-100 text-purple-700'
                            : 'bg-gray-100 text-gray-600'
                          }`}>
                            {issue.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Backlog Issues */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Backlog ({backlogIssues.length})</h3>
        </div>
        {backlogIssues.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">
            No backlog issues. Click "Create Issue" to get started.
          </p>
        ) : (
          <div className="divide-y divide-gray-50">
            {backlogIssues.map(issue => (
              <div
                key={issue.id}
                onClick={() => setSelectedIssue(issue)}
                className="px-4 py-2.5 hover:bg-gray-50 cursor-pointer flex items-center gap-3 group"
              >
                <span className="text-sm flex-shrink-0">{issueTypeIcons[issue.type] ?? '📋'}</span>
                <span className="text-xs text-gray-400 font-medium w-20 flex-shrink-0">{issue.key}</span>
                <span className="text-sm text-gray-800 flex-1 truncate group-hover:text-[#0052CC]">{issue.title}</span>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className={`w-2 h-2 rounded-full ${priorityDot[issue.priority] ?? 'bg-gray-300'}`} title={issue.priority} />
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{issue.type}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {isCreateSprintOpen && (
        <CreateSprintModal
          isOpen={isCreateSprintOpen}
          onClose={() => setIsCreateSprintOpen(false)}
          onSubmit={handleCreateSprintSubmit}
        />
      )}

      {isCreateIssueOpen && (
        <CreateIssueModal
          isOpen={isCreateIssueOpen}
          onClose={() => setIsCreateIssueOpen(false)}
          onSubmit={handleCreateIssueSubmit}
        />
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