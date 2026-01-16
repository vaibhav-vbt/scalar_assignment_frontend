import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Clock, X, LayoutGrid, FileText, Home, ChevronDown } from 'lucide-react';
import { boardsAPI } from '../api';

const BOARD_BACKGROUNDS = [
  { color: 'linear-gradient(135deg, #0079bf 0%, #5067c5 100%)', name: 'Blue' },
  { color: 'linear-gradient(135deg, #d29034 0%, #cd5a20 100%)', name: 'Orange' },
  { color: 'linear-gradient(135deg, #519839 0%, #3d7a1f 100%)', name: 'Green' },
  { color: 'linear-gradient(135deg, #b04632 0%, #8b2c1e 100%)', name: 'Red' },
  { color: 'linear-gradient(135deg, #89609e 0%, #6b4385 100%)', name: 'Purple' },
  { color: 'linear-gradient(135deg, #cd5a91 0%, #a13a6f 100%)', name: 'Pink' },
  { color: 'linear-gradient(135deg, #00aecc 0%, #0079bf 100%)', name: 'Sky' },
  { color: 'linear-gradient(135deg, #838c91 0%, #5d6468 100%)', name: 'Grey' },
  { color: 'linear-gradient(135deg, #7c3aed 0%, #c026d3 100%)', name: 'Violet' },
];

