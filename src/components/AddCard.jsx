import { useState } from 'react';
import { Plus, X } from 'lucide-react';

function AddCard({ onAdd }) {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title.trim()) {
      onAdd(title.trim());
      setTitle('');
    }
  };

  const handleCancel = () => {
    setTitle('');
    setIsAdding(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (!isAdding) {
    return (
      <button
        onClick={() => setIsAdding(true)}
        className="w-full flex items-center gap-2 py-1.5 px-2 text-[#44546f] hover:bg-[#dcdfe4] rounded-lg transition-colors text-sm"
      >
        <Plus className="w-4 h-4" />
        <span>Add a card</span>
      </button>
    );
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <textarea
          placeholder="Enter a title for this card..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          rows={3}
          className="w-full px-3 py-2 bg-white border-none rounded-lg text-sm text-[#172b4d] placeholder-[#44546f] focus:outline-none resize-none"
          style={{ boxShadow: '0px 1px 1px rgba(9,30,66,.25), 0px 0px 1px rgba(9,30,66,.31)' }}
        />
        <div className="flex items-center gap-1 mt-2">
          <button
            type="submit"
            disabled={!title.trim()}
            className="bg-[#0065ff] hover:bg-[#0055d4] disabled:bg-[#f1f2f4] disabled:text-[#a5adba] text-white px-3 py-1.5 rounded text-sm font-medium transition-colors"
          >
            Add card
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="p-1.5 hover:bg-[#dcdfe4] rounded"
          >
            <X className="w-5 h-5 text-[#44546f]" />
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddCard;
