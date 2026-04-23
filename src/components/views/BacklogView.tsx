import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CreateSprintModal } from '../CreateSprintModal';
import { Plus } from 'lucide-react';

export const BacklogView: React.FC = () => {
  const { issues, sprints, currentUser, startSprint } = useApp();
  const [isCreateSprintOpen, setIsCreateSprintOpen] = useState(false);

  const backlogIssues = issues.filter(i => i.status === 'backlog' && !i.sprintId);
  const plannedSprints = sprints.filter(s => s.status === 'planned');
  const isAdmin = currentUser?.role === 'admin';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-[#172B4D]">Backlog</h2>
        {isAdmin && (
          <button
            onClick={() => setIsCreateSprintOpen(true)}
            className="px-4 py-2 bg-[#0052CC] text-white rounded-lg hover:bg-[#0065FF] transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Sprint
          </button>
        )}
      </div>

      {/* Planned Sprints */}
      {plannedSprints.map(sprint => {
        const sprintIssues = issues.filter(i => i.sprintId === sprint.id);
        return (
          <div key={sprint.id} className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold text-gray-900">{sprint.name}</h3>
                <p className="text-sm text-gray-600">{sprint.goal}</p>
              </div>
              {isAdmin && (
                <button
                  onClick={() => startSprint(sprint.id)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  Start Sprint
                </button>
              )}
            </div>
            <div className="text-sm text-gray-500">{sprintIssues.length} issues</div>
          </div>
        );
      })}

      {/* Backlog Issues */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Backlog ({backlogIssues.length})</h3>
        <div className="space-y-2">
          {backlogIssues.map(issue => (
            <div key={issue.id} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 font-medium">{issue.key}</span>
                <span className="text-sm text-gray-900">{issue.title}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isCreateSprintOpen && (
        <CreateSprintModal
          isOpen={isCreateSprintOpen}
          onClose={() => setIsCreateSprintOpen(false)}
          onSubmit={() => setIsCreateSprintOpen(false)}
        />
      )}
    </div>
  );
};
