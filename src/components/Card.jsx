import { Draggable } from '@hello-pangea/dnd';
import { Clock, CheckSquare, AlignLeft } from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';

function Card({ card, index, onClick }) {
  const hasLabels = card.labels && card.labels.length > 0;
  const hasDescription = card.description && card.description.trim();
  const hasChecklist = card.checklists && card.checklists.length > 0;
  const hasMembers = card.members && card.members.length > 0;
  const hasDueDate = card.dueDate;

  // Calculate checklist progress
  const getChecklistProgress = () => {
    if (!hasChecklist) return null;
    let total = 0;
    let completed = 0;
    card.checklists.forEach(checklist => {
      if (checklist.items) {
        total += checklist.items.length;
        completed += checklist.items.filter(item => item.isCompleted).length;
      }
    });
    return { total, completed };
  };

  const checklistProgress = getChecklistProgress();
  const isChecklistComplete = checklistProgress && checklistProgress.completed === checklistProgress.total;

  // Due date styling - Trello style
  const getDueDateStyle = () => {
    if (!hasDueDate) return null;
    const dueDate = new Date(card.dueDate);

    // Overdue - Red
    if (isPast(dueDate) && !isToday(dueDate)) {
      return 'bg-[#f87462] text-white';
    }
    // Due today - Yellow/Orange
    if (isToday(dueDate)) {
      return 'bg-[#f5cd47] text-[#172b4d]';
    }
    // Future - Light gray
    return 'bg-[#f1f2f4] text-[#44546f]';
  };

  return (
    <Draggable draggableId={`card-${card.id}`} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
          className={`bg-white rounded-lg cursor-pointer group transition-all mb-2 ${snapshot.isDragging
              ? 'shadow-xl rotate-3 scale-105'
              : 'shadow-sm hover:outline hover:outline-2 hover:outline-[#388bff]'
            }`}
          style={{
            ...provided.draggableProps.style,
            boxShadow: snapshot.isDragging
              ? '0 8px 24px rgba(9,30,66,.25)'
              : '0px 1px 1px rgba(9,30,66,.25), 0px 0px 1px rgba(9,30,66,.31)'
          }}
        >
          {/* Labels - colored bars */}
          {hasLabels && (
            <div className="flex flex-wrap gap-1 px-2 pt-2">
              {card.labels.map(label => (
                <span
                  key={label.id}
                  className="h-2 min-w-[40px] rounded-full"
                  style={{ backgroundColor: label.color }}
                  title={label.name}
                />
              ))}
            </div>
          )}

          {/* Title */}
          <div className="px-2 py-1.5">
            <p className="text-sm text-[#172b4d] leading-5">{card.title}</p>
          </div>

          {/* Badges */}
          {(hasDueDate || hasDescription || checklistProgress || hasMembers) && (
            <div className="flex flex-wrap items-center gap-1 px-2 pb-2">
              {/* Due Date - Trello style badge */}
              {hasDueDate && (
                <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium ${getDueDateStyle()}`}>
                  <Clock className="w-3.5 h-3.5" />
                  <span>{format(new Date(card.dueDate), 'MMM d')}</span>
                </span>
              )}

              {/* Description indicator */}
              {hasDescription && (
                <span className="text-[#44546f] p-0.5" title="This card has a description">
                  <AlignLeft className="w-4 h-4" />
                </span>
              )}

              {/* Checklist progress */}
              {checklistProgress && checklistProgress.total > 0 && (
                <span
                  className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium ${isChecklistComplete
                      ? 'bg-[#1f845a] text-white'
                      : 'text-[#44546f]'
                    }`}
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>{checklistProgress.completed}/{checklistProgress.total}</span>
                </span>
              )}

              {/* Members */}
              {hasMembers && (
                <div className="flex -space-x-1 ml-auto">
                  {card.members.slice(0, 3).map(member => (
                    <div
                      key={member.id}
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold border-2 border-white"
                      style={{ backgroundColor: member.avatarColor }}
                      title={member.name}
                    >
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                  ))}
                  {card.members.length > 3 && (
                    <div className="w-6 h-6 rounded-full bg-[#dfe1e6] flex items-center justify-center text-[#44546f] text-[10px] font-bold border-2 border-white">
                      +{card.members.length - 3}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
}

export default Card;
