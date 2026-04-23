import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CreateIssueModal } from './CreateIssueModal';
import { CreateSprintModal } from './CreateSprintModal';
import { InviteMemberModal } from './InviteMemberModal';
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { Issue, IssueStatus, User } from '../types';

type View = 'board' | 'backlog' | 'sprints' | 'team' | 'settings';

export const Dashboard: React.FC = () => {
  const {
    currentUser,
    logout,
    users,
    issues,
    sprints,
    addIssue,
    updateIssue,
    deleteIssue,
    addSprint,
    startSprint,
    completeSprint,
    inviteUser,
    project,
  } = useApp();

  const [activeView, setActiveView] = useState<View>('board');
  const [isCreateIssueOpen, setIsCreateIssueOpen] = useState(false);
  const [isCreateSprintOpen, setIsCreateSprintOpen] = useState(false);
  const [isInviteMemberOpen, setIsInviteMemberOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  const sensors = useSensors(useSensor(PointerSensor));

  const activeSprint = sprints.find(s => s.status === 'active');
  const isAdmin = currentUser?.role === 'admin';

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const issueId = active.id as string;
    const newStatus = over.id as IssueStatus;

    updateIssue(issueId, { status: newStatus });
  };

  const getIssuesByStatus = (status: IssueStatus) => {
    return issues.filter(issue => 
      issue.status === status && 
      (!activeSprint || issue.sprintId === activeSprint.id)
    );
  };

  const getUserById = (userId?: string) => {
    return users.find(u => u.id === userId);
  };

  const renderBoard = () => {
    const statuses: IssueStatus[] = ['backlog', 'todo', 'in-progress', 'in-review', 'done'];
    const statusLabels = {
      backlog: 'Backlog',
      todo: 'To Do',
      'in-progress': 'In Progress',
      'in-review': 'In Review',
      done: 'Done',
    };

    return (
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {statuses.map(status => {
            const statusIssues = getIssuesByStatus(status);
            return (
              <div key={status} className="flex-shrink-0 w-80">
                <div className="bg-gray-100 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-700">
                      {statusLabels[status]}
                    </h3>
                    <span className="bg-gray-200 px-2 py-1 rounded text-xs">
                      {statusIssues.length}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {statusIssues.map(issue => {
                      const assignee = getUserById(issue.assigneeId);
                      const typeIcons = {
                        story: '📖',
                        task: '✅',
                        bug: '🐛',
                        epic: '🎯',
                      };
                      const priorityColors = {
                        lowest: 'text-gray-400',
                        low: 'text-blue-400',
                        medium: 'text-yellow-500',
                        high: 'text-orange-500',
                        highest: 'text-red-500',
                      };

                      return (
                        <div
                          key={issue.id}
                          onClick={() => setSelectedIssue(issue)}
                          className="bg-white p-3 rounded shadow-sm hover:shadow-md cursor-pointer transition-shadow"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <span className="text-xs text-gray-500">{issue.key}</span>
                            <span className={`text-lg ${priorityColors[issue.priority]}`}>
                              ⬆
                            </span>
                          </div>
                          <p className="text-sm font-medium mb-2">{issue.title}</p>
                          <div className="flex items-center justify-between text-xs">
                            <span>{typeIcons[issue.type]}</span>
                            {assignee && (
                              <div className="flex items-center gap-1">
                                <span>{assignee.avatar}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </DndContext>
    );
  };

  const renderBacklog = () => {
    const backlogIssues = issues.filter(i => !i.sprintId || i.status === 'backlog');

    return (
      <div className="space-y-4">
        {sprints.map(sprint => {
          const sprintIssues = issues.filter(i => i.sprintId === sprint.id);
          const completedCount = sprintIssues.filter(i => i.status === 'done').length;

          return (
            <div key={sprint.id} className="bg-white rounded-lg p-4 shadow">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-lg">{sprint.name}</h3>
                  <p className="text-sm text-gray-600">{sprint.goal}</p>
                </div>
                <div className="flex gap-2">
                  {sprint.status === 'planned' && isAdmin && (
                    <button
                      onClick={() => startSprint(sprint.id)}
                      className="px-3 py-1 bg-green-600 text-white rounded text-sm"
                    >
                      Start Sprint
                    </button>
                  )}
                  {sprint.status === 'active' && isAdmin && (
                    <button
                      onClick={() => completeSprint(sprint.id)}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                    >
                      Complete Sprint
                    </button>
                  )}
                  <span
                    className={`px-3 py-1 rounded text-sm ${
                      sprint.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : sprint.status === 'completed'
                        ? 'bg-gray-100 text-gray-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {sprint.status}
                  </span>
                </div>
              </div>
              <div className="text-sm text-gray-600 mb-2">
                {completedCount} / {sprintIssues.length} issues completed
              </div>
              <div className="space-y-2">
                {sprintIssues.map(issue => (
                  <div
                    key={issue.id}
                    onClick={() => setSelectedIssue(issue)}
                    className="p-2 border rounded hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">{issue.key}</span>
                      <span className="text-sm">{issue.title}</span>
                    </div>
                    <span className="text-xs text-gray-500">{issue.status}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        <div className="bg-white rounded-lg p-4 shadow">
          <h3 className="font-bold text-lg mb-4">Backlog</h3>
          <div className="space-y-2">
            {backlogIssues.map(issue => (
              <div
                key={issue.id}
                onClick={() => setSelectedIssue(issue)}
                className="p-2 border rounded hover:bg-gray-50 cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">{issue.key}</span>
                  <span className="text-sm">{issue.title}</span>
                </div>
                <span className="text-xs text-gray-500">{issue.type}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderTeam = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map(user => {
          const userIssues = issues.filter(i => i.assigneeId === user.id);
          const completedIssues = userIssues.filter(i => i.status === 'done');

          return (
            <div key={user.id} className="bg-white rounded-lg p-6 shadow">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">{user.avatar}</span>
                <div>
                  <h3 className="font-bold">{user.name}</h3>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  <span className={`text-xs px-2 py-1 rounded ${
                    user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {user.role}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{userIssues.length}</div>
                  <div className="text-xs text-gray-600">Assigned</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{completedIssues.length}</div>
                  <div className="text-xs text-gray-600">Completed</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderSettings = () => {
    return (
      <div className="bg-white rounded-lg p-6 shadow max-w-2xl">
        <h2 className="text-2xl font-bold mb-6">Project Settings</h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Project Name</label>
            <input
              type="text"
              value={project.name}
              className="w-full px-3 py-2 border rounded-md"
              disabled
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Project Key</label>
            <input
              type="text"
              value={project.key}
              className="w-full px-3 py-2 border rounded-md"
              disabled
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={project.description}
              className="w-full px-3 py-2 border rounded-md"
              rows={3}
              disabled
            />
          </div>

          <div className="pt-4 border-t">
            <h3 className="font-semibold mb-4">Team Management</h3>
            {isAdmin && (
              <button
                onClick={() => setIsInviteMemberOpen(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Invite Team Member
              </button>
            )}
            {!isAdmin && (
              <p className="text-sm text-gray-600">
                Only admins can invite team members
              </p>
            )}
          </div>

          <div className="pt-4 border-t">
            <h3 className="font-semibold mb-2">Your Account</h3>
            <p className="text-sm text-gray-600 mb-4">
              Logged in as: {currentUser?.email}
            </p>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-indigo-900 text-white flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold">TaskFlow</h1>
          <p className="text-sm text-indigo-300">{project.name}</p>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <button
            onClick={() => setActiveView('board')}
            className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
              activeView === 'board' ? 'bg-indigo-800' : 'hover:bg-indigo-800'
            }`}
          >
            📊 Board
          </button>
          <button
            onClick={() => setActiveView('backlog')}
            className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
              activeView === 'backlog' ? 'bg-indigo-800' : 'hover:bg-indigo-800'
            }`}
          >
            📋 Backlog
          </button>
          <button
            onClick={() => setActiveView('sprints')}
            className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
              activeView === 'sprints' ? 'bg-indigo-800' : 'hover:bg-indigo-800'
            }`}
          >
            🏃 Sprints
          </button>
          <button
            onClick={() => setActiveView('team')}
            className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
              activeView === 'team' ? 'bg-indigo-800' : 'hover:bg-indigo-800'
            }`}
          >
            👥 Team
          </button>
          <button
            onClick={() => setActiveView('settings')}
            className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
              activeView === 'settings' ? 'bg-indigo-800' : 'hover:bg-indigo-800'
            }`}
          >
            ⚙️ Settings
          </button>
        </nav>

        <div className="p-4 border-t border-indigo-800">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{currentUser?.avatar}</span>
            <div className="text-sm">
              <div className="font-medium">{currentUser?.name}</div>
              <div className="text-indigo-300 text-xs">{currentUser?.role}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            {activeView === 'board' && 'Board'}
            {activeView === 'backlog' && 'Backlog'}
            {activeView === 'sprints' && 'Sprints'}
            {activeView === 'team' && 'Team'}
            {activeView === 'settings' && 'Settings'}
          </h2>
          <div className="flex gap-2">
            {(activeView === 'board' || activeView === 'backlog') && (
              <button
                onClick={() => setIsCreateIssueOpen(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Create Issue
              </button>
            )}
            {activeView === 'backlog' && isAdmin && (
              <button
                onClick={() => setIsCreateSprintOpen(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Create Sprint
              </button>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6">
          {activeView === 'board' && renderBoard()}
          {activeView === 'backlog' && renderBacklog()}
          {activeView === 'sprints' && renderBacklog()}
          {activeView === 'team' && renderTeam()}
          {activeView === 'settings' && renderSettings()}
        </div>
      </div>

      {/* Modals */}
      <CreateIssueModal
        isOpen={isCreateIssueOpen}
        onClose={() => setIsCreateIssueOpen(false)}
        onSubmit={(issueData) => {
          addIssue({
            ...issueData,
            reporterId: currentUser!.id,
            comments: [],
            workLogs: [],
            links: [],
            attachments: [],
          });
        }}
      />

      <CreateSprintModal
        isOpen={isCreateSprintOpen}
        onClose={() => setIsCreateSprintOpen(false)}
        onSubmit={addSprint}
      />

      <InviteMemberModal
        isOpen={isInviteMemberOpen}
        onClose={() => setIsInviteMemberOpen(false)}
        onSubmit={inviteUser}
      />

      {selectedIssue && (
        <IssueDetailModal
          issue={selectedIssue}
          onClose={() => setSelectedIssue(null)}
          onUpdate={updateIssue}
          onDelete={deleteIssue}
          users={users}
          currentUser={currentUser!}
        />
      )}
    </div>
  );
};

// Simple Issue Detail Modal
const IssueDetailModal: React.FC<{
  issue: Issue;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Issue>) => void;
  onDelete: (id: string) => void;
  users: User[];
  currentUser: User;
}> = ({ issue, onClose, onUpdate, onDelete, users, currentUser }) => {
  const [editedIssue, setEditedIssue] = useState(issue);
  const [comment, setComment] = useState('');

  const handleAddComment = () => {
    if (!comment.trim()) return;

    const newComment = {
      id: `comment-${Date.now()}`,
      userId: currentUser.id,
      text: comment,
      createdAt: new Date().toISOString(),
    };

    onUpdate(issue.id, {
      comments: [...issue.comments, newComment],
    });
    setComment('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold">{editedIssue.key}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={editedIssue.title}
              onChange={(e) => setEditedIssue({ ...editedIssue, title: e.target.value })}
              onBlur={() => onUpdate(issue.id, { title: editedIssue.title })}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={editedIssue.description}
              onChange={(e) => setEditedIssue({ ...editedIssue, description: e.target.value })}
              onBlur={() => onUpdate(issue.id, { description: editedIssue.description })}
              className="w-full px-3 py-2 border rounded-md"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={editedIssue.status}
                onChange={(e) => {
                  const newStatus = e.target.value as IssueStatus;
                  setEditedIssue({ ...editedIssue, status: newStatus });
                  onUpdate(issue.id, { status: newStatus });
                }}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="backlog">Backlog</option>
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="in-review">In Review</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Assignee</label>
              <select
                value={editedIssue.assigneeId || ''}
                onChange={(e) => {
                  const assigneeId = e.target.value || undefined;
                  setEditedIssue({ ...editedIssue, assigneeId });
                  onUpdate(issue.id, { assigneeId });
                }}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Unassigned</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Comments</h3>
            <div className="space-y-2 mb-4">
              {issue.comments.map(c => {
                const author = users.find(u => u.id === c.userId);
                return (
                  <div key={c.id} className="bg-gray-50 p-3 rounded">
                    <div className="flex items-center gap-2 mb-1">
                      <span>{author?.avatar}</span>
                      <span className="font-medium text-sm">{author?.name}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(c.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm">{c.text}</p>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                placeholder="Add a comment..."
                className="flex-1 px-3 py-2 border rounded-md"
              />
              <button
                onClick={handleAddComment}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add
              </button>
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-4 border-t">
            <button
              onClick={() => {
                if (confirm('Are you sure you want to delete this issue?')) {
                  onDelete(issue.id);
                  onClose();
                }
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Delete
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
