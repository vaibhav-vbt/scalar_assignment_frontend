import { useState } from 'react';
import { Draggable, Droppable } from '@hello-pangea/dnd';
import { MoreHorizontal, Plus } from 'lucide-react';
import Card from './Card';
import AddCard from './AddCard';

function List({ list, index, onAddCard, onDeleteList, onUpdateList, onCardClick }) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(list.title);
  const [showMenu, setShowMenu] = useState(false);

  const handleTitleSubmit = () => {
    if (title.trim() && title !== list.title) {
      onUpdateList(list.id, { title: title.trim() });
    } else {
      setTitle(list.title);
    }
    setIsEditingTitle(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleTitleSubmit();
    } else if (e.key === 'Escape') {
      setTitle(list.title);
      setIsEditingTitle(false);
    }
  };

  const cards = list.cards || [];

  return (
    <Draggable draggableId={`list-${list.id}`} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`w-[272px] min-w-[272px] bg-[#f1f2f4] rounded-xl flex flex-col max-h-[calc(100vh-140px)] ${snapshot.isDragging ? 'shadow-xl rotate-2' : ''
            }`}
        >
          {/* List Header */}
          <div
            {...provided.dragHandleProps}
            className="px-2 pt-2 pb-1 flex items-center justify-between gap-1"
          >
            {isEditingTitle ? (
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleTitleSubmit}
                onKeyDown={handleKeyDown}
                autoFocus
                className="flex-1 px-2 py-1 bg-white border-2 border-[#0065ff] rounded-lg font-semibold text-sm text-[#172b4d] focus:outline-none"
              />
            ) : (
              <h3
                onClick={() => setIsEditingTitle(true)}
                className="flex-1 px-2 py-1 font-semibold text-sm text-[#172b4d] cursor-pointer hover:bg-[#dcdfe4] rounded-lg"
              >
                {list.title}
              </h3>
            )}

            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1.5 hover:bg-[#dcdfe4] rounded-lg"
              >
                <MoreHorizontal className="w-4 h-4 text-[#44546f]" />
              </button>

              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 top-full mt-1 w-60 bg-white rounded-lg shadow-xl z-50 border border-[#dcdfe4]">
                    <div className="p-2 border-b border-gray-100 text-center">
                      <span className="text-sm font-semibold text-[#44546f]">List actions</span>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => {
                          onDeleteList(list.id);
                          setShowMenu(false);
                        }}
                        className="w-full px-3 py-2 text-left text-sm text-[#172b4d] hover:bg-[#f1f2f4]"
                      >
                        Delete this list
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Cards Container */}
          <Droppable droppableId={`list-${list.id}`} type="card">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`flex-1 overflow-y-auto px-2 py-0.5 min-h-[1px] ${snapshot.isDraggingOver ? 'bg-[#e3e6ea]' : ''
                  }`}
                style={{ scrollbarWidth: 'thin' }}
              >
                {cards.map((card, cardIndex) => (
                  <Card
                    key={card.id}
                    card={card}
                    index={cardIndex}
                    onClick={() => onCardClick(card)}
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          {/* Add Card */}
          <div className="p-2 pt-0">
            <AddCard onAdd={(title) => onAddCard(list.id, title)} />
          </div>
        </div>
      )}
    </Draggable>
  );
}

export default List;
