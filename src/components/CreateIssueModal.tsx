import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { IssueType, IssuePriority, IssueStatus } from '../types';
import { X } from 'lucide-react';

interface CreateIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (issueData: {
    key: string;
    title: string;
    description: string;
    type: IssueType;
    priority: IssuePriority;
    status: IssueStatus;
    assigneeId?: string;
    sprintId?: string;
    labels: string[];
    estimatedHours?: number;
  }) => void;
}

const EMPTY_FORM = {
  type: 'task' as IssueType,
  priority: 'medium' as IssuePriority,
  status: 'todo' as IssueStatus,
  title: '',
  description: '',
  assigneeId: '',
  labels: '',
  estimatedHours: '',
};

export const CreateIssueModal: React.FC<CreateIssueModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const { project, users, issues, sprints } = useApp();
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [titleError, setTitleError] = useState(false);

  if (!isOpen) return null;

  /** Generate next key by finding the highest existing key number */
  const nextKey = (): string => {
    const prefix = `${project.key}-`;
    const maxNum = issues.reduce((max, i) => {
      if (!i.key.startsWith(prefix)) return max;
      const num = parseInt(i.key.slice(prefix.length), 10);
      return isNaN(num) ? max : Math.max(max, num);
    }, 0);
    return `${prefix}${maxNum + 1}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) { setTitleError(true); return; }

    const activeSprint = sprints.find(s => s.status === 'active');
    const sprintId = formData.status !== 'backlog' && activeSprint ? activeSprint.id : undefined;

    onSubmit({
      key: nextKey(),
      title: formData.title.trim(),
      description: formData.description.trim(),
      type: formData.type,
      priority: formData.priority,
      status: formData.status,
      assigneeId: formData.assigneeId || undefined,
      sprintId,
      labels: formData.labels
        ? formData.labels.split(',').map(l => l.trim()).filter(Boolean)
        : [],
      estimatedHours: formData.estimatedHours ? parseFloat(formData.estimatedHours) : undefined,
    });

    setFormData(EMPTY_FORM);
    setTitleError(false);
    onClose();
  };

  const handleClose = () => {
    setFormData(EMPTY_FORM);
    setTitleError(false);
    onClose();
  };

  const typeIcons: Record<IssueType, string> = {
    story: '📖', task: '✅', bug: '🐛', epic: '🎯',
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Create Issue</h2>
          <button onClick={handleClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Type + Priority row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Issue Type *</label>
              <select
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value as IssueType })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {(Object.keys(typeIcons) as IssueType[]).map(t => (
                  <option key={t} value={t}>{typeIcons[t]} {t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Priority *</label>
              <select
                value={formData.priority}
                onChange={e => setFormData({ ...formData, priority: e.target.value as IssuePriority })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {['lowest', 'low', 'medium', 'high', 'highest'].map(p => (
                  <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={e => { setFormData({ ...formData, title: e.target.value }); setTitleError(false); }}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                titleError ? 'border-red-400 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="Enter a brief summary…"
              autoFocus
            />
            {titleError && <p className="text-xs text-red-500 mt-1">Title is required</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={4}
              placeholder="Add a detailed description…"
            />
          </div>

          {/* Status + Assignee */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Status *</label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as IssueStatus })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="backlog">Backlog</option>
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="in-review">In Review</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Assignee</label>
              <select
                value={formData.assigneeId}
                onChange={e => setFormData({ ...formData, assigneeId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Unassigned</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Labels + Hours */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Labels</label>
              <input
                type="text"
                value={formData.labels}
                onChange={e => setFormData({ ...formData, labels: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="frontend, urgent (comma-separated)"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Estimated Hours</label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={formData.estimatedHours}
                onChange={e => setFormData({ ...formData, estimatedHours: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 justify-end pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-[#0052CC] text-white rounded-lg hover:bg-[#0065FF] transition-colors font-medium"
            >
              Create Issue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
