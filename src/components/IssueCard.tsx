import React from 'react';
import { Issue, User } from '../types';
import { useDraggable } from '@dnd-kit/core';
import {
  Calendar,
  AlertCircle,
  Zap,
  Target,
  BookOpen,
  Lock,
  GripVertical,
} from 'lucide-react';

interface IssueCardProps {
  issue: Issue;
  onClick: () => void;
  assignee?: User;
  /** If false, drag is disabled and a lock indicator is shown */
  canDrag: boolean;
}

const priorityColors: Record<string, string> = {
  lowest: 'text-gray-400',
  low: 'text-blue-400',
  medium: 'text-yellow-500',
  high: 'text-orange-500',
  highest: 'text-red-500',
};

const priorityArrowColor: Record<string, string> = {
  lowest: '#9CA3AF',
  low: '#60A5FA',
  medium: '#EAB308',
  high: '#F97316',
  highest: '#EF4444',
};

const typeIcons: Record<string, React.ReactNode> = {
  story: <BookOpen className="w-3.5 h-3.5 text-green-600" />,
  task: <Zap className="w-3.5 h-3.5 text-blue-600" />,
  bug: <AlertCircle className="w-3.5 h-3.5 text-red-600" />,
  epic: <Target className="w-3.5 h-3.5 text-purple-600" />,
};

const getInitials = (name: string) =>
  name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

export const IssueCard: React.FC<IssueCardProps> = ({
  issue,
  onClick,
  assignee,
  canDrag,
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: issue.id,
    // @dnd-kit still needs the hook — we just don't spread listeners when not permitted
    disabled: !canDrag,
  });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-lg border border-gray-200 p-3 transition-shadow select-none
        ${isDragging ? 'opacity-50 shadow-xl ring-2 ring-blue-300' : 'shadow-sm hover:shadow-md'}
        ${canDrag ? 'cursor-pointer' : 'cursor-default'}
      `}
      onClick={() => { if (!isDragging) onClick(); }}
    >
      {/* Card top row — drag handle (only if permitted) + type icon + key + priority */}
      <div className="flex items-center justify-between mb-2 gap-1">
        <div className="flex items-center gap-1.5 min-w-0">
          {/* Drag handle — only rendered and active when canDrag */}
          {canDrag ? (
            <span
              className="flex-shrink-0 text-gray-300 hover:text-gray-500 transition-colors cursor-grab active:cursor-grabbing"
              {...listeners}
              {...attributes}
              onClick={e => e.stopPropagation()}
              title="Drag to move"
            >
              <GripVertical className="w-3.5 h-3.5" />
            </span>
          ) : (
            <span
              className="flex-shrink-0 text-gray-200"
              title="You are not assigned to this issue"
            >
              <Lock className="w-3 h-3" />
            </span>
          )}

          <span className="flex-shrink-0">{typeIcons[issue.type]}</span>
          <span className="text-xs text-gray-400 font-medium truncate">{issue.key}</span>
        </div>

        {/* Priority arrow */}
        {issue.priority && (
          <div className={`flex-shrink-0 ${priorityColors[issue.priority]}`} title={`Priority: ${issue.priority}`}>
            <svg className="w-4 h-4" fill={priorityArrowColor[issue.priority]} viewBox="0 0 20 20">
              <path d="M10 3l7 7-7 7V3z" />
            </svg>
          </div>
        )}
      </div>

      {/* Title */}
      <h4 className="text-sm text-[#172B4D] font-medium mb-2 line-clamp-2 leading-snug">
        {issue.title}
      </h4>

      {/* Footer — estimate + assignee avatar */}
      <div className="flex items-center justify-between mt-1">
        {issue.estimatedHours != null ? (
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Calendar className="w-3 h-3" />
            <span>{issue.estimatedHours}h</span>
          </div>
        ) : (
          <span />
        )}

        {assignee ? (
          <div
            className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-[10px] font-semibold ml-auto"
            title={assignee.name}
          >
            {getInitials(assignee.name)}
          </div>
        ) : (
          <div
            className="w-6 h-6 rounded-full border border-dashed border-gray-300 flex items-center justify-center ml-auto"
            title="Unassigned"
          >
            <span className="text-gray-300 text-[9px]">?</span>
          </div>
        )}
      </div>

      {/* Labels */}
      {issue.labels && issue.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {issue.labels.slice(0, 2).map((label, idx) => (
            <span
              key={idx}
              className="px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded text-[10px] font-medium"
            >
              {label}
            </span>
          ))}
          {issue.labels.length > 2 && (
            <span className="px-1.5 py-0.5 bg-gray-100 text-gray-400 rounded text-[10px]">
              +{issue.labels.length - 2}
            </span>
          )}
        </div>
      )}
    </div>
  );
};