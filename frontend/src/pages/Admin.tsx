import React, { useState } from 'react';
import { Plus, X, Check, Users } from 'lucide-react';

interface Genre {
  id: string;
  name: string;
}

interface Complexity {
  id: string;
  name: string;
  description: string;
}

interface PendingUser {
  id: string;
  name: string;
  email: string;
  requestDate: string;
}

const Admin: React.FC = () => {
  const [genres, setGenres] = useState<Genre[]>([
    { id: '1', name: 'Fiction' },
    { id: '2', name: 'Non-Fiction' },
    { id: '3', name: 'Science Fiction' }
  ]);
  const [newGenre, setNewGenre] = useState('');

  const [complexities, setComplexities] = useState<Complexity[]>([
    { id: '1', name: 'Easy', description: 'Simple rules, quick to learn' },
    { id: '2', name: 'Medium', description: 'Moderate complexity, some strategy required' },
    { id: '3', name: 'Hard', description: 'Complex rules, deep strategy' }
  ]);
  const [newComplexity, setNewComplexity] = useState({ name: '', description: '' });

  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      requestDate: '2025-03-15'
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      requestDate: '2025-03-14'
    }
  ]);

  const addGenre = () => {
    if (newGenre.trim()) {
      setGenres([...genres, { id: Date.now().toString(), name: newGenre.trim() }]);
      setNewGenre('');
    }
  };

  const removeGenre = (id: string) => {
    setGenres(genres.filter(genre => genre.id !== id));
  };

  const addComplexity = () => {
    if (newComplexity.name.trim() && newComplexity.description.trim()) {
      setComplexities([...complexities, { id: Date.now().toString(), ...newComplexity }]);
      setNewComplexity({ name: '', description: '' });
    }
  };

  const removeComplexity = (id: string) => {
    setComplexities(complexities.filter(complexity => complexity.id !== id));
  };

  const approveUser = (id: string) => {
    setPendingUsers(pendingUsers.filter(user => user.id !== id));
  };

  const rejectUser = (id: string) => {
    setPendingUsers(pendingUsers.filter(user => user.id !== id));
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>

      {/* Genres Management */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Manage Genres</h2>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newGenre}
            onChange={(e) => setNewGenre(e.target.value)}
            placeholder="Add new genre"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={addGenre}
            className="px-4 py-2 bg-blue-800 text-white rounded-md hover:bg-blue-900 transition-colors flex items-center"
          >
            <Plus size={16} className="mr-1" />
            Add
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {genres.map(genre => (
            <div
              key={genre.id}
              className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md"
            >
              <span>{genre.name}</span>
              <button
                onClick={() => removeGenre(genre.id)}
                className="text-red-600 hover:text-red-800"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Complexities Management */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Manage Complexities</h2>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newComplexity.name}
            onChange={(e) => setNewComplexity({ ...newComplexity, name: e.target.value })}
            placeholder="Complexity name"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            value={newComplexity.description}
            onChange={(e) => setNewComplexity({ ...newComplexity, description: e.target.value })}
            placeholder="Description"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={addComplexity}
            className="px-4 py-2 bg-blue-800 text-white rounded-md hover:bg-blue-900 transition-colors flex items-center"
          >
            <Plus size={16} className="mr-1" />
            Add
          </button>
        </div>
        <div className="space-y-2">
          {complexities.map(complexity => (
            <div
              key={complexity.id}
              className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-md"
            >
              <div>
                <h3 className="font-medium text-gray-800">{complexity.name}</h3>
                <p className="text-sm text-gray-600">{complexity.description}</p>
              </div>
              <button
                onClick={() => removeComplexity(complexity.id)}
                className="text-red-600 hover:text-red-800"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Pending Users */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Pending User Approvals</h2>
          <div className="flex items-center text-sm text-gray-600">
            <Users size={16} className="mr-1" />
            {pendingUsers.length} pending
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Request Date
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pendingUsers.map(user => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{user.requestDate}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => approveUser(user.id)}
                      className="text-green-600 hover:text-green-900 mr-3"
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={() => rejectUser(user.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <X size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Admin;