import React from 'react';
import { useApp } from '../../context/AppContext';

export const TeamView: React.FC = () => {
  const { users } = useApp();
  
  return (
    <div>
      <h2 className="text-2xl font-semibold text-[#172B4D] mb-6">Team Members</h2>
      <div className="grid grid-cols-2 gap-4">
        {users.map(user => (
          <div key={user.id} className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-medium">
                {user.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h3 className="font-semibold">{user.name}</h3>
                <p className="text-sm text-gray-600">{user.email}</p>
                <p className="text-xs text-gray-500 capitalize">{user.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
