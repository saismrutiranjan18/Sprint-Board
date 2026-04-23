import React, { useState } from 'react';
import { Issue, IssueStatus, IssuePriority, IssueType, User } from '../types';
import { useApp } from '../context/AppContext';
import { X, Clock, MessageSquare, Link2, Paperclip, Trash2, Plus } from 'lucide-react';

interface IssueDetailModalProps {
  issue: Issue;
  onClose: () => void;
}

type Tab = 'details' | 'comments' | 'worklogs' | 'links' | 'attachments';

export const IssueDetailModal: React.FC<IssueDetailModalProps> = ({ issue, onClose }) => {
  const { updateIssue, deleteIssue, addComment, addWorkLog, addIssueLink, removeIssueLink,
    addAttachment, removeAttachment, users, currentUser, issues } = useApp();

  const [activeTab, setActiveTab] = useState<Tab>('details');
  const [editedIssue, setEditedIssue] = useState<Issue>({ ...issue });
  const [comment, setComment] = useState('');
  const [workHours, setWorkHours] = useState('');
  const [workDesc, setWorkDesc] = useState('');
  const [linkType, setLinkType] = useState<'blocks' | 'is-blocked-by' | 'relates-to' | 'duplicates' | 'is-duplicated-by'>('relates-to');
  const [linkTargetId, setLinkTargetId] = useState('');

  // Keep local state in sync with latest issue data from context
  const liveIssue = issues.find(i => i.id === issue.id) || issue;

  const handleFieldBlur = (field: keyof Issue, value: unknown) => {
    updateIssue(issue.id, { [field]: value } as Partial<Issue>);
  };

  const handleAddComment = () => {
    const text = comment.trim();
    if (!text) return;
    addComment(issue.id, text);
    setComment('');
  };

  const handleLogWork = () => {
    const hours = parseFloat(workHours);
    if (isNaN(hours) || hours <= 0) return;
    addWorkLog(issue.id, hours, workDesc.trim());
    setWorkHours('');
    setWorkDesc('');
  };

  const handleLinkIssue = () => {
    if (!linkTargetId) return;
    addIssueLink(issue.id, linkTargetId, linkType);
    setLinkTargetId('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await addAttachment(issue.id, file);
    } catch (err) {
      console.error('Failed to attach file', err);
    }
    e.target.value = '';
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this issue?')) {
      deleteIssue(issue.id);
      onClose();
    }
  };

  const getUserById = (id?: string) => users.find(u => u.id === id);

  const typeIcons: Record<IssueType, string> = { story: '📖', task: '✅', bug: '🐛', epic: '🎯' };
  const priorityColors: Record<IssuePriority, string> = {
    lowest: 'text-gray-400', low: 'text-blue-400', medium: 'text-yellow-500',
    high: 'text-orange-500', highest: 'text-red-500',
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'details', label: 'Details', icon: null },
    { id: 'comments', label: `Comments (${liveIssue.comments?.length ?? 0})`, icon: <MessageSquare className="w-3.5 h-3.5" /> },
    { id: 'worklogs', label: `Work Logs (${liveIssue.workLogs?.length ?? 0})`, icon: <Clock className="w-3.5 h-3.5" /> },
    { id: 'links', label: `Links (${liveIssue.links?.length ?? 0})`, icon: <Link2 className="w-3.5 h-3.5" /> },
    { id: 'attachments', label: `Files (${liveIssue.attachments?.length ?? 0})`, icon: <Paperclip className="w-3.5 h-3.5" /> },
  ];

  const linkableIssues = issues.filter(i => i.id !== issue.id);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-lg">{typeIcons[editedIssue.type]}</span>
            <span className="text-sm font-medium text-gray-500">{liveIssue.key}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDelete}
              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete issue"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 px-6 pt-3 border-b border-gray-200 flex-shrink-0">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-t border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-[#0052CC] text-[#0052CC]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">

          {/* ---- DETAILS TAB ---- */}
          {activeTab === 'details' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Title *</label>
                <input
                  type="text"
                  value={editedIssue.title}
                  onChange={e => setEditedIssue({ ...editedIssue, title: e.target.value })}
                  onBlur={() => handleFieldBlur('title', editedIssue.title)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Description</label>
                <textarea
                  value={editedIssue.description}
                  onChange={e => setEditedIssue({ ...editedIssue, description: e.target.value })}
                  onBlur={() => handleFieldBlur('description', editedIssue.description)}
                  rows={4}
                  placeholder="Add a description..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Status</label>
                  <select
                    value={editedIssue.status}
                    onChange={e => {
                      const s = e.target.value as IssueStatus;
                      setEditedIssue({ ...editedIssue, status: s });
                      updateIssue(issue.id, { status: s });
                    }}
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
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Priority</label>
                  <select
                    value={editedIssue.priority}
                    onChange={e => {
                      const p = e.target.value as IssuePriority;
                      setEditedIssue({ ...editedIssue, priority: p });
                      updateIssue(issue.id, { priority: p });
                    }}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${priorityColors[editedIssue.priority]}`}
                  >
                    <option value="lowest">Lowest</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="highest">Highest</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Type</label>
                  <select
                    value={editedIssue.type}
                    onChange={e => {
                      const t = e.target.value as IssueType;
                      setEditedIssue({ ...editedIssue, type: t });
                      updateIssue(issue.id, { type: t });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="task">✅ Task</option>
                    <option value="story">📖 Story</option>
                    <option value="bug">🐛 Bug</option>
                    <option value="epic">🎯 Epic</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Assignee</label>
                  <select
                    value={editedIssue.assigneeId ?? ''}
                    onChange={e => {
                      const val = e.target.value || undefined;
                      setEditedIssue({ ...editedIssue, assigneeId: val });
                      updateIssue(issue.id, { assigneeId: val });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Unassigned</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Estimated Hours</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={editedIssue.estimatedHours ?? ''}
                    onChange={e => setEditedIssue({ ...editedIssue, estimatedHours: e.target.value ? parseFloat(e.target.value) : undefined })}
                    onBlur={() => handleFieldBlur('estimatedHours', editedIssue.estimatedHours)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Labels</label>
                  <input
                    type="text"
                    value={editedIssue.labels?.join(', ') ?? ''}
                    onChange={e => setEditedIssue({ ...editedIssue, labels: e.target.value.split(',').map(l => l.trim()).filter(Boolean) })}
                    onBlur={() => handleFieldBlur('labels', editedIssue.labels)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="frontend, urgent"
                  />
                </div>
              </div>

              <div className="text-xs text-gray-400 pt-2 border-t border-gray-100">
                <span>Reporter: {getUserById(liveIssue.reporterId)?.name ?? 'Unknown'}</span>
                <span className="mx-3">·</span>
                <span>Created: {new Date(liveIssue.createdAt).toLocaleDateString()}</span>
                <span className="mx-3">·</span>
                <span>Updated: {new Date(liveIssue.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          )}

          {/* ---- COMMENTS TAB ---- */}
          {activeTab === 'comments' && (
            <div className="space-y-4">
              <div className="space-y-3">
                {(liveIssue.comments ?? []).length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-6">No comments yet. Be the first!</p>
                )}
                {(liveIssue.comments ?? []).map(c => {
                  const author = getUserById(c.userId);
                  return (
                    <div key={c.id} className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-xs font-medium">
                          {author?.name.split(' ').map(n => n[0]).join('') ?? '?'}
                        </div>
                        <span className="font-medium text-sm">{author?.name ?? 'Unknown'}</span>
                        <span className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-gray-700 ml-8">{c.text}</p>
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-2 pt-2 border-t border-gray-100">
                <input
                  type="text"
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleAddComment()}
                  placeholder="Write a comment... (Enter to submit)"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleAddComment}
                  disabled={!comment.trim()}
                  className="px-4 py-2 bg-[#0052CC] text-white rounded-lg text-sm hover:bg-[#0065FF] transition-colors disabled:opacity-50"
                >
                  Add
                </button>
              </div>
            </div>
          )}

          {/* ---- WORK LOGS TAB ---- */}
          {activeTab === 'worklogs' && (
            <div className="space-y-4">
              <div className="space-y-3">
                {(liveIssue.workLogs ?? []).length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-6">No work logged yet.</p>
                )}
                {(liveIssue.workLogs ?? []).map(wl => {
                  const author = getUserById(wl.userId);
                  return (
                    <div key={wl.id} className="bg-gray-50 p-3 rounded-lg flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-white text-xs font-medium">
                            {author?.name.split(' ').map(n => n[0]).join('') ?? '?'}
                          </div>
                          <span className="font-medium text-sm">{author?.name ?? 'Unknown'}</span>
                          <span className="text-xs text-gray-400">{new Date(wl.createdAt).toLocaleString()}</span>
                        </div>
                        {wl.description && <p className="text-sm text-gray-600 ml-8">{wl.description}</p>}
                      </div>
                      <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap ml-4">
                        {wl.timeSpent}h
                      </span>
                    </div>
                  );
                })}
                {(liveIssue.workLogs ?? []).length > 0 && (
                  <div className="text-right text-sm font-medium text-gray-600">
                    Total: {(liveIssue.workLogs ?? []).reduce((s, wl) => s + wl.timeSpent, 0)}h
                    {liveIssue.estimatedHours ? ` / ${liveIssue.estimatedHours}h estimated` : ''}
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-gray-100 space-y-2">
                <h4 className="text-xs font-semibold text-gray-500 uppercase">Log Work</h4>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0.25"
                    step="0.25"
                    value={workHours}
                    onChange={e => setWorkHours(e.target.value)}
                    placeholder="Hours"
                    className="w-28 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={workDesc}
                    onChange={e => setWorkDesc(e.target.value)}
                    placeholder="What did you work on?"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleLogWork}
                    disabled={!workHours || parseFloat(workHours) <= 0}
                    className="px-4 py-2 bg-[#0052CC] text-white rounded-lg text-sm hover:bg-[#0065FF] transition-colors disabled:opacity-50"
                  >
                    Log
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ---- LINKS TAB ---- */}
          {activeTab === 'links' && (
            <div className="space-y-4">
              <div className="space-y-2">
                {(liveIssue.links ?? []).length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-6">No linked issues.</p>
                )}
                {(liveIssue.links ?? []).map(link => {
                  const target = issues.find(i => i.id === link.targetIssueId);
                  return (
                    <div key={link.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded">{link.type}</span>
                        <span className="text-xs font-medium text-gray-500">{target?.key}</span>
                        <span className="text-sm text-gray-700">{target?.title ?? 'Unknown issue'}</span>
                      </div>
                      <button
                        onClick={() => removeIssueLink(issue.id, link.id)}
                        className="p-1 hover:bg-red-50 rounded text-red-400 hover:text-red-600 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-gray-100 space-y-2">
                <h4 className="text-xs font-semibold text-gray-500 uppercase">Add Link</h4>
                <div className="flex gap-2">
                  <select
                    value={linkType}
                    onChange={e => setLinkType(e.target.value as typeof linkType)}
                    className="w-40 px-2 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="relates-to">Relates to</option>
                    <option value="blocks">Blocks</option>
                    <option value="is-blocked-by">Blocked by</option>
                    <option value="duplicates">Duplicates</option>
                    <option value="is-duplicated-by">Duplicated by</option>
                  </select>
                  <select
                    value={linkTargetId}
                    onChange={e => setLinkTargetId(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select issue...</option>
                    {linkableIssues.map(i => (
                      <option key={i.id} value={i.id}>{i.key}: {i.title}</option>
                    ))}
                  </select>
                  <button
                    onClick={handleLinkIssue}
                    disabled={!linkTargetId}
                    className="px-4 py-2 bg-[#0052CC] text-white rounded-lg text-sm hover:bg-[#0065FF] transition-colors disabled:opacity-50 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Link
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ---- ATTACHMENTS TAB ---- */}
          {activeTab === 'attachments' && (
            <div className="space-y-4">
              <div className="space-y-2">
                {(liveIssue.attachments ?? []).length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-6">No attachments yet.</p>
                )}
                {(liveIssue.attachments ?? []).map(att => (
                  <div key={att.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 min-w-0">
                      <Paperclip className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <a
                          href={att.data}
                          download={att.name}
                          className="text-sm font-medium text-[#0052CC] hover:underline truncate block"
                        >
                          {att.name}
                        </a>
                        <span className="text-xs text-gray-400">
                          {(att.size / 1024).toFixed(1)} KB · {getUserById(att.uploadedBy)?.name} · {new Date(att.uploadedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => removeAttachment(issue.id, att.id)}
                      className="p-1 hover:bg-red-50 rounded text-red-400 hover:text-red-600 transition-colors ml-2 flex-shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-gray-100">
                <label className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                  <Plus className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-500">Attach a file</span>
                  <input type="file" className="hidden" onChange={handleFileUpload} />
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};