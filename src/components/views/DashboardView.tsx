import React from 'react';
import { useApp } from '../../context/AppContext';

export const DashboardView: React.FC = () => {
  const { issues, sprints } = useApp();
  
  const completed = issues.filter(i => i.status === 'done').length;
  const inProgress = issues.filter(i => i.status === 'in-progress').length;
  const todo = issues.filter(i => i.status === 'todo').length;
  
  return (
    <div>
      <h2 className="text-2xl font-semibold text-[#172B4D] mb-6">Dashboard</h2>
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-3xl font-bold text-blue-600">{todo}</div>
          <div className="text-gray-600">To Do</div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-3xl font-bold text-yellow-600">{inProgress}</div>
          <div className="text-gray-600">In Progress</div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-3xl font-bold text-green-600">{completed}</div>
          <div className="text-gray-600">Completed</div>
        </div>
      </div>
    </div>
  );
};
