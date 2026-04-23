import React from 'react';
import { Issue, User } from '../types';
import { useDraggable } from '@dnd-kit/core';
import { Calendar, AlertCircle, Zap, Target, BookOpen } from 'lucide-react';

interface IssueCardProps {
  issue: Issue;
  onClick: () => void;
  assignee?: User;
}

export const IssueCard: React.FC<IssueCardProps> = ({ issue, onClick, assignee }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: issue.id,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  const typeIcons = {
    story: <BookOpen className="w-3.5 h-3.5 text-green-600" />,
    task: <Zap className="w-3.5 h-3.5 text-blue-600" />,
    bug: <AlertCircle className="w-3.5 h-3.5 text-red-600" />,
    epic: <Target className="w-3.5 h-3.5 text-purple-600" />,
  };

  const priorityColors = {
    lowest: 'text-gray-400',
    low: 'text-blue-400',
    medium: 'text-yellow-500',
    high: 'text-orange-500',
    highest: 'text-red-500',
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-200 p-3 ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      {/* Issue Key & Type */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          {typeIcons[issue.type]}
          <span className="text-xs text-gray-500 font-medium">{issue.key}</span>
        </div>
        {issue.priority && (
          <div className={`${priorityColors[issue.priority]}`}>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 3l7 7-7 7V3z" />
            </svg>
          </div>
        )}
      </div>

      {/* Title */}
      <h4 className="text-sm text-[#172B4D] font-medium mb-2 line-clamp-2">
        {issue.title}
      </h4>

      {/* Footer */}
      <div className="flex items-center justify-between">
        {/* Due Date */}
        {issue.estimatedHours && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Calendar className="w-3 h-3" />
            <span>{issue.estimatedHours}h</span>
          </div>
        )}

        {/* Assignee Avatar */}
        {assignee && (
          <div
            className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-xs font-medium"
            title={assignee.name}
          >
            {getInitials(assignee.name)}
          </div>
        )}
      </div>

      {/* Labels */}
      {issue.labels && issue.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {issue.labels.slice(0, 2).map((label, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
            >
              {label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
