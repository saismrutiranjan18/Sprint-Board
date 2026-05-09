import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Activity,
  CheckCircle2,
  Pencil,
  UserPlus,
  MessageSquare,
  RefreshCw,
  CalendarDays,
  Rocket,
  Flag,
  Mail,
  Timer,
  Paperclip,
} from 'lucide-react';

const activityTypeStyles: Record<
  string,
  {
    color: string;
    icon: React.ReactNode;
    label: string;
  }
> = {
  issue_created: {
    color: 'bg-green-100 text-green-700',
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    label: 'Issue Created',
  },
  issue_updated: {
    color: 'bg-blue-100 text-blue-700',
    icon: <Pencil className="w-3.5 h-3.5" />,
    label: 'Issue Updated',
  },
  issue_assigned: {
    color: 'bg-purple-100 text-purple-700',
    icon: <UserPlus className="w-3.5 h-3.5" />,
    label: 'Issue Assigned',
  },
  comment_added: {
    color: 'bg-gray-100 text-gray-700',
    icon: <MessageSquare className="w-3.5 h-3.5" />,
    label: 'Comment Added',
  },
  status_changed: {
    color: 'bg-yellow-100 text-yellow-700',
    icon: <RefreshCw className="w-3.5 h-3.5" />,
    label: 'Status Changed',
  },
  sprint_created: {
    color: 'bg-indigo-100 text-indigo-700',
    icon: <CalendarDays className="w-3.5 h-3.5" />,
    label: 'Sprint Created',
  },
  sprint_started: {
    color: 'bg-green-100 text-green-700',
    icon: <Rocket className="w-3.5 h-3.5" />,
    label: 'Sprint Started',
  },
  sprint_completed: {
    color: 'bg-gray-100 text-gray-700',
    icon: <Flag className="w-3.5 h-3.5" />,
    label: 'Sprint Completed',
  },
  user_invited: {
    color: 'bg-pink-100 text-pink-700',
    icon: <Mail className="w-3.5 h-3.5" />,
    label: 'User Invited',
  },
  work_logged: {
    color: 'bg-orange-100 text-orange-700',
    icon: <Timer className="w-3.5 h-3.5" />,
    label: 'Work Logged',
  },
  file_attached: {
    color: 'bg-cyan-100 text-cyan-700',
    icon: <Paperclip className="w-3.5 h-3.5" />,
    label: 'File Attached',
  },
};

export const ActivityView: React.FC = () => {
  const { activities, users } = useApp();

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Activity className="w-6 h-6 text-[#0052CC]" />
        <h2 className="text-2xl font-semibold text-[#172B4D]">
          Activity Feed
        </h2>
      </div>

      {activities.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
          <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />

          <p className="text-gray-600 font-medium text-lg">
            No activity yet
          </p>

          <p className="text-gray-400 text-sm mt-1">
            Actions like creating issues, logging work, and commenting
            will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.slice(0, 50).map(activity => {
            const user = users.find(u => u.id === activity.userId);

            const activityConfig =
              activityTypeStyles[activity.type] ?? {
                color: 'bg-gray-100 text-gray-700',
                icon: <Activity className="w-3.5 h-3.5" />,
                label: 'Activity',
              };

            return (
              <div
                key={activity.id}
                className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 flex items-start gap-4"
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                  {user?.name
                    .split(' ')
                    .map(n => n[0])
                    .join('') ?? '?'}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-gray-900">
                      {user?.name ?? 'Unknown User'}
                    </span>

                    <span
                      className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${activityConfig.color}`}
                    >
                      {activityConfig.icon}
                      {activityConfig.label}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                    {activity.details}
                  </p>

                  <div className="text-xs text-gray-400 mt-2">
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