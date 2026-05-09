import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CreateSprintModal } from '../CreateSprintModal';
import { CreateIssueModal } from '../CreateIssueModal';
import { IssueDetailModal } from '../IssueDetailModal';
import { Issue, IssueStatus, IssueType, IssuePriority, SprintStatus } from '../../types';
import { Plus, ChevronDown, ChevronRight, ArrowRight, BookOpen, CheckSquare, Bug, Target } from 'lucide-react';

export const BacklogView: React.FC = () => {
  const {
    issues, sprints, currentUser,
    startSprint, completeSprint, addSprint, addIssue, updateIssue,
  } = useApp();

  const [isCreateSprintOpen, setIsCreateSprintOpen] = useState(false);
  const [isCreateIssueOpen, setIsCreateIssueOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [collapsedSprints, setCollapsedSprints] = useState<Set<string>>(new Set());

  const isAdmin = currentUser?.role === 'admin';

  // Issues with no sprint assignment
  const backlogIssues = issues.filter(i => !i.sprintId);

  // Sprints that can receive issues (active or planned)
  const openSprints = sprints.filter(s => s.status === 'active' || s.status === 'planned');
  const activeSprint = sprints.find(s => s.status === 'active');

  const toggleSprint = (sprintId: string) => {
    setCollapsedSprints(prev => {
      const next = new Set(prev);
      next.has(sprintId) ? next.delete(sprintId) : next.add(sprintId);
      return next;
    });
  };

  /**
   * Move a backlog issue into a sprint.
   * Sets sprintId and promotes status from 'backlog' → 'todo' if needed.
   */
  const moveToSprint = (issue: Issue, sprintId: string) => {
    updateIssue(issue.id, {
      sprintId,
      status: issue.status === 'backlog' ? 'todo' : issue.status,
    });
  };

  /**
   * Remove an issue from its sprint back to backlog.
   */
  const removeFromSprint = (issue: Issue) => {
    updateIssue(issue.id, {
      sprintId: undefined,
      status: 'backlog',
    });
  };

  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    planned: 'bg-yellow-100 text-yellow-700',
    completed: 'bg-gray-100 text-gray-600',
  };

  const issueTypeIcons: Record<IssueType, React.ReactNode> = {
    story: <BookOpen className="w-4 h-4 text-blue-600" />,
    task: <CheckSquare className="w-4 h-4 text-green-600" />,
    bug: <Bug className="w-4 h-4 text-red-600" />,
    epic: <Target className="w-4 h-4 text-purple-600" />,
  };

  const priorityDot: Record<IssuePriority, string> = {
    lowest: 'bg-gray-300',
    low: 'bg-blue-400',
    medium: 'bg-yellow-400',
    high: 'bg-orange-500',
    highest: 'bg-red-500',
  };

  const issueStatusBadge = (status: IssueStatus): string => {
    const map: Record<IssueStatus, string> = {
      done: 'bg-green-100 text-green-700',
      'in-progress': 'bg-blue-100 text-blue-700',
      'in-review': 'bg-purple-100 text-purple-700',
      todo: 'bg-gray-100 text-gray-600',
      backlog: 'bg-gray-100 text-gray-500',
    };
    return map[status] ?? 'bg-gray-100 text-gray-600';
  };

  const handleCreateSprintSubmit = (data: {
    name: string; goal: string; startDate: string; endDate: string; status: SprintStatus;
  }) => { addSprint(data); setIsCreateSprintOpen(false); };

  const handleCreateIssueSubmit = (issueData: {
    key: string; title: string; description: string;
    type: IssueType; priority: IssuePriority; status: IssueStatus;
    assigneeId?: string; sprintId?: string; labels: string[]; estimatedHours?: number;
  }) => {
    if (!currentUser) return;
    addIssue({
      ...issueData,
      reporterId: currentUser.id,
      comments: [], workLogs: [], links: [], attachments: [],
    });
    setIsCreateIssueOpen(false);
  };

  return (
    <div className="space-y-6">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-[#172B4D]">Backlog</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setIsCreateIssueOpen(true)}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" /> Create Issue
          </button>
          {isAdmin && (
            <button
              onClick={() => setIsCreateSprintOpen(true)}
              className="px-4 py-2 bg-[#0052CC] text-white rounded-lg hover:bg-[#0065FF] transition-colors flex items-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" /> Create Sprint
            </button>
          )}
        </div>
      </div>

      {/* Sprint sections */}
      {sprints.map(sprint => {
        const sprintIssues = issues.filter(i => i.sprintId === sprint.id);
        const completedCount = sprintIssues.filter(i => i.status === 'done').length;
        const isCollapsed = collapsedSprints.has(sprint.id);
        const canReceiveIssues = sprint.status === 'active' || sprint.status === 'planned';

        return (
          <div key={sprint.id} className="bg-white rounded-lg border border-gray-200">
            {/* Sprint header */}
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
                <span className="text-xs text-gray-500">{completedCount}/{sprintIssues.length} done</span>
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

            {/* Sprint issue list */}
            {!isCollapsed && (
              <div className="border-t border-gray-100">
                {sprintIssues.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-6">
                    No issues in this sprint yet.{' '}
                    {canReceiveIssues && (
                      <span className="text-[#0052CC]">
                        Move issues from the Backlog below using the arrow button.
                      </span>
                    )}
                  </p>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {sprintIssues.map(issue => (
                      <SprintIssueRow
                        key={issue.id}
                        issue={issue}
                        typeIcon={issueTypeIcons[issue.type]}
                        priorityDot={priorityDot[issue.priority]}
                        statusBadge={issueStatusBadge(issue.status)}
                        isAdmin={isAdmin}
                        onOpen={() => setSelectedIssue(issue)}
                        onRemoveFromSprint={() => removeFromSprint(issue)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* ── Backlog section ───────────────────────────────────────────── */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Backlog ({backlogIssues.length})</h3>
          {openSprints.length > 0 && backlogIssues.length > 0 && (
            <p className="text-xs text-gray-400">
              Hover an issue to move it to a sprint
            </p>
          )}
        </div>

        {backlogIssues.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">
            No backlog issues. Click "Create Issue" to get started.
          </p>
        ) : (
          <div className="divide-y divide-gray-50">
            {backlogIssues.map(issue => (
              <BacklogIssueRow
                key={issue.id}
                issue={issue}
                typeIcon={issueTypeIcons[issue.type]}
                priorityDot={priorityDot[issue.priority]}
                openSprints={openSprints}
                activeSprint={activeSprint}
                onOpen={() => setSelectedIssue(issue)}
                onMoveToSprint={moveToSprint}
              />
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
        <IssueDetailModal issue={selectedIssue} onClose={() => setSelectedIssue(null)} />
      )}
    </div>
  );
};

// ── Sprint issue row (with "Remove from sprint" on hover) ────────────────────

interface SprintIssueRowProps {
  issue: Issue;
  typeIcon: React.ReactNode;
  priorityDot: string;
  statusBadge: string;
  isAdmin: boolean;
  onOpen: () => void;
  onRemoveFromSprint: () => void;
}

const SprintIssueRow: React.FC<SprintIssueRowProps> = ({
  issue, typeIcon, priorityDot, statusBadge, isAdmin, onOpen, onRemoveFromSprint,
}) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="px-4 py-2.5 hover:bg-gray-50 flex items-center gap-3 group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span className="text-sm flex-shrink-0">{typeIcon}</span>
      <span className="text-xs text-gray-400 font-medium w-20 flex-shrink-0">{issue.key}</span>

      <span
        className="text-sm text-gray-800 flex-1 truncate group-hover:text-[#0052CC] cursor-pointer"
        onClick={onOpen}
      >
        {issue.title}
      </span>

      <div className="flex items-center gap-2 flex-shrink-0">
        <div className={`w-2 h-2 rounded-full ${priorityDot}`} title={issue.priority} />
        <span className={`text-xs px-2 py-0.5 rounded-full ${statusBadge}`}>{issue.status}</span>

        {/* Remove from sprint button — admin only, shows on hover */}
        {isAdmin && hovered && (
          <button
            onClick={e => { e.stopPropagation(); onRemoveFromSprint(); }}
            title="Move back to Backlog"
            className="ml-1 px-2 py-0.5 text-xs border border-gray-300 text-gray-500 rounded hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-colors"
          >
            ← Backlog
          </button>
        )}
      </div>
    </div>
  );
};

// ── Backlog issue row (with "Add to Sprint" on hover) ────────────────────────

interface BacklogIssueRowProps {
  issue: Issue;
  typeIcon: React.ReactNode;
  priorityDot: string;
  openSprints: Array<{ id: string; name: string; status: string }>;
  activeSprint: { id: string; name: string } | undefined;
  onOpen: () => void;
  onMoveToSprint: (issue: Issue, sprintId: string) => void;
}

const BacklogIssueRow: React.FC<BacklogIssueRowProps> = ({
  issue, typeIcon, priorityDot, openSprints, activeSprint, onOpen, onMoveToSprint,
}) => {
  const [hovered, setHovered] = useState(false);
  const [showSprintPicker, setShowSprintPicker] = useState(false);

  const handleMoveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (openSprints.length === 1) {
      // Only one option — move directly
      onMoveToSprint(issue, openSprints[0].id);
    } else {
      setShowSprintPicker(v => !v);
    }
  };

  return (
    <div
      className="px-4 py-2.5 hover:bg-gray-50 flex items-center gap-3 group relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setShowSprintPicker(false); }}
    >
      <span className="text-sm flex-shrink-0">{typeIcon}</span>
      <span className="text-xs text-gray-400 font-medium w-20 flex-shrink-0">{issue.key}</span>

      <span
        className="text-sm text-gray-800 flex-1 truncate group-hover:text-[#0052CC] cursor-pointer"
        onClick={onOpen}
      >
        {issue.title}
      </span>

      <div className="flex items-center gap-2 flex-shrink-0">
        <div className={`w-2 h-2 rounded-full ${priorityDot}`} title={issue.priority} />
        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 capitalize">
          {issue.type}
        </span>

        {/* Add to Sprint button — shows on hover when sprints exist */}
        {hovered && openSprints.length > 0 && (
          <div className="relative">
            <button
              onClick={handleMoveClick}
              title={
                openSprints.length === 1
                  ? `Move to ${openSprints[0].name}`
                  : 'Move to sprint…'
              }
              className="ml-1 flex items-center gap-1 px-2 py-0.5 text-xs bg-[#0052CC] text-white rounded hover:bg-[#0065FF] transition-colors"
            >
              <ArrowRight className="w-3 h-3" />
              {openSprints.length === 1 ? openSprints[0].name : 'Move to Sprint'}
            </button>

            {/* Sprint picker dropdown (multiple sprints) */}
            {showSprintPicker && openSprints.length > 1 && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowSprintPicker(false)}
                />
                <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden">
                  {openSprints.map(sprint => (
                    <button
                      key={sprint.id}
                      onClick={e => {
                        e.stopPropagation();
                        onMoveToSprint(issue, sprint.id);
                        setShowSprintPicker(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center justify-between"
                    >
                      <span className="truncate">{sprint.name}</span>
                      <span className={`text-xs ml-2 px-1.5 py-0.5 rounded-full flex-shrink-0 ${sprint.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                        }`}>
                        {sprint.status}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};