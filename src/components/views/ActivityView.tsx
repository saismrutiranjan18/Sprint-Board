import React from 'react';
import { useApp } from '../../context/AppContext';

export const ActivityView: React.FC = () => {
  const { activities, users } = useApp();
  
  return (
    <div>
      <h2 className="text-2xl font-semibold text-[#172B4D] mb-6">Activity Feed</h2>
      <div className="space-y-3">
        {activities.slice(0, 50).map(activity => {
          const user = users.find(u => u.id === activity.userId);
          return (
            <div key={activity.id} className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-xs font-medium">
                  {user?.name.split(' ').map(n => n[0]).join('') || '?'}
                </div>
                <div className="flex-1">
                  <div className="text-sm">
                    <span className="font-medium">{user?.name}</span>
                    {' '}{activity.details}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(activity.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
