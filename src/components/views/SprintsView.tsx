import React from 'react';
import { useApp } from '../../context/AppContext';

export const SprintsView: React.FC = () => {
  const { sprints } = useApp();
  
  return (
    <div>
      <h2 className="text-2xl font-semibold text-[#172B4D] mb-6">Sprints</h2>
      <div className="space-y-4">
        {sprints.map(sprint => (
          <div key={sprint.id} className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-lg">{sprint.name}</h3>
            <p className="text-gray-600">{sprint.goal}</p>
            <p className="text-sm text-gray-500 mt-2">Status: {sprint.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
