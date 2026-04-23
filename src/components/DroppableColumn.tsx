import React from 'react';
import { useDroppable } from '@dnd-kit/core';

interface DroppableColumnProps {
  id: string;
  title: string;
  count: number;
  children: React.ReactNode;
}

export const DroppableColumn: React.FC<DroppableColumnProps> = ({ id, title, count, children }) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <div className="flex-shrink-0 w-80">
      <div
        ref={setNodeRef}
        className={`bg-[#F4F5F7] rounded-lg p-3 min-h-[500px] transition-colors ${
          isOver ? 'bg-blue-50 ring-2 ring-blue-300' : ''
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
            {title}
          </h3>
          <span className="bg-gray-300 text-gray-700 px-2 py-0.5 rounded-full text-xs font-medium">
            {count}
          </span>
        </div>
        {children}
      </div>
    </div>
  );
};
