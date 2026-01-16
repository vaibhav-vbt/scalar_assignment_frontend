import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { boardsAPI, listsAPI, cardsAPI, labelsAPI, membersAPI } from '../api';
import Header from './Header';
import List from './List';
import AddList from './AddList';
import CardModal from './CardModal';

function BoardView() {
  const { id: boardId } = useParams();
  const navigate = useNavigate();
  const [board, setBoard] = useState(null);
  const [labels, setLabels] = useState([]);
  const [members, setMembers] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ labelId: '', memberId: '', dueDate: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [boardRes, labelsRes, membersRes] = await Promise.all([
          boardsAPI.getById(boardId),
          labelsAPI.getAll(),
          membersAPI.getAll()
        ]);

        setBoard(boardRes.data);
        setLabels(labelsRes.data);
        setMembers(membersRes.data);
      } catch (err) {
        setError(err.message);
        if (err.response?.status === 404) {
          navigate('/');
        }
      } finally {
        setLoading(false);
      }
    };

    if (boardId) {
      fetchData();
    }
  }, [boardId, navigate]);

  const handleDragEnd = useCallback(async (result) => {
    const { destination, source, type, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    if (type === 'list') {
      const newLists = Array.from(board.lists);
      const [removed] = newLists.splice(source.index, 1);
      newLists.splice(destination.index, 0, removed);

      const updatedLists = newLists.map((list, index) => ({ ...list, position: index }));
      setBoard({ ...board, lists: updatedLists });

      try {
        await listsAPI.reorder(updatedLists.map(l => ({ id: l.id, position: l.position })));
      } catch (err) {
        console.error('Error reordering lists:', err);
      }
    } else if (type === 'card') {
      const sourceListId = parseInt(source.droppableId.replace('list-', ''));
      const destListId = parseInt(destination.droppableId.replace('list-', ''));

      const newLists = board.lists.map(list => ({
        ...list,
        cards: [...(list.cards || [])]
      }));

      const sourceList = newLists.find(l => l.id === sourceListId);
      const destList = newLists.find(l => l.id === destListId);

      const [movedCard] = sourceList.cards.splice(source.index, 1);
      destList.cards.splice(destination.index, 0, movedCard);

      sourceList.cards.forEach((card, index) => card.position = index);
      destList.cards.forEach((card, index) => {
        card.position = index;
        card.listId = destListId;
      });

      setBoard({ ...board, lists: newLists });

      try {
        const allCards = newLists.flatMap(list =>
          list.cards.map(card => ({ id: card.id, listId: list.id, position: card.position }))
        );
        await cardsAPI.reorder(allCards);
      } catch (err) {
        console.error('Error reordering cards:', err);
      }
    }
  }, [board]);

  const handleAddList = async (title) => {
    try {
      const response = await listsAPI.create({ title, boardId: board.id });
      const newList = { ...response.data, cards: [] };
      setBoard({ ...board, lists: [...board.lists, newList] });
    } catch (err) {
      console.error('Error adding list:', err);
    }
  };

  const handleUpdateList = async (listId, data) => {
    try {
      await listsAPI.update(listId, data);
      setBoard({
        ...board,
        lists: board.lists.map(list =>
          list.id === listId ? { ...list, ...data } : list
        )
      });
    } catch (err) {
      console.error('Error updating list:', err);
    }
  };

  const handleDeleteList = async (listId) => {
    try {
      await listsAPI.delete(listId);
      setBoard({
        ...board,
        lists: board.lists.filter(list => list.id !== listId)
      });
    } catch (err) {
      console.error('Error deleting list:', err);
    }
  };

  const handleAddCard = async (listId, title) => {
    try {
      const response = await cardsAPI.create({ title, listId });
      setBoard({
        ...board,
        lists: board.lists.map(list =>
          list.id === listId
            ? { ...list, cards: [...(list.cards || []), response.data] }
            : list
        )
      });
    } catch (err) {
      console.error('Error adding card:', err);
    }
  };

  const handleUpdateCard = (updatedCard) => {
    setBoard({
      ...board,
      lists: board.lists.map(list => ({
        ...list,
        cards: list.cards?.map(card =>
          card.id === updatedCard.id ? updatedCard : card
        )
      }))
    });
    setSelectedCard(updatedCard);
  };

  const handleArchiveCard = async (cardId) => {
    try {
      await cardsAPI.archive(cardId);
      setBoard({
        ...board,
        lists: board.lists.map(list => ({
          ...list,
          cards: list.cards?.filter(card => card.id !== cardId)
        }))
      });
    } catch (err) {
      console.error('Error archiving card:', err);
    }
  };

  const handleDeleteCard = async (cardId) => {
    try {
      await cardsAPI.delete(cardId);
      setBoard({
        ...board,
        lists: board.lists.map(list => ({
          ...list,
          cards: list.cards?.filter(card => card.id !== cardId)
        }))
      });
    } catch (err) {
      console.error('Error deleting card:', err);
    }
  };

  const getFilteredLists = () => {
    if (!board || !board.lists) return [];

    const hasFilters = searchQuery || filters.labelId || filters.memberId || filters.dueDate;
    if (!hasFilters) return board.lists;

    return board.lists.map(list => {
      const filteredCards = list.cards?.filter(card => {
        if (searchQuery && !card.title.toLowerCase().includes(searchQuery.toLowerCase())) {
          return false;
        }
        if (filters.labelId && !card.labels?.some(l => l.id === parseInt(filters.labelId))) {
          return false;
        }
        if (filters.memberId && !card.members?.some(m => m.id === parseInt(filters.memberId))) {
          return false;
        }
        if (filters.dueDate) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const cardDue = card.dueDate ? new Date(card.dueDate) : null;

          if (filters.dueDate === 'overdue' && (!cardDue || cardDue >= today)) return false;
          if (filters.dueDate === 'today') {
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            if (!cardDue || cardDue < today || cardDue >= tomorrow) return false;
          }
          if (filters.dueDate === 'week') {
            const nextWeek = new Date(today);
            nextWeek.setDate(nextWeek.getDate() + 7);
            if (!cardDue || cardDue < today || cardDue > nextWeek) return false;
          }
          if (filters.dueDate === 'noduedate' && cardDue) return false;
        }
        return true;
      }) || [];

      return { ...list, cards: filteredCards };
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0079bf] flex items-center justify-center">
        <div className="text-white text-xl">Loading board...</div>
      </div>
    );
  }

  if (error || !board) {
    return (
      <div className="min-h-screen bg-[#0079bf] flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 max-w-md shadow-xl">
          <h2 className="text-red-600 font-bold mb-2">Error</h2>
          <p className="text-gray-700">{error || 'Board not found'}</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 bg-[#0065ff] hover:bg-[#0055d4] text-white px-4 py-2 rounded text-sm font-medium"
          >
            Go to Boards
          </button>
        </div>
      </div>
    );
  }

  const filteredLists = getFilteredLists();

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: board?.backgroundColor || 'linear-gradient(135deg, #7c3aed 0%, #c026d3 100%)'
      }}
    >
      <Header
        boardTitle={board?.title}
        boardColor={board?.backgroundColor}
        onSearch={setSearchQuery}
        onFilterChange={setFilters}
        labels={labels}
        members={members}
        showBoardControls={true}
      />

      {/* Board Content */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="board" type="list" direction="horizontal">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="flex-1 flex gap-3 p-3 overflow-x-auto items-start"
            >
              {filteredLists.map((list, index) => (
                <List
                  key={list.id}
                  list={list}
                  index={index}
                  onAddCard={handleAddCard}
                  onDeleteList={handleDeleteList}
                  onUpdateList={handleUpdateList}
                  onCardClick={(card) => setSelectedCard({ ...card, list })}
                />
              ))}
              {provided.placeholder}
              <AddList onAdd={handleAddList} />
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Card Modal */}
      {selectedCard && (
        <CardModal
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
          onUpdate={handleUpdateCard}
          onArchive={handleArchiveCard}
          onDelete={handleDeleteCard}
          labels={labels}
          members={members}
        />
      )}
    </div>
  );
}

export default BoardView;
