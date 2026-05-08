import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { IssueStatus, Issue } from '../../types';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import { IssueCard } from '../IssueCard';
import { DroppableColumn } from '../DroppableColumn';
import { IssueDetailModal } from '../IssueDetailModal';
import { Info, ShieldCheck } from 'lucide-react';

export const BoardView: React.FC = () => {
  const { issues, sprints, updateIssue, users, currentUser } = useApp();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  const isAdmin = currentUser?.role === 'admin';

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const activeSprint = sprints.find(s => s.status === 'active');

  const statuses: { id: IssueStatus; label: string }[] = [
    { id: 'todo',        label: 'TO DO' },
    { id: 'in-progress', label: 'IN PROGRESS' },
    { id: 'in-review',   label: 'IN REVIEW' },
    { id: 'done',        label: 'DONE' },
  ];

  const getIssuesByStatus = (status: IssueStatus) =>
    issues.filter(
      i =>
        i.status === status &&
        (!activeSprint || i.sprintId === activeSprint.id)
    );

  /**
   * Option B permission check:
   * A user may drag a card only if they are:
   *   (a) an admin, OR
   *   (b) the assignee of that specific issue
   */
  const canDragIssue = (issue: Issue): boolean => {
    if (!currentUser) return false;
    if (isAdmin) return true;
    return issue.assigneeId === currentUser.id;
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const issueId  = active.id as string;
    const newStatus = over.id as IssueStatus;
    const current  = issues.find(i => i.id === issueId);

    // Double-check permission server-side style (in case disabled prop was bypassed)
    if (!current || !canDragIssue(current)) return;

    if (current.status !== newStatus) {
      updateIssue(issueId, { status: newStatus });
    }
  };

  const activeIssue = activeId ? issues.find(i => i.id === activeId) : null;

  // Count how many cards the current member can drag (for the info banner)
  const draggableCount = isAdmin
    ? null
    : issues.filter(
        i =>
          i.assigneeId === currentUser?.id &&
          i.sprintId === activeSprint?.id
      ).length;

  return (
    <div className="h-full">
      {/* Sprint label */}
      {activeSprint ? (
        <div className="mb-3 flex items-center justify-between flex-wrap gap-2">
          <p className="text-sm text-gray-600">
            Active sprint:{' '}
            <span className="font-semibold text-gray-900">{activeSprint.name}</span>
          </p>

          {/* Permission banner for non-admin members */}
          {!isAdmin && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-700">
              <Info className="w-3.5 h-3.5 flex-shrink-0" />
              You can move{' '}
              <span className="font-semibold">
                {draggableCount === 0
                  ? 'no cards'
                  : `${draggableCount} card${draggableCount !== 1 ? 's' : ''}`}
              </span>
              &nbsp;assigned to you.
            </div>
          )}

          {/* Admin badge */}
          {isAdmin && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 border border-purple-100 rounded-lg text-xs text-purple-700">
              <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
              Admin — full drag access
            </div>
          )}
        </div>
      ) : (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            No active sprint. Go to Backlog to start a sprint.
          </p>
        </div>
      )}

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {statuses.map(status => {
            const statusIssues = getIssuesByStatus(status.id);
            return (
              <DroppableColumn
                key={status.id}
                id={status.id}
                title={status.label}
                count={statusIssues.length}
              >
                <div className="space-y-3">
                  {statusIssues.map(issue => (
                    <IssueCard
                      key={issue.id}
                      issue={issue}
                      onClick={() => setSelectedIssue(issue)}
                      assignee={users.find(u => u.id === issue.assigneeId)}
                      canDrag={canDragIssue(issue)}
                    />
                  ))}
                </div>
              </DroppableColumn>
            );
          })}
        </div>

        {/* Ghost card shown while dragging */}
        <DragOverlay>
          {activeIssue && (
            <div className="opacity-80 rotate-1 scale-105">
              <IssueCard
                issue={activeIssue}
                onClick={() => {}}
                assignee={users.find(u => u.id === activeIssue.assigneeId)}
                canDrag={true}
              />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {selectedIssue && (
        <IssueDetailModal
          issue={selectedIssue}
          onClose={() => setSelectedIssue(null)}
        />
      )}
    </div>
  );
};