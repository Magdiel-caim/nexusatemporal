import { useDroppable } from '@dnd-kit/core';
import { ReactNode } from 'react';

interface DroppableStageColumnProps {
  id: string;
  children: ReactNode;
}

export default function DroppableStageColumn({ id, children }: DroppableStageColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 overflow-y-auto p-3 space-y-3 transition-colors ${
        isOver ? 'bg-primary-50' : ''
      }`}
    >
      {children}
    </div>
  );
}
