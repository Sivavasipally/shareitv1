import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  PlusCircle,
  SortDesc,
  Grid,
  List,
  ChevronDown,
  Loader,
  AlertCircle,
  BookOpen
} from 'lucide-react';
import { Link } from 'react-router-dom';
import apiService from '../services/api';
import { useUser } from '../context/UserContext';

interface Book {
  id: number;
  title: string;
  author: string;
  isbn?: string;
  genre?: string;
  publication_year?: number;
  language?: string;
  description?: string;
  cover_url?: string;
  owner_id: number;
  owner_name: string;
  is_available: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
}

const Books: React.FC = () => {
  const { user } = useUser();
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [books, setBooks] = useState<Book[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBooks();
    fetchGenres();
  }, [searchTerm, selectedGenre, selectedStatus]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      setError('');

      const params: any = {
        limit: 50,
        offset: 0
      };

      if (searchTerm) {
        params.search = searchTerm;
      }
      if (selectedGenre !== 'all') {
        params.genre = selectedGenre;
      }
      if (selectedStatus !== 'all') {
        params.available = selectedStatus === 'available';
      }

      const response = await apiService.getBooks(params);
      setBooks(response.data || []);
    } catch (err) {
      console.error('Error fetching books:', err);
      setError('Failed to load books. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchGenres = async () => {
    try {
      const response = await apiService.get('/api/books/genres/list');
      const genreList = response.data.map((g: any) => g.genre).filter(Boolean);
      setGenres(genreList);
    } catch (err) {
      console.error('Error fetching genres:', err);
    }
  };

  const handleRequest = async (bookId: number) => {
    try {
      const requestData = {
        item_type: 'book',
        item_id: bookId,
        pickup_date: new Date().toISOString().split('T')[0],
        return_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: 'Request from books page'
      };

      await apiService.createRequest(requestData);
      alert('Request sent successfully!');
      fetchBooks();
    } catch (err: any) {
      alert(err.message || 'Failed to send request');
    }
  };

  const sortedBooks = [...books].sort((a, b) => {
    const order = sortOrder === 'asc' ? 1 : -1;
    switch (sortBy) {
      case 'title':
        return order * a.title.localeCompare(b.title);
      case 'author':
        return order * a.author.localeCompare(b.author);
      case 'year':
        return order * ((a.publication_year || 0) - (b.publication_year || 0));
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="animate-spin h-8 w-8 text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-700">{error}</p>
          <button
            onClick={fetchBooks}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

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
            placeholder="Search books by title or author..."
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
                    {genres.map(genre => (
                      <option key={genre} value={genre}>{genre}</option>
                    ))}
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
                    <option value="available">Available</option>
                    <option value="checked-out">Checked Out</option>
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
                    setShowSort(false);
                  }}
                >
                  Title {sortBy === 'title' && (sortOrder === 'asc' ? '↑' : '↓')}
                </button>
                <button
                  className={`block w-full text-left px-4 py-2 text-sm ${sortBy === 'author' ? 'text-blue-800 bg-blue-50' : 'text-gray-700 hover:bg-gray-50'}`}
                  onClick={() => {
                    setSortBy('author');
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    setShowSort(false);
                  }}
                >
                  Author {sortBy === 'author' && (sortOrder === 'asc' ? '↑' : '↓')}
                </button>
                <button
                  className={`block w-full text-left px-4 py-2 text-sm ${sortBy === 'year' ? 'text-blue-800 bg-blue-50' : 'text-gray-700 hover:bg-gray-50'}`}
                  onClick={() => {
                    setSortBy('year');
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    setShowSort(false);
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
          {sortedBooks.map(book => (
            <div key={book.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
              <div className="h-48 overflow-hidden bg-gray-100">
                {book.cover_url ? (
                  <img
                    src={book.cover_url}
                    alt={book.title}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen size={48} className="text-gray-400" />
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-md font-semibold text-gray-800 line-clamp-2 flex-1">{book.title}</h3>
                  <span
                    className={`text-xs rounded-full px-2 py-1 ml-2 ${
                      book.is_available
                        ? 'bg-green-100 text-green-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {book.is_available ? 'Available' : 'Checked Out'}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-2">{book.author}</p>
                <div className="flex justify-between items-center mb-3">
                  {book.genre && (
                    <span className="text-xs bg-gray-100 text-gray-700 rounded-full px-2 py-1">{book.genre}</span>
                  )}
                  {book.publication_year && (
                    <span className="text-xs text-gray-500">{book.publication_year}</span>
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-500">by {book.owner_name}</p>
                  {book.is_available && book.owner_id !== parseInt(user?.id || '0') && (
                    <button
                      onClick={() => handleRequest(book.id)}
                      className="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      Request
                    </button>
                  )}
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
                  Owner
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedBooks.map(book => (
                <tr key={book.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        {book.cover_url ? (
                          <img className="h-10 w-10 rounded object-cover" src={book.cover_url} alt={book.title} />
                        ) : (
                          <div className="h-10 w-10 rounded bg-gray-100 flex items-center justify-center">
                            <BookOpen size={20} className="text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{book.title}</div>
                        <div className="text-sm text-gray-500">{book.author}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{book.genre || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{book.publication_year || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{book.owner_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        book.is_available
                          ? 'bg-green-100 text-green-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {book.is_available ? 'Available' : 'Checked Out'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {book.is_available && book.owner_id !== parseInt(user?.id || '0') ? (
                      <button
                        onClick={() => handleRequest(book.id)}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Request
                      </button>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {sortedBooks.length === 0 && (
        <div className="text-center py-12">
          <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">No books found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default Books;