function BoardsHome() {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [selectedBackground, setSelectedBackground] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBoards();
  }, []);

  const fetchBoards = async () => {
    try {
      const response = await boardsAPI.getAll();
      setBoards(response.data);
    } catch (error) {
      console.error('Error fetching boards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBoard = async () => {
    if (!newBoardTitle.trim()) return;

    try {
      const response = await boardsAPI.create({
        title: newBoardTitle.trim(),
        backgroundColor: BOARD_BACKGROUNDS[selectedBackground].color
      });
      setBoards([...boards, response.data]);
      setShowCreateModal(false);
      setNewBoardTitle('');
      setSelectedBackground(0);
      navigate(`/board/${response.data.id}`);
    } catch (error) {
      console.error('Error creating board:', error);
    }
  };

  const handleDeleteBoard = async (e, boardId) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this board?')) {
      try {
        await boardsAPI.delete(boardId);
        setBoards(boards.filter(b => b.id !== boardId));
      } catch (error) {
        console.error('Error deleting board:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1d2125] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f5f7]">
      {/* Header - Trello Blue */}
      <header className="bg-[#0065ff] h-12 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          {/* App switcher */}
          <button className="p-1 hover:bg-white/20 rounded">
            <LayoutGrid className="w-5 h-5 text-white" />
          </button>

          {/* Logo */}
          <div className="flex items-center gap-1.5 text-white font-bold text-xl">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM10 17H6V7H10V17ZM18 12H14V7H18V12Z" />
            </svg>
            <span>Trello</span>
          </div>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-lg mx-4">
          <input
            type="text"
            placeholder="Search"
            className="w-full bg-white/20 hover:bg-white/30 focus:bg-white focus:text-gray-900 text-white placeholder-white/80 focus:placeholder-gray-400 px-3 py-1.5 rounded text-sm outline-none transition-all"
          />
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded text-sm font-medium"
          >
            Create
          </button>
          <button className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
            U
          </button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-48px)] p-4">
          <nav className="space-y-1">
            <a href="#" className="flex items-center gap-3 px-3 py-2 text-[#172b4d] hover:bg-[#e9f2ff] rounded font-medium">
              <LayoutGrid className="w-4 h-4" />
              Boards
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2 text-[#44546f] hover:bg-gray-100 rounded">
              <FileText className="w-4 h-4" />
              Templates
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2 text-[#44546f] hover:bg-gray-100 rounded">
              <Home className="w-4 h-4" />
              Home
            </a>
          </nav>

          <div className="mt-6">
            <h3 className="px-3 text-xs font-semibold text-[#44546f] uppercase tracking-wide mb-2">Workspaces</h3>
            <div className="flex items-center gap-3 px-3 py-2 text-[#172b4d] hover:bg-gray-100 rounded cursor-pointer">
              <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded text-white text-xs flex items-center justify-center font-bold">T</div>
              <span className="font-medium">Trello Workspace</span>
              <ChevronDown className="w-4 h-4 ml-auto" />
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {/* Recently Viewed */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-[#44546f]" />
              <h2 className="text-base font-semibold text-[#172b4d]">Recently viewed</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {boards.slice(0, 4).map(board => (
                <div
                  key={`recent-${board.id}`}
                  onClick={() => navigate(`/board/${board.id}`)}
                  className="relative group h-24 rounded cursor-pointer overflow-hidden transition-all hover:opacity-90"
                  style={{ background: board.backgroundColor || 'linear-gradient(135deg, #0079bf 0%, #5067c5 100%)' }}
                >
                  <div className="absolute inset-0 bg-black/10"></div>
                  <div className="relative p-2.5 h-full flex flex-col">
                    <span className="text-white font-bold text-sm">{board.title}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Your Workspaces */}
          <div>
            <h2 className="text-xs font-semibold text-[#44546f] uppercase tracking-wide mb-4">YOUR WORKSPACES</h2>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded text-white text-sm flex items-center justify-center font-bold">T</div>
              <span className="font-semibold text-[#172b4d]">Trello Workspace</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {boards.map(board => (
                <div
                  key={board.id}
                  onClick={() => navigate(`/board/${board.id}`)}
                  className="relative group h-24 rounded cursor-pointer overflow-hidden transition-all hover:opacity-90"
                  style={{ background: board.backgroundColor || 'linear-gradient(135deg, #0079bf 0%, #5067c5 100%)' }}
                >
                  <div className="absolute inset-0 bg-black/10"></div>
                  <div className="relative p-2.5 h-full flex flex-col">
                    <span className="text-white font-bold text-sm">{board.title}</span>
                  </div>
                  <button
                    onClick={(e) => handleDeleteBoard(e, board.id)}
                    className="absolute top-2 right-2 p-1 bg-black/30 hover:bg-black/50 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ))}

              {/* Create New Board */}
              <div
                onClick={() => setShowCreateModal(true)}
                className="h-24 rounded bg-[#f1f2f4] hover:bg-[#dcdfe4] cursor-pointer flex items-center justify-center transition-colors"
              >
                <span className="text-[#172b4d] text-sm">Create new board</span>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Create Board Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowCreateModal(false)} />
          <div className="relative bg-white rounded-lg w-full max-w-[304px] shadow-xl overflow-hidden">
            {/* Preview */}
            <div
              className="h-28 p-3 relative"
              style={{ background: BOARD_BACKGROUNDS[selectedBackground].color }}
            >
              {/* Mini board preview */}
              <div className="flex gap-1">
                <div className="w-12 h-8 bg-white/30 rounded-sm"></div>
                <div className="w-12 h-12 bg-white/30 rounded-sm"></div>
                <div className="w-12 h-6 bg-white/30 rounded-sm"></div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="absolute top-2 right-2 p-1 hover:bg-black/20 rounded"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            <div className="p-3">
              {/* Background selector */}
              <div className="mb-3">
                <label className="block text-xs text-[#44546f] font-semibold mb-2">Background</label>
                <div className="flex gap-1 flex-wrap">
                  {BOARD_BACKGROUNDS.map((bg, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedBackground(index)}
                      className={`w-10 h-8 rounded ${selectedBackground === index ? 'ring-2 ring-[#0065ff] ring-offset-2' : ''}`}
                      style={{ background: bg.color }}
                      title={bg.name}
                    />
                  ))}
                </div>
              </div>

              {/* Board title */}
              <div className="mb-4">
                <label className="block text-xs text-[#44546f] font-semibold mb-2">
                  Board title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newBoardTitle}
                  onChange={(e) => setNewBoardTitle(e.target.value)}
                  autoFocus
                  className="w-full px-3 py-2 border-2 border-[#dcdfe4] focus:border-[#0065ff] rounded text-sm outline-none"
                />
                {!newBoardTitle.trim() && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <span>👋</span> Board title is required
                  </p>
                )}
              </div>

              {/* Create button */}
              <button
                onClick={handleCreateBoard}
                disabled={!newBoardTitle.trim()}
                className="w-full bg-[#0065ff] hover:bg-[#0055d4] disabled:bg-[#f1f2f4] disabled:text-[#a5adba] disabled:cursor-not-allowed text-white font-medium py-2 rounded text-sm transition-colors"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BoardsHome;
