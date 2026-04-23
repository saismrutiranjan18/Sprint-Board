import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { IssueDetailModal } from '../IssueDetailModal';
import { Issue } from '../../types';
import { Calendar, Target, CheckCircle2, Clock, ChevronDown, ChevronRight } from 'lucide-react';

export const SprintsView: React.FC = () => {
  const { sprints, issues, currentUser, startSprint, completeSprint } = useApp();
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [collapsedSprints, setCollapsedSprints] = useState<Set<string>>(new Set());

  const isAdmin = currentUser?.role === 'admin';

  const toggleSprint = (sprintId: string) => {
    setCollapsedSprints(prev => {
      const next = new Set(prev);
      next.has(sprintId) ? next.delete(sprintId) : next.add(sprintId);
      return next;
    });
  };

  const statusOrder = { active: 0, planned: 1, completed: 2 };
  const sortedSprints = [...sprints].sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);

  const issueTypeIcons: Record<string, string> = {
    story: '📖', task: '✅', bug: '🐛', epic: '🎯',
  };

  const statusBadge: Record<string, string> = {
    active: 'bg-green-100 text-green-700 border-green-200',
    planned: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    completed: 'bg-gray-100 text-gray-600 border-gray-200',
  };

  const issueStatusColors: Record<string, string> = {
    done: 'bg-green-500',
    'in-progress': 'bg-blue-500',
    'in-review': 'bg-purple-500',
    todo: 'bg-gray-300',
    backlog: 'bg-gray-200',
  };

  if (sortedSprints.length === 0) {
    return (
      <div>
        <h2 className="text-2xl font-semibold text-[#172B4D] mb-6">Sprints</h2>
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No sprints yet</p>
          <p className="text-gray-400 text-sm mt-1">
            Go to Backlog and click "Create Sprint" to get started.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold text-[#172B4D] mb-6">Sprints</h2>
      <div className="space-y-4">
        {sortedSprints.map(sprint => {
          const sprintIssues = issues.filter(i => i.sprintId === sprint.id);
          const done = sprintIssues.filter(i => i.status === 'done').length;
          const inProgress = sprintIssues.filter(i => i.status === 'in-progress').length;
          const inReview = sprintIssues.filter(i => i.status === 'in-review').length;
          const todo = sprintIssues.filter(i => i.status === 'todo').length;
          const total = sprintIssues.length;
          const progress = total > 0 ? Math.round((done / total) * 100) : 0;
          const isCollapsed = collapsedSprints.has(sprint.id);

          return (
            <div key={sprint.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {/* Sprint Header */}
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <button
                      onClick={() => toggleSprint(sprint.id)}
                      className="mt-0.5 text-gray-400 hover:text-gray-600 flex-shrink-0"
                    >
                      {isCollapsed
                        ? <ChevronRight className="w-4 h-4" />
                        : <ChevronDown className="w-4 h-4" />}
                    </button>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-semibold text-gray-900 text-lg">{sprint.name}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusBadge[sprint.status]}`}>
                          {sprint.status.charAt(0).toUpperCase() + sprint.status.slice(1)}
                        </span>
                      </div>
                      {sprint.goal && (
                        <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-2">
                          <Target className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="truncate">{sprint.goal}</span>
                        </div>
                      )}
                      {(sprint.startDate || sprint.endDate) && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                          <Clock className="w-3 h-3" />
                          {sprint.startDate && (
                            <span>{new Date(sprint.startDate).toLocaleDateString()}</span>
                          )}
                          {sprint.startDate && sprint.endDate && <span>→</span>}
                          {sprint.endDate && (
                            <span>{new Date(sprint.endDate).toLocaleDateString()}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {sprint.status === 'planned' && isAdmin && (
                      <button
                        onClick={() => startSprint(sprint.id)}
                        className="px-4 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                      >
                        Start Sprint
                      </button>
                    )}
                    {sprint.status === 'active' && isAdmin && (
                      <button
                        onClick={() => completeSprint(sprint.id)}
                        className="px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        Complete Sprint
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                {total > 0 && (
                  <div className="mt-4 ml-7">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                      <span>{done}/{total} issues completed</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden flex">
                      {done > 0 && (
                        <div
                          className="bg-green-500 h-full transition-all"
                          style={{ width: `${(done / total) * 100}%` }}
                        />
                      )}
                      {inReview > 0 && (
                        <div
                          className="bg-purple-400 h-full transition-all"
                          style={{ width: `${(inReview / total) * 100}%` }}
                        />
                      )}
                      {inProgress > 0 && (
                        <div
                          className="bg-blue-400 h-full transition-all"
                          style={{ width: `${(inProgress / total) * 100}%` }}
                        />
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      {done > 0 && <span className="flex items-center gap-1"><span className="w-2 h-2 bg-green-500 rounded-full inline-block" />{done} Done</span>}
                      {inReview > 0 && <span className="flex items-center gap-1"><span className="w-2 h-2 bg-purple-400 rounded-full inline-block" />{inReview} In Review</span>}
                      {inProgress > 0 && <span className="flex items-center gap-1"><span className="w-2 h-2 bg-blue-400 rounded-full inline-block" />{inProgress} In Progress</span>}
                      {todo > 0 && <span className="flex items-center gap-1"><span className="w-2 h-2 bg-gray-300 rounded-full inline-block" />{todo} To Do</span>}
                    </div>
                  </div>
                )}
              </div>

              {/* Issue List */}
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
                          className="px-5 py-2.5 hover:bg-gray-50 cursor-pointer flex items-center gap-3 group"
                        >
                          <span className="text-sm flex-shrink-0">{issueTypeIcons[issue.type] ?? '📋'}</span>
                          <span className="text-xs text-gray-400 font-medium w-20 flex-shrink-0">{issue.key}</span>
                          <span className="text-sm text-gray-800 flex-1 truncate group-hover:text-[#0052CC]">{issue.title}</span>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {issue.status === 'done' && (
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                            )}
                            <div className={`w-2 h-2 rounded-full ${issueStatusColors[issue.status] ?? 'bg-gray-200'}`} title={issue.status} />
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