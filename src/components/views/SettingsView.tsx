import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { InviteMemberModal } from '../InviteMemberModal';
import { Plus } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { project, currentUser, invitations } = useApp();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const isAdmin = currentUser?.role === 'admin';
  
  return (
    <div>
      <h2 className="text-2xl font-semibold text-[#172B4D] mb-6">Project Settings</h2>
      
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="font-semibold mb-4">Project Details</h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-600">Project Name</label>
              <div className="font-medium">{project.name}</div>
            </div>
            <div>
              <label className="text-sm text-gray-600">Project Key</label>
              <div className="font-medium">{project.key}</div>
            </div>
            <div>
              <label className="text-sm text-gray-600">Description</label>
              <div className="text-gray-700">{project.description}</div>
            </div>
          </div>
        </div>

        {isAdmin && (
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Team Invitations</h3>
              <button
                onClick={() => setIsInviteModalOpen(true)}
                className="px-4 py-2 bg-[#0052CC] text-white rounded-lg hover:bg-[#0065FF] transition-colors flex items-center gap-2 text-sm"
              >
                <Plus className="w-4 h-4" />
                Invite Member
              </button>
            </div>
            <div className="space-y-2">
              {invitations.map(inv => (
                <div key={inv.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">{inv.email}</div>
                    <div className="text-xs text-gray-500 capitalize">{inv.role} • {inv.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {isInviteModalOpen && (
        <InviteMemberModal
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
          onSubmit={() => setIsInviteModalOpen(false)}
        />
      )}
    </div>
  );
};
