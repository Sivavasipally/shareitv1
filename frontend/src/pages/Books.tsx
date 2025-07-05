import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  PlusCircle, 
  SortDesc, 
  Grid, 
  List,
  ChevronDown
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Books: React.FC = () => {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Sample data
  const books = [
    {
      id: 1,
      title: 'The Midnight Library',
      author: 'Matt Haig',
      genre: 'Fiction',
      year: 2020,
      status: 'Available',
      image: 'https://images.pexels.com/photos/1179229/pexels-photo-1179229.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
    },
    // ... (rest of the books data)
  ];

  const filteredBooks = books
    .filter(book => {
      const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          book.author.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGenre = selectedGenre === 'all' || book.genre === selectedGenre;
      const matchesStatus = selectedStatus === 'all' || book.status === selectedStatus;
      return matchesSearch && matchesGenre && matchesStatus;
    })
    .sort((a, b) => {
      const order = sortOrder === 'asc' ? 1 : -1;
      switch (sortBy) {
        case 'title':
          return order * a.title.localeCompare(b.title);
        case 'author':
          return order * a.author.localeCompare(b.author);
        case 'year':
          return order * (a.year - b.year);
        default:
          return 0;
      }
    });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Books</h1>
        <div className="flex space-x-2">
          <Link 
            to="/add-book"
            className="px-4 py-2 bg-blue-800 text-white rounded-md hover:bg-blue-900 transition-colors duration-150 flex items-center text-sm"
          >
            <PlusCircle size={16} className="mr-2" />
            Add Book
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
            placeholder="Search books by title, author, or genre..."
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
                  <h3 className="text-sm font-semibold text-gray-800">Genre</h3>
                  <select
                    value={selectedGenre}
                    onChange={(e) => setSelectedGenre(e.target.value)}
                    className="mt-1 block w-full text-sm border-gray-300 rounded-md"
                  >
                    <option value="all">All Genres</option>
                    <option value="Fiction">Fiction</option>
                    <option value="Non-Fiction">Non-Fiction</option>
                    <option value="Science Fiction">Science Fiction</option>
                    <option value="Fantasy">Fantasy</option>
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
                  className={`block w-full text-left px-4 py-2 text-sm ${sortBy === 'author' ? 'text-blue-800 bg-blue-50' : 'text-gray-700 hover:bg-gray-50'}`}
                  onClick={() => {
                    setSortBy('author');
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  }}
                >
                  Author {sortBy === 'author' && (sortOrder === 'asc' ? '↑' : '↓')}
                </button>
                <button
                  className={`block w-full text-left px-4 py-2 text-sm ${sortBy === 'year' ? 'text-blue-800 bg-blue-50' : 'text-gray-700 hover:bg-gray-50'}`}
                  onClick={() => {
                    setSortBy('year');
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  }}
                >
                  Year {sortBy === 'year' && (sortOrder === 'asc' ? '↑' : '↓')}
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

      {/* Books Grid/List */}
      {view === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredBooks.map(book => (
            <div key={book.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
              <div className="h-40 overflow-hidden">
                <img src={book.image} alt={book.title} className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" />
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-md font-semibold text-gray-800">{book.title}</h3>
                  <span 
                    className={`text-xs rounded-full px-2 py-1 ${
                      book.status === 'Available' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {book.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">{book.author}</p>
                <div className="mt-2 flex justify-between items-center">
                  <span className="text-xs bg-gray-100 text-gray-700 rounded-full px-2 py-1">{book.genre}</span>
                  <span className="text-xs text-gray-500">{book.year}</span>
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
                  Title & Author
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Genre
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Year
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBooks.map(book => (
                <tr key={book.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <img className="h-10 w-10 rounded object-cover" src={book.image} alt={book.title} />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{book.title}</div>
                        <div className="text-sm text-gray-500">{book.author}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{book.genre}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{book.year}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span 
                      className={`px-2 py-1 text-xs rounded-full ${
                        book.status === 'Available' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {book.status}
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

export default Books;