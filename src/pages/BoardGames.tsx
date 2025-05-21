import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  PlusCircle, 
  SortDesc, 
  Grid, 
  List,
  Users,
  ChevronDown
} from 'lucide-react';
import { Link } from 'react-router-dom';

const BoardGames: React.FC = () => {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [selectedComplexity, setSelectedComplexity] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPlayers, setSelectedPlayers] = useState('all');
  const [sortBy, setSortBy] = useState('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Sample data
  const boardGames = [
    {
      id: 1,
      title: 'Catan',
      designer: 'Klaus Teuber',
      players: '3-4',
      duration: '60-120 min',
      complexity: 'Medium',
      status: 'Available',
      image: 'https://images.pexels.com/photos/2309234/pexels-photo-2309234.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
    },
    // ... (rest of the board games data)
  ];

  const filteredGames = boardGames
    .filter(game => {
      const matchesSearch = game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          game.designer.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesComplexity = selectedComplexity === 'all' || game.complexity === selectedComplexity;
      const matchesStatus = selectedStatus === 'all' || game.status === selectedStatus;
      const matchesPlayers = selectedPlayers === 'all' || game.players.includes(selectedPlayers);
      return matchesSearch && matchesComplexity && matchesStatus && matchesPlayers;
    })
    .sort((a, b) => {
      const order = sortOrder === 'asc' ? 1 : -1;
      switch (sortBy) {
        case 'title':
          return order * a.title.localeCompare(b.title);
        case 'designer':
          return order * a.designer.localeCompare(b.designer);
        case 'complexity':
          const complexityOrder = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };
          return order * (complexityOrder[a.complexity as keyof typeof complexityOrder] - complexityOrder[b.complexity as keyof typeof complexityOrder]);
        default:
          return 0;
      }
    });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Board Games</h1>
        <div className="flex space-x-2">
          <Link 
            to="/add-board-game"
            className="px-4 py-2 bg-blue-800 text-white rounded-md hover:bg-blue-900 transition-colors duration-150 flex items-center text-sm"
          >
            <PlusCircle size={16} className="mr-2" />
            Add Board Game
          </Link>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white sm:text-sm transition-colors duration-200"
            placeholder="Search board games by title, designer, or complexity..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex space-x-2">
          {/* Filter Button */}
          <div className="relative">
            <button 
              className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 flex items-center text-sm hover:bg-gray-50 transition-colors"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={16} className="mr-2 text-gray-500" />
              Filter
              <ChevronDown size={16} className="ml-2 text-gray-500" />
            </button>
            
            {showFilters && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50">
                <div className="px-4 py-2 border-b border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-800">Complexity</h3>
                  <select
                    value={selectedComplexity}
                    onChange={(e) => setSelectedComplexity(e.target.value)}
                    className="mt-1 block w-full text-sm border-gray-300 rounded-md"
                  >
                    <option value="all">All Levels</option>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
                <div className="px-4 py-2 border-b border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-800">Players</h3>
                  <select
                    value={selectedPlayers}
                    onChange={(e) => setSelectedPlayers(e.target.value)}
                    className="mt-1 block w-full text-sm border-gray-300 rounded-md"
                  >
                    <option value="all">Any Number</option>
                    <option value="2">2 Players</option>
                    <option value="3">3 Players</option>
                    <option value="4">4 Players</option>
                    <option value="5">5+ Players</option>
                  </select>
                </div>
                <div className="px-4 py-2">
                  <h3 className="text-sm font-semibold text-gray-800">Status</h3>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="mt-1 block w-full text-sm border-gray-300 rounded-md"
                  >
                    <option value="all">All Status</option>
                    <option value="Available">Available</option>
                    <option value="Checked Out">Checked Out</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Sort Button */}
          <div className="relative">
            <button 
              className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 flex items-center text-sm hover:bg-gray-50 transition-colors"
              onClick={() => setShowSort(!showSort)}
            >
              <SortDesc size={16} className="mr-2 text-gray-500" />
              Sort
              <ChevronDown size={16} className="ml-2 text-gray-500" />
            </button>
            
            {showSort && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50">
                <button
                  className={`block w-full text-left px-4 py-2 text-sm ${sortBy === 'title' ? 'text-blue-800 bg-blue-50' : 'text-gray-700 hover:bg-gray-50'}`}
                  onClick={() => {
                    setSortBy('title');
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  }}
                >
                  Title {sortBy === 'title' && (sortOrder === 'asc' ? '↑' : '↓')}
                </button>
                <button
                  className={`block w-full text-left px-4 py-2 text-sm ${sortBy === 'designer' ? 'text-blue-800 bg-blue-50' : 'text-gray-700 hover:bg-gray-50'}`}
                  onClick={() => {
                    setSortBy('designer');
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  }}
                >
                  Designer {sortBy === 'designer' && (sortOrder === 'asc' ? '↑' : '↓')}
                </button>
                <button
                  className={`block w-full text-left px-4 py-2 text-sm ${sortBy === 'complexity' ? 'text-blue-800 bg-blue-50' : 'text-gray-700 hover:bg-gray-50'}`}
                  onClick={() => {
                    setSortBy('complexity');
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  }}
                >
                  Complexity {sortBy === 'complexity' && (sortOrder === 'asc' ? '↑' : '↓')}
                </button>
              </div>
            )}
          </div>

          {/* View Toggle */}
          <div className="bg-white border border-gray-300 rounded-md flex">
            <button 
              className={`p-2 ${view === 'grid' ? 'bg-gray-100 text-blue-800' : 'text-gray-500 hover:bg-gray-50'}`}
              onClick={() => setView('grid')}
            >
              <Grid size={16} />
            </button>
            <button 
              className={`p-2 ${view === 'list' ? 'bg-gray-100 text-blue-800' : 'text-gray-500 hover:bg-gray-50'}`}
              onClick={() => setView('list')}
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Board Games Grid/List */}
      {view === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredGames.map(game => (
            <div key={game.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
              <div className="h-40 overflow-hidden">
                <img src={game.image} alt={game.title} className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" />
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-md font-semibold text-gray-800">{game.title}</h3>
                  <span 
                    className={`text-xs rounded-full px-2 py-1 ${
                      game.status === 'Available' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {game.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">{game.designer}</p>
                <div className="mt-3 flex justify-between items-center">
                  <span className="text-xs flex items-center">
                    <Users size={12} className="mr-1 text-gray-500" />
                    {game.players}
                  </span>
                  <span className="text-xs bg-gray-100 text-gray-700 rounded-full px-2 py-1">{game.complexity}</span>
                  <span className="text-xs text-gray-500">{game.duration}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title & Designer
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Players
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Complexity
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredGames.map(game => (
                <tr key={game.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <img className="h-10 w-10 rounded object-cover" src={game.image} alt={game.title} />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{game.title}</div>
                        <div className="text-sm text-gray-500">{game.designer}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{game.players}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{game.duration}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span 
                      className={`px-2 py-1 text-xs rounded-full ${
                        game.complexity === 'Easy' 
                          ? 'bg-green-100 text-green-800' 
                          : game.complexity === 'Medium'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {game.complexity}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span 
                      className={`px-2 py-1 text-xs rounded-full ${
                        game.status === 'Available' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {game.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BoardGames;