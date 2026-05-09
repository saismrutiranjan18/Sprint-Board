import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { InviteMemberModal } from '../InviteMemberModal';
import { Plus, Save, Info, Mail } from 'lucide-react';
import { UserRole } from '../../types';

export const SettingsView: React.FC = () => {
  const { project, currentUser, invitations, inviteUser, logout, updateProject } = useApp();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [projectName, setProjectName] = useState(project.name);
  const [projectDesc, setProjectDesc] = useState(project.description);
  const [saved, setSaved] = useState(false);

  const isAdmin = currentUser?.role === 'admin';

  const handleSaveProject = () => {
    if (!projectName.trim()) return;
    updateProject({ name: projectName.trim(), description: projectDesc.trim() });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleInviteSubmit = (email: string, role: UserRole) => {
    inviteUser(email, role);
    setIsInviteModalOpen(false);
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    accepted: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-[#172B4D] mb-6">Project Settings</h2>

      <div className="space-y-6">

        {/* ── Project Details ─────────────────────────────────────── */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">Project Details</h3>
          <div className="space-y-4">

            {/* Editable: Project Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                Project Name
              </label>
              {isAdmin ? (
                <input
                  type="text"
                  value={projectName}
                  onChange={e => setProjectName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800">
                  {project.name}
                </div>
              )}
            </div>

            {/* Read-only: Project Key */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                Project Key
              </label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 font-mono flex items-center justify-between">
                <span>{project.key}</span>
                <span className="text-xs text-gray-400 font-sans">Read-only</span>
              </div>
            </div>

            {/* Editable: Description */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                Description
              </label>
              {isAdmin ? (
                <textarea
                  value={projectDesc}
                  onChange={e => setProjectDesc(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Add a project description…"
                />
              ) : (
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 min-h-[60px]">
                  {project.description || <span className="text-gray-400">No description</span>}
                </div>
              )}
            </div>

            {/* Read-only: Created */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                Created
              </label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">
                {new Date(project.createdAt).toLocaleDateString()}
              </div>
            </div>

            {/* Save button — admin only */}
            {isAdmin && (
              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={handleSaveProject}
                  disabled={!projectName.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0052CC] text-white rounded-lg hover:bg-[#0065FF] transition-colors text-sm font-medium disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
                {saved && (
                  <span className="text-sm text-green-600 font-medium">
                    Saved successfully
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Team Invitations — Admin only ──────────────────────── */}
        {isAdmin && (
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Team Invitations</h3>
              <button
                onClick={() => setIsInviteModalOpen(true)}
                className="px-4 py-2 bg-[#0052CC] text-white rounded-lg hover:bg-[#0065FF] transition-colors flex items-center gap-2 text-sm"
              >
                <Plus className="w-4 h-4" />
                Invite Member
              </button>
            </div>

            {/* Demo disclaimer */}
            <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-100 rounded-lg mb-4">
              <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-blue-700 leading-relaxed">
                <span className="font-semibold">Demo mode:</span> No actual email is sent.
                The invited user signs up using the same email address — their role is then
                automatically assigned based on this invitation.
              </div>
            </div>

            {invitations.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">
                No invitations sent yet. Invite team members to collaborate.
              </p>
            ) : (
              <div className="space-y-2">
                {invitations.map(inv => (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="font-medium text-sm text-gray-900 truncate">{inv.email}</div>
                        <div className="text-xs text-gray-500 mt-0.5 capitalize">
                          Role: {inv.role} · {new Date(inv.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ml-3 ${statusColors[inv.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {inv.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Your Account ───────────────────────────────────────── */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">Your Account</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Name</label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800">
                {currentUser?.name}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Email</label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800">
                {currentUser?.email}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Role</label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm">
                <span className={`capitalize font-medium ${currentUser?.role === 'admin' ? 'text-purple-700' : 'text-blue-700'}`}>
                  {currentUser?.role}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
            >
              Log out
            </button>
          </div>
        </div>
      </div>

      {isInviteModalOpen && (
        <InviteMemberModal
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
          onSubmit={handleInviteSubmit}
        />
      )}
    </div>
  );
};