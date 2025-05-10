import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  PlusCircle, 
  SortDesc, 
  Grid, 
  List,
  Users
} from 'lucide-react';

const BoardGames: React.FC = () => {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');

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
    {
      id: 2,
      title: 'Ticket to Ride',
      designer: 'Alan R. Moon',
      players: '2-5',
      duration: '30-60 min',
      complexity: 'Easy',
      status: 'Checked Out',
      image: 'https://images.pexels.com/photos/6333080/pexels-photo-6333080.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
    },
    {
      id: 3,
      title: 'Pandemic',
      designer: 'Matt Leacock',
      players: '2-4',
      duration: '45-60 min',
      complexity: 'Medium',
      status: 'Available',
      image: 'https://images.pexels.com/photos/6686455/pexels-photo-6686455.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
    },
    {
      id: 4,
      title: 'Scythe',
      designer: 'Jamey Stegmaier',
      players: '1-5',
      duration: '90-115 min',
      complexity: 'Hard',
      status: 'Available',
      image: 'https://images.pexels.com/photos/3902883/pexels-photo-3902883.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
    },
    {
      id: 5,
      title: 'Azul',
      designer: 'Michael Kiesling',
      players: '2-4',
      duration: '30-45 min',
      complexity: 'Easy',
      status: 'Checked Out',
      image: 'https://images.pexels.com/photos/5638642/pexels-photo-5638642.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
    },
    {
      id: 6,
      title: 'Gloomhaven',
      designer: 'Isaac Childres',
      players: '1-4',
      duration: '60-120 min',
      complexity: 'Hard',
      status: 'Available',
      image: 'https://images.pexels.com/photos/4834892/pexels-photo-4834892.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Board Games</h1>
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-blue-800 text-white rounded-md hover:bg-blue-900 transition-colors duration-150 flex items-center text-sm">
            <PlusCircle size={16} className="mr-2" />
            Add Board Game
          </button>
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
          <button className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 flex items-center text-sm hover:bg-gray-50 transition-colors">
            <Filter size={16} className="mr-2 text-gray-500" />
            Filter
          </button>
          <button className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 flex items-center text-sm hover:bg-gray-50 transition-colors">
            <SortDesc size={16} className="mr-2 text-gray-500" />
            Sort
          </button>
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
          {boardGames.map(game => (
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
              {boardGames.map(game => (
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