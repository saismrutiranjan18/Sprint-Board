import React from 'react';
import { useApp } from '../../context/AppContext';
import { Activity } from 'lucide-react';

const activityTypeColors: Record<string, string> = {
  issue_created: 'bg-green-100 text-green-700',
  issue_updated: 'bg-blue-100 text-blue-700',
  issue_assigned: 'bg-purple-100 text-purple-700',
  comment_added: 'bg-gray-100 text-gray-700',
  status_changed: 'bg-yellow-100 text-yellow-700',
  sprint_created: 'bg-indigo-100 text-indigo-700',
  sprint_started: 'bg-green-100 text-green-700',
  sprint_completed: 'bg-gray-100 text-gray-600',
  user_invited: 'bg-pink-100 text-pink-700',
  work_logged: 'bg-orange-100 text-orange-700',
  file_attached: 'bg-cyan-100 text-cyan-700',
};

const activityTypeEmoji: Record<string, string> = {
  issue_created: '✅',
  issue_updated: '✏️',
  issue_assigned: '👤',
  comment_added: '💬',
  status_changed: '🔄',
  sprint_created: '📅',
  sprint_started: '🚀',
  sprint_completed: '🏁',
  user_invited: '📧',
  work_logged: '⏱️',
  file_attached: '📎',
};

export const ActivityView: React.FC = () => {
  const { activities, users } = useApp();

  return (
    <div>
      <h2 className="text-2xl font-semibold text-[#172B4D] mb-6">Activity Feed</h2>

      {activities.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No activity yet</p>
          <p className="text-gray-400 text-sm mt-1">
            Actions like creating issues, logging work, and commenting will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {activities.slice(0, 50).map(activity => {
            const user = users.find(u => u.id === activity.userId);
            const colorClass = activityTypeColors[activity.type] ?? 'bg-gray-100 text-gray-600';
            const emoji = activityTypeEmoji[activity.type] ?? '📋';

            return (
              <div key={activity.id} className="bg-white p-4 rounded-lg border border-gray-200 flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                  {user?.name.split(' ').map(n => n[0]).join('') ?? '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm text-gray-900">{user?.name ?? 'Unknown'}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${colorClass}`}>
                      {emoji} {activity.type.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mt-0.5">{activity.details}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(activity.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};