import { useState } from 'react';
import { Plus, X } from 'lucide-react';

function AddList({ onAdd }) {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title.trim()) {
      onAdd(title.trim());
      setTitle('');
      setIsAdding(false);
    }
  };

  const handleCancel = () => {
    setTitle('');
    setIsAdding(false);
  };

  if (!isAdding) {
    return (
      <button
        onClick={() => setIsAdding(true)}
        className="w-[272px] min-w-[272px] h-fit bg-white/30 hover:bg-white/50 rounded-xl p-3 flex items-center gap-2 text-white font-medium transition-colors backdrop-blur-sm"
      >
        <Plus className="w-5 h-5" />
        <span>Add another list</span>
      </button>
    );
  }

  return (
    <div className="w-[272px] min-w-[272px] bg-[#f1f2f4] rounded-xl p-2">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter list title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
          className="w-full px-3 py-2 bg-white border-2 border-[#0065ff] rounded-lg text-sm text-[#172b4d] placeholder-[#44546f] focus:outline-none mb-2"
        />
        <div className="flex items-center gap-1">
          <button
            type="submit"
            disabled={!title.trim()}
            className="bg-[#0065ff] hover:bg-[#0055d4] disabled:bg-[#f1f2f4] disabled:text-[#a5adba] text-white px-3 py-1.5 rounded text-sm font-medium transition-colors"
          >
            Add list
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

export default AddList;
