import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Filter, LayoutGrid, Bell, HelpCircle, Plus, ChevronDown, Star, Users, MoreHorizontal } from 'lucide-react';

function Header({ boardTitle, boardColor, onSearch, onFilterChange, labels, members, showBoardControls = false }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [filters, setFilters] = useState({
    labelId: '',
    memberId: '',
    dueDate: ''
  });
  const navigate = useNavigate();

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    if (onSearch) onSearch(e.target.value);
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    if (onFilterChange) onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters = { labelId: '', memberId: '', dueDate: '' };
    setFilters(emptyFilters);
    if (onFilterChange) onFilterChange(emptyFilters);
  };

  const hasActiveFilters = filters.labelId || filters.memberId || filters.dueDate;

  return (
    <>
      {/* Main Header - Always blue or transparent on board */}
      <header className={`h-12 flex items-center justify-between px-2 ${showBoardControls ? 'bg-black/30 backdrop-blur-sm' : 'bg-[#0065ff]'}`}>
        {/* Left section */}
        <div className="flex items-center gap-1">
          <button className="p-1.5 hover:bg-white/20 rounded">
            <LayoutGrid className="w-4 h-4 text-white" />
          </button>

          <Link to="/" className="flex items-center gap-1 text-white font-bold text-xl px-2 py-1 hover:bg-white/20 rounded">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM10 17H6V7H10V17ZM18 12H14V7H18V12Z" />
            </svg>
            <span>Trello</span>
          </Link>

          {/* Workspaces dropdown */}
          <button className="hidden md:flex items-center gap-1 px-3 py-1.5 text-white text-sm hover:bg-white/20 rounded">
            Workspaces <ChevronDown className="w-4 h-4" />
          </button>

          {/* Recent dropdown */}
          <button className="hidden md:flex items-center gap-1 px-3 py-1.5 text-white text-sm hover:bg-white/20 rounded">
            Recent <ChevronDown className="w-4 h-4" />
          </button>

          {/* Create button */}
          <button className="bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded text-sm font-medium">
            Create
          </button>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-1">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/70" />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-40 md:w-56 focus:w-64 bg-white/20 hover:bg-white/30 focus:bg-white focus:text-gray-900 text-white placeholder-white/70 focus:placeholder-gray-400 pl-8 pr-3 py-1.5 rounded text-sm outline-none transition-all"
            />
          </div>

          {/* Notifications */}
          <button className="p-1.5 hover:bg-white/20 rounded">
            <Bell className="w-4 h-4 text-white" />
          </button>

          {/* Help */}
          <button className="p-1.5 hover:bg-white/20 rounded">
            <HelpCircle className="w-4 h-4 text-white" />
          </button>

          {/* User */}
          <button className="w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold ml-1">
            U
          </button>
        </div>
      </header>

      {/* Board Header - Only shown on board view */}
      {showBoardControls && (
        <div className="h-12 px-3 flex items-center gap-2 bg-black/20">
          {/* Board title */}
          <h1 className="text-white font-bold text-lg px-2 py-1 hover:bg-white/20 rounded cursor-pointer">
            {boardTitle}
          </h1>

          <button className="p-1.5 hover:bg-white/20 rounded">
            <Star className="w-4 h-4 text-white" />
          </button>

          <button className="flex items-center gap-1 px-2.5 py-1 hover:bg-white/20 rounded text-white text-sm">
            <Users className="w-4 h-4" />
            Workspace visible
          </button>

          <span className="text-white/50 mx-1">|</span>

          {/* Board members */}
          <div className="flex -space-x-1">
            <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold border-2 border-white/20">J</div>
            <div className="w-7 h-7 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs font-bold border-2 border-white/20">S</div>
          </div>

          <div className="flex-1" />

          {/* Filter button */}
          <div className="relative">
            <button
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm text-white hover:bg-white/20 ${hasActiveFilters ? 'bg-white/30' : ''}`}
            >
              <Filter className="w-4 h-4" />
              Filters
              {hasActiveFilters && <span className="w-2 h-2 bg-[#e774bb] rounded-full"></span>}
            </button>

            {showFilterMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowFilterMenu(false)} />
                <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-50 border border-[#dcdfe4]">
                  <div className="p-3 border-b flex justify-between items-center">
                    <span className="font-semibold text-[#172b4d]">Filter</span>
                    {hasActiveFilters && (
                      <button onClick={clearFilters} className="text-sm text-[#0065ff] hover:underline">
                        Clear all
                      </button>
                    )}
                  </div>

                  <div className="p-3 space-y-4">
                    {/* Label Filter */}
                    <div>
                      <label className="block text-xs font-semibold text-[#44546f] mb-2">Label</label>
                      <select
                        value={filters.labelId}
                        onChange={(e) => handleFilterChange('labelId', e.target.value)}
                        className="w-full border border-[#dcdfe4] rounded px-3 py-2 text-sm text-[#172b4d] focus:outline-none focus:border-[#0065ff]"
                      >
                        <option value="">All labels</option>
                        {labels?.map(label => (
                          <option key={label.id} value={label.id}>
                            {label.name || 'Unnamed'}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Member Filter */}
                    <div>
                      <label className="block text-xs font-semibold text-[#44546f] mb-2">Member</label>
                      <select
                        value={filters.memberId}
                        onChange={(e) => handleFilterChange('memberId', e.target.value)}
                        className="w-full border border-[#dcdfe4] rounded px-3 py-2 text-sm text-[#172b4d] focus:outline-none focus:border-[#0065ff]"
                      >
                        <option value="">All members</option>
                        {members?.map(member => (
                          <option key={member.id} value={member.id}>{member.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Due Date Filter */}
                    <div>
                      <label className="block text-xs font-semibold text-[#44546f] mb-2">Due date</label>
                      <select
                        value={filters.dueDate}
                        onChange={(e) => handleFilterChange('dueDate', e.target.value)}
                        className="w-full border border-[#dcdfe4] rounded px-3 py-2 text-sm text-[#172b4d] focus:outline-none focus:border-[#0065ff]"
                      >
                        <option value="">Any due date</option>
                        <option value="overdue">Overdue</option>
                        <option value="today">Due today</option>
                        <option value="week">Due this week</option>
                        <option value="noduedate">No due date</option>
                      </select>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <button className="p-1.5 hover:bg-white/20 rounded text-white text-sm">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      )}
    </>
  );
}

export default Header;
