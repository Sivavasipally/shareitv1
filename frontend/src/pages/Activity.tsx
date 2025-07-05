import React, { useState } from 'react';
import { BookOpen, Dice1 as Dice, Clock, CheckSquare, ArrowLeft } from 'lucide-react';

const Activity: React.FC = () => {
  const [filter, setFilter] = useState('all');

  const activities = [
    {
      id: 1,
      type: 'book',
      title: 'The Midnight Library',
      date: '2025-05-15',
      status: 'Borrowed',
      dueDate: '2025-05-29'
    },
    {
      id: 2,
      type: 'boardgame',
      title: 'Catan',
      date: '2025-05-10',
      status: 'Returned',
      returnDate: '2025-05-17'
    },
    {
      id: 3,
      type: 'book',
      title: 'Atomic Habits',
      date: '2025-05-01',
      status: 'Returned',
      returnDate: '2025-05-15'
    },
    {
      id: 4,
      type: 'boardgame',
      title: 'Pandemic',
      date: '2025-04-28',
      status: 'Borrowed',
      dueDate: '2025-05-12'
    },
    {
      id: 5,
      type: 'book',
      title: 'Dune',
      date: '2025-04-15',
      status: 'Returned',
      returnDate: '2025-04-29'
    }
  ];

  const filteredActivities = filter === 'all' 
    ? activities 
    : activities.filter(activity => activity.type === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button 
          onClick={() => window.history.back()}
          className="p-2 text-gray-500 hover:text-blue-800 rounded-full hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Activity History</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filter === 'all'
                  ? 'bg-blue-100 text-blue-800'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('book')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filter === 'book'
                  ? 'bg-blue-100 text-blue-800'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Books
            </button>
            <button
              onClick={() => setFilter('boardgame')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filter === 'boardgame'
                  ? 'bg-blue-100 text-blue-800'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Board Games
            </button>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredActivities.map((activity) => (
            <div key={activity.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {activity.type === 'book' ? (
                    <div className="p-2 bg-blue-100 rounded-full">
                      <BookOpen className="h-5 w-5 text-blue-800" />
                    </div>
                  ) : (
                    <div className="p-2 bg-purple-100 rounded-full">
                      <Dice className="h-5 w-5 text-purple-700" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{activity.title}</h3>
                    <div className="flex items-center mt-1">
                      <Clock className="h-4 w-4 text-gray-400 mr-1" />
                      <p className="text-xs text-gray-500">{activity.date}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  {activity.status === 'Borrowed' ? (
                    <div className="text-right">
                      <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                        Due {activity.dueDate}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center text-green-600">
                      <CheckSquare className="h-5 w-5 mr-1" />
                      <span className="text-xs">Returned {activity.returnDate}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Activity;