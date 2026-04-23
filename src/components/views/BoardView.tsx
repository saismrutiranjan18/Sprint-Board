import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { IssueStatus, Issue } from '../../types';
import { DndContext, DragEndEvent, DragStartEvent, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { IssueCard } from '../IssueCard';
import { DroppableColumn } from '../DroppableColumn';
import { IssueDetailModal } from '../IssueDetailModal';

export const BoardView: React.FC = () => {
  const { issues, sprints, updateIssue, users } = useApp();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  // Add activation distance so normal clicks are not treated as drags
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const activeSprint = sprints.find(s => s.status === 'active');

  const statuses: { id: IssueStatus; label: string }[] = [
    { id: 'todo', label: 'TO DO' },
    { id: 'in-progress', label: 'IN PROGRESS' },
    { id: 'in-review', label: 'IN REVIEW' },
    { id: 'done', label: 'DONE ✓' },
  ];

  const getIssuesByStatus = (status: IssueStatus) =>
    issues.filter(
      issue =>
        issue.status === status &&
        (!activeSprint || issue.sprintId === activeSprint.id)
    );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const issueId = active.id as string;
    const newStatus = over.id as IssueStatus;
    const currentIssue = issues.find(i => i.id === issueId);

    // Only update if status actually changed
    if (currentIssue && currentIssue.status !== newStatus) {
      updateIssue(issueId, { status: newStatus });
    }
  };

  const activeIssue = activeId ? issues.find(i => i.id === activeId) : null;

  return (
    <div className="h-full">
      {activeSprint ? (
        <div className="mb-4">
          <div className="text-sm text-gray-600">
            Sprint: <span className="font-medium text-gray-900">{activeSprint.name}</span>
          </div>
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
                    />
                  ))}
                </div>
              </DroppableColumn>
            );
          })}
        </div>

        <DragOverlay>
          {activeIssue && (
            <div className="opacity-80 rotate-2">
              <IssueCard
                issue={activeIssue}
                onClick={() => {}}
                assignee={users.find(u => u.id === activeIssue.assigneeId)}
              />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* Issue Detail Modal */}
      {selectedIssue && (
        <IssueDetailModal
          issue={selectedIssue}
          onClose={() => setSelectedIssue(null)}
        />
      )}
    </div>
  );
};