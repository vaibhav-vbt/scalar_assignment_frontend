import { useState, useEffect } from 'react';
import { X, Tag, Clock, CheckSquare, User, Trash2, Archive, AlignLeft, CreditCard } from 'lucide-react';
import { format } from 'date-fns';
import { cardsAPI, checklistsAPI } from '../api';

function CardModal({ card, onClose, onUpdate, onDelete, onArchive, labels, members }) {
  const [cardData, setCardData] = useState(card);
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || '');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [showLabelPicker, setShowLabelPicker] = useState(false);
  const [showMemberPicker, setShowMemberPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showChecklistAdd, setShowChecklistAdd] = useState(false);
  const [newChecklistTitle, setNewChecklistTitle] = useState('Checklist');
  const [newItemText, setNewItemText] = useState({});
  const [dueDate, setDueDate] = useState(card.dueDate ? format(new Date(card.dueDate), 'yyyy-MM-dd') : '');

  useEffect(() => {
    setCardData(card);
    setTitle(card.title);
    setDescription(card.description || '');
    setDueDate(card.dueDate ? format(new Date(card.dueDate), 'yyyy-MM-dd') : '');
  }, [card]);

  const handleTitleSave = async () => {
    if (title.trim() && title !== cardData.title) {
      const response = await cardsAPI.update(cardData.id, { title: title.trim() });
      setCardData(response.data);
      onUpdate(response.data);
    }
    setIsEditingTitle(false);
  };

  const handleDescriptionSave = async () => {
    if (description !== cardData.description) {
      const response = await cardsAPI.update(cardData.id, { description });
      setCardData(response.data);
      onUpdate(response.data);
    }
    setIsEditingDescription(false);
  };

  const handleDueDateChange = async (e) => {
    const newDate = e.target.value;
    setDueDate(newDate);
    const response = await cardsAPI.update(cardData.id, {
      dueDate: newDate ? new Date(newDate).toISOString() : null
    });
    setCardData(response.data);
    onUpdate(response.data);
    setShowDatePicker(false);
  };

  const handleRemoveDueDate = async () => {
    setDueDate('');
    const response = await cardsAPI.update(cardData.id, { dueDate: null });
    setCardData(response.data);
    onUpdate(response.data);
    setShowDatePicker(false);
  };

  const handleLabelToggle = async (label) => {
    const hasLabel = cardData.labels?.some(l => l.id === label.id);
    try {
      if (hasLabel) {
        await cardsAPI.removeLabel(cardData.id, label.id);
      } else {
        await cardsAPI.addLabel(cardData.id, label.id);
      }
      const response = await cardsAPI.getById(cardData.id);
      setCardData(response.data);
      onUpdate(response.data);
    } catch (error) {
      console.error('Error toggling label:', error);
    }
  };

  const handleMemberToggle = async (member) => {
    const hasMember = cardData.members?.some(m => m.id === member.id);
    try {
      if (hasMember) {
        await cardsAPI.removeMember(cardData.id, member.id);
      } else {
        await cardsAPI.addMember(cardData.id, member.id);
      }
      const response = await cardsAPI.getById(cardData.id);
      setCardData(response.data);
      onUpdate(response.data);
    } catch (error) {
      console.error('Error toggling member:', error);
    }
  };

  const handleAddChecklist = async () => {
    try {
      const response = await checklistsAPI.create({
        title: newChecklistTitle.trim() || 'Checklist',
        cardId: cardData.id
      });
      const updated = {
        ...cardData,
        checklists: [...(cardData.checklists || []), response.data]
      };
      setCardData(updated);
      onUpdate(updated);
      setNewChecklistTitle('Checklist');
      setShowChecklistAdd(false);
    } catch (error) {
      console.error('Error adding checklist:', error);
    }
  };

  const handleDeleteChecklist = async (checklistId) => {
    try {
      await checklistsAPI.delete(checklistId);
      const updated = {
        ...cardData,
        checklists: cardData.checklists.filter(c => c.id !== checklistId)
      };
      setCardData(updated);
      onUpdate(updated);
    } catch (error) {
      console.error('Error deleting checklist:', error);
    }
  };

  const handleAddChecklistItem = async (checklistId) => {
    const text = newItemText[checklistId]?.trim();
    if (!text) return;

    try {
      const response = await checklistsAPI.addItem(checklistId, { text });
      const updated = {
        ...cardData,
        checklists: cardData.checklists.map(c =>
          c.id === checklistId
            ? { ...c, items: [...(c.items || []), response.data] }
            : c
        )
      };
      setCardData(updated);
      onUpdate(updated);
      setNewItemText({ ...newItemText, [checklistId]: '' });
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  const handleToggleChecklistItem = async (itemId) => {
    try {
      const response = await checklistsAPI.toggleItem(itemId);
      const updated = {
        ...cardData,
        checklists: cardData.checklists.map(c => ({
          ...c,
          items: c.items?.map(item =>
            item.id === itemId ? response.data : item
          )
        }))
      };
      setCardData(updated);
      onUpdate(updated);
    } catch (error) {
      console.error('Error toggling item:', error);
    }
  };

  const handleDeleteChecklistItem = async (itemId, checklistId) => {
    try {
      await checklistsAPI.deleteItem(itemId);
      const updated = {
        ...cardData,
        checklists: cardData.checklists.map(c =>
          c.id === checklistId
            ? { ...c, items: c.items.filter(item => item.id !== itemId) }
            : c
        )
      };
      setCardData(updated);
      onUpdate(updated);
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const getChecklistProgress = (checklist) => {
    if (!checklist.items || checklist.items.length === 0) return 0;
    const completed = checklist.items.filter(item => item.isCompleted).length;
    return Math.round((completed / checklist.items.length) * 100);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 px-4 pb-4 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-[#f1f2f4] rounded-xl w-full max-w-3xl shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 hover:bg-[#dcdfe4] rounded-lg z-10"
        >
          <X className="w-5 h-5 text-[#44546f]" />
        </button>

        {/* Header */}
        <div className="p-6 pb-2">
          <div className="flex items-start gap-3">
            <CreditCard className="w-5 h-5 text-[#44546f] mt-1 flex-shrink-0" />
            <div className="flex-1 pr-8">
              {isEditingTitle ? (
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={handleTitleSave}
                  onKeyDown={(e) => e.key === 'Enter' && handleTitleSave()}
                  autoFocus
                  className="w-full text-xl font-semibold px-2 py-1 bg-white border-2 border-[#0065ff] rounded text-[#172b4d] focus:outline-none"
                />
              ) : (
                <h2
                  onClick={() => setIsEditingTitle(true)}
                  className="text-xl font-semibold text-[#172b4d] cursor-pointer hover:bg-[#dcdfe4] px-2 py-1 rounded -ml-2 -mt-1"
                >
                  {cardData.title}
                </h2>
              )}
              <p className="text-sm text-[#44546f] mt-1 ml-2">
                in list <span className="underline cursor-pointer">{card.list?.title || 'List'}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col md:flex-row p-6 pt-4 gap-4">
          {/* Main content */}
          <div className="flex-1 space-y-6">
            {/* Labels & Members & Due Date row */}
            <div className="flex flex-wrap gap-6">
              {cardData.members && cardData.members.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-[#44546f] mb-2">Members</h4>
                  <div className="flex flex-wrap gap-1">
                    {cardData.members.map(member => (
                      <div
                        key={member.id}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                        style={{ backgroundColor: member.avatarColor }}
                        title={member.name}
                      >
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {cardData.labels && cardData.labels.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-[#44546f] mb-2">Labels</h4>
                  <div className="flex flex-wrap gap-1">
                    {cardData.labels.map(label => (
                      <span
                        key={label.id}
                        className="px-3 py-1.5 rounded text-white text-sm font-medium min-w-[48px] text-center"
                        style={{ backgroundColor: label.color }}
                      >
                        {label.name || ''}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {cardData.dueDate && (
                <div>
                  <h4 className="text-xs font-semibold text-[#44546f] mb-2">Due date</h4>
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#dcdfe4] rounded text-sm text-[#172b4d]">
                    <Clock className="w-4 h-4" />
                    {format(new Date(cardData.dueDate), 'MMM d, yyyy')}
                  </span>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <AlignLeft className="w-5 h-5 text-[#44546f]" />
                <h4 className="text-base font-semibold text-[#172b4d]">Description</h4>
              </div>
              {isEditingDescription ? (
                <div className="ml-8">
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    autoFocus
                    rows={4}
                    placeholder="Add a more detailed description..."
                    className="w-full px-3 py-2 bg-white border-2 border-[#0065ff] rounded text-[#172b4d] placeholder-[#44546f] focus:outline-none resize-none"
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={handleDescriptionSave}
                      className="bg-[#0065ff] hover:bg-[#0055d4] text-white px-3 py-1.5 rounded text-sm font-medium"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setDescription(cardData.description || '');
                        setIsEditingDescription(false);
                      }}
                      className="hover:bg-[#dcdfe4] text-[#172b4d] px-3 py-1.5 rounded text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => setIsEditingDescription(true)}
                  className={`ml-8 min-h-[56px] px-3 py-2 bg-[#dcdfe4] hover:bg-[#cfd3da] rounded cursor-pointer text-sm transition-colors ${description ? 'text-[#172b4d]' : 'text-[#44546f]'
                    }`}
                >
                  {description || 'Add a more detailed description...'}
                </div>
              )}
            </div>

            {/* Checklists */}
            {cardData.checklists && cardData.checklists.map(checklist => (
              <div key={checklist.id}>
                <div className="flex items-center gap-3 mb-3">
                  <CheckSquare className="w-5 h-5 text-[#44546f]" />
                  <div className="flex-1 flex items-center justify-between">
                    <h4 className="text-base font-semibold text-[#172b4d]">{checklist.title}</h4>
                    <button
                      onClick={() => handleDeleteChecklist(checklist.id)}
                      className="text-[#44546f] hover:bg-[#dcdfe4] text-sm px-3 py-1 rounded"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="ml-8">
                  {/* Progress bar */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs text-[#44546f] w-8">{getChecklistProgress(checklist)}%</span>
                    <div className="flex-1 h-2 bg-[#dcdfe4] rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${getChecklistProgress(checklist) === 100 ? 'bg-[#1f845a]' : 'bg-[#0065ff]'}`}
                        style={{ width: `${getChecklistProgress(checklist)}%` }}
                      />
                    </div>
                  </div>

                  {/* Items */}
                  <div className="space-y-1">
                    {checklist.items?.map(item => (
                      <div key={item.id} className="flex items-center gap-2 group py-1.5 px-2 hover:bg-[#dcdfe4] rounded-lg -ml-2">
                        <input
                          type="checkbox"
                          checked={item.isCompleted}
                          onChange={() => handleToggleChecklistItem(item.id)}
                          className="w-4 h-4 rounded border-[#dcdfe4] text-[#0065ff] focus:ring-[#0065ff]"
                        />
                        <span className={`flex-1 text-sm ${item.isCompleted ? 'line-through text-[#44546f]' : 'text-[#172b4d]'}`}>
                          {item.text}
                        </span>
                        <button
                          onClick={() => handleDeleteChecklistItem(item.id, checklist.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[#cfd3da] rounded"
                        >
                          <X className="w-3 h-3 text-[#44546f]" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add item */}
                  <div className="mt-2">
                    <input
                      type="text"
                      placeholder="Add an item..."
                      value={newItemText[checklist.id] || ''}
                      onChange={(e) => setNewItemText({ ...newItemText, [checklist.id]: e.target.value })}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddChecklistItem(checklist.id)}
                      className="w-full px-3 py-2 bg-white border border-[#dcdfe4] focus:border-[#0065ff] rounded text-sm text-[#172b4d] placeholder-[#44546f] focus:outline-none"
                    />
                    {newItemText[checklist.id] && (
                      <button
                        onClick={() => handleAddChecklistItem(checklist.id)}
                        className="mt-2 bg-[#0065ff] hover:bg-[#0055d4] text-white px-3 py-1.5 rounded text-sm font-medium"
                      >
                        Add
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="w-full md:w-44 space-y-2">
            <h4 className="text-xs font-semibold text-[#44546f] mb-2">Add to card</h4>

            {/* Members */}
            <div className="relative">
              <button
                onClick={() => setShowMemberPicker(!showMemberPicker)}
                className="w-full flex items-center gap-2 px-3 py-1.5 bg-[#dcdfe4] hover:bg-[#cfd3da] rounded text-sm text-[#172b4d]"
              >
                <User className="w-4 h-4" />
                Members
              </button>
              {showMemberPicker && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowMemberPicker(false)} />
                  <div className="absolute left-0 top-full mt-1 w-72 bg-white rounded-lg shadow-xl z-50 border border-[#dcdfe4]">
                    <div className="p-3 border-b border-[#dcdfe4]">
                      <h5 className="font-semibold text-sm text-[#172b4d]">Members</h5>
                    </div>
                    <div className="p-2 space-y-1 max-h-48 overflow-y-auto">
                      {members?.map(member => {
                        const isAssigned = cardData.members?.some(m => m.id === member.id);
                        return (
                          <button
                            key={member.id}
                            onClick={() => handleMemberToggle(member)}
                            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm hover:bg-[#f1f2f4] ${isAssigned ? 'bg-[#e9f2ff]' : ''}`}
                          >
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                              style={{ backgroundColor: member.avatarColor }}
                            >
                              {member.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-[#172b4d]">{member.name}</span>
                            {isAssigned && <span className="ml-auto text-[#0065ff]">✓</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Labels */}
            <div className="relative">
              <button
                onClick={() => setShowLabelPicker(!showLabelPicker)}
                className="w-full flex items-center gap-2 px-3 py-1.5 bg-[#dcdfe4] hover:bg-[#cfd3da] rounded text-sm text-[#172b4d]"
              >
                <Tag className="w-4 h-4" />
                Labels
              </button>
              {showLabelPicker && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowLabelPicker(false)} />
                  <div className="absolute left-0 top-full mt-1 w-72 bg-white rounded-lg shadow-xl z-50 border border-[#dcdfe4]">
                    <div className="p-3 border-b border-[#dcdfe4]">
                      <h5 className="font-semibold text-sm text-[#172b4d]">Labels</h5>
                    </div>
                    <div className="p-2 space-y-1">
                      {labels?.map(label => {
                        const hasLabel = cardData.labels?.some(l => l.id === label.id);
                        return (
                          <button
                            key={label.id}
                            onClick={() => handleLabelToggle(label)}
                            className="w-full flex items-center gap-2 p-1 rounded hover:bg-[#f1f2f4]"
                          >
                            <span
                              className="flex-1 h-8 rounded flex items-center px-3 text-white text-sm font-medium"
                              style={{ backgroundColor: label.color }}
                            >
                              {label.name}
                            </span>
                            {hasLabel && <span className="text-[#0065ff]">✓</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Checklist */}
            <div className="relative">
              <button
                onClick={() => setShowChecklistAdd(!showChecklistAdd)}
                className="w-full flex items-center gap-2 px-3 py-1.5 bg-[#dcdfe4] hover:bg-[#cfd3da] rounded text-sm text-[#172b4d]"
              >
                <CheckSquare className="w-4 h-4" />
                Checklist
              </button>
              {showChecklistAdd && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowChecklistAdd(false)} />
                  <div className="absolute left-0 top-full mt-1 w-72 bg-white rounded-lg shadow-xl z-50 border border-[#dcdfe4]">
                    <div className="p-3 border-b border-[#dcdfe4]">
                      <h5 className="font-semibold text-sm text-[#172b4d]">Add checklist</h5>
                    </div>
                    <div className="p-3">
                      <label className="block text-xs font-semibold text-[#44546f] mb-2">Title</label>
                      <input
                        type="text"
                        value={newChecklistTitle}
                        onChange={(e) => setNewChecklistTitle(e.target.value)}
                        className="w-full px-3 py-2 border border-[#dcdfe4] focus:border-[#0065ff] rounded text-sm text-[#172b4d] mb-3 focus:outline-none"
                      />
                      <button
                        onClick={handleAddChecklist}
                        className="w-full bg-[#0065ff] hover:bg-[#0055d4] text-white px-3 py-1.5 rounded text-sm font-medium"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Due Date */}
            <div className="relative">
              <button
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="w-full flex items-center gap-2 px-3 py-1.5 bg-[#dcdfe4] hover:bg-[#cfd3da] rounded text-sm text-[#172b4d]"
              >
                <Clock className="w-4 h-4" />
                Dates
              </button>
              {showDatePicker && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowDatePicker(false)} />
                  <div className="absolute left-0 top-full mt-1 w-72 bg-white rounded-lg shadow-xl z-50 border border-[#dcdfe4]">
                    <div className="p-3 border-b border-[#dcdfe4]">
                      <h5 className="font-semibold text-sm text-[#172b4d]">Dates</h5>
                    </div>
                    <div className="p-3">
                      <label className="block text-xs font-semibold text-[#44546f] mb-2">Due date</label>
                      <input
                        type="date"
                        value={dueDate}
                        onChange={handleDueDateChange}
                        className="w-full px-3 py-2 border border-[#dcdfe4] focus:border-[#0065ff] rounded text-sm text-[#172b4d] mb-2 focus:outline-none"
                      />
                      {cardData.dueDate && (
                        <button
                          onClick={handleRemoveDueDate}
                          className="w-full text-[#c9372c] hover:bg-[#ffebe6] px-3 py-1.5 rounded text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            <hr className="border-[#dcdfe4] my-3" />

            <h4 className="text-xs font-semibold text-[#44546f] mb-2">Actions</h4>

            {/* Archive */}
            <button
              onClick={() => {
                onArchive(cardData.id);
                onClose();
              }}
              className="w-full flex items-center gap-2 px-3 py-1.5 bg-[#dcdfe4] hover:bg-[#cfd3da] rounded text-sm text-[#172b4d]"
            >
              <Archive className="w-4 h-4" />
              Archive
            </button>

            {/* Delete */}
            <button
              onClick={() => {
                if (confirm('Are you sure you want to delete this card?')) {
                  onDelete(cardData.id);
                  onClose();
                }
              }}
              className="w-full flex items-center gap-2 px-3 py-1.5 bg-[#ffebe6] hover:bg-[#ffd5d2] rounded text-sm text-[#c9372c]"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CardModal;
