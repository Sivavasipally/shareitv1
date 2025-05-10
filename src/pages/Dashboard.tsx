import React from 'react';
import { Book, Puzzle as PuzzlePiece, Clock, Bell, Search } from 'lucide-react';
import { useUser } from '../context/UserContext';
import BookCard from '../components/BookCard';
import BoardGameCard from '../components/BoardGameCard';
import NotificationCard from '../components/NotificationCard';
import RecommendedItem from '../components/RecommendedItem';

const Dashboard = () => {
  const { user } = useUser();

  // Mock data - in a real app, this would come from an API
  const pendingRequests = [
    { id: '1', type: 'book', title: 'The Alchemist', requester: 'Jane Smith', requestDate: '2025-05-10' },
    { id: '2', type: 'board', title: 'Catan', requester: 'John Doe', requestDate: '2025-05-11' },
  ];

  const notifications = [
    { id: '1', message: 'Your request for "Harry Potter" was approved', time: '2 hours ago', isRead: false },
    { id: '2', message: 'Mark returned "Monopoly"', time: '1 day ago', isRead: true },
    { id: '3', message: 'New board game added in your area', time: '2 days ago', isRead: true },
  ];

  const recommendedBooks = [
    { id: '1', title: 'Dune', author: 'Frank Herbert', coverUrl: 'https://images.pexels.com/photos/3747139/pexels-photo-3747139.jpeg?auto=compress&cs=tinysrgb&w=150', owner: 'Alex Chen' },
    { id: '2', title: 'The Hobbit', author: 'J.R.R. Tolkien', coverUrl: 'https://images.pexels.com/photos/3747463/pexels-photo-3747463.jpeg?auto=compress&cs=tinysrgb&w=150', owner: 'Sarah Wong' },
    { id: '3', title: 'Pride and Prejudice', author: 'Jane Austen', coverUrl: 'https://images.pexels.com/photos/3747468/pexels-photo-3747468.jpeg?auto=compress&cs=tinysrgb&w=150', owner: 'Mike Johnson' },
  ];

  const recommendedBoards = [
    { id: '1', title: 'Ticket to Ride', type: 'Strategy', imageUrl: 'https://images.pexels.com/photos/4691567/pexels-photo-4691567.jpeg?auto=compress&cs=tinysrgb&w=150', owner: 'David Kim' },
    { id: '2', title: 'Pandemic', type: 'Cooperative', imageUrl: 'https://images.pexels.com/photos/6686138/pexels-photo-6686138.jpeg?auto=compress&cs=tinysrgb&w=150', owner: 'Lisa Chen' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-white shadow-lg">
        <h1 className="text-2xl md:text-3xl font-heading font-bold mb-2">
          Welcome back, {user?.username || 'Friend'}!
        </h1>
        <p className="text-white/90 max-w-2xl">
          Discover books and board games shared by your community. Add your collection and start sharing today!
        </p>
        
        <div className="mt-6 flex flex-wrap gap-4">
          <button className="btn bg-white text-primary-700 hover:bg-gray-100 flex items-center gap-2">
            <Book size={18} />
            <span>Add Books</span>
          </button>
          <button className="btn bg-white text-primary-700 hover:bg-gray-100 flex items-center gap-2">
            <PuzzlePiece size={18} />
            <span>Add Board Games</span>
          </button>
          <button className="btn bg-secondary-500 hover:bg-secondary-600 flex items-center gap-2">
            <Search size={18} />
            <span>Find Items</span>
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Requests Section */}
        <section className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-heading font-bold text-gray-800 flex items-center">
              <Clock size={20} className="mr-2 text-primary-600" />
              Pending Requests
            </h2>
            {pendingRequests.length > 0 && (
              <span className="badge bg-primary-100 text-primary-800">
                {pendingRequests.length} Requests
              </span>
            )}
          </div>

          {pendingRequests.length > 0 ? (
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <div key={request.id} className="card p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center gap-3">
                    {request.type === 'book' ? (
                      <Book size={24} className="text-primary-600" />
                    ) : (
                      <PuzzlePiece size={24} className="text-secondary-500" />
                    )}
                    <div>
                      <h3 className="font-medium">{request.title}</h3>
                      <p className="text-sm text-gray-600">
                        Requested by {request.requester} on {new Date(request.requestDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button className="btn btn-primary flex-1 sm:flex-initial">Approve</button>
                    <button className="btn btn-outline flex-1 sm:flex-initial">Decline</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card p-6 text-center">
              <p className="text-gray-600">You have no pending requests at the moment.</p>
            </div>
          )}
        </section>

        {/* Notifications Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-heading font-bold text-gray-800 flex items-center">
              <Bell size={20} className="mr-2 text-primary-600" />
              Notifications
            </h2>
            {notifications.filter(n => !n.isRead).length > 0 && (
              <span className="badge bg-error-100 text-error-800">
                {notifications.filter(n => !n.isRead).length} New
              </span>
            )}
          </div>

          <div className="space-y-3">
            {notifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                message={notification.message}
                time={notification.time}
                isRead={notification.isRead}
              />
            ))}
          </div>
        </section>
      </div>

      {/* Recommended Books Section */}
      <section>
        <h2 className="text-xl font-heading font-bold text-gray-800 mb-4 flex items-center">
          <Book size={20} className="mr-2 text-primary-600" />
          Recommended Books Based on Your Interests
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendedBooks.map((book) => (
            <BookCard
              key={book.id}
              title={book.title}
              author={book.author}
              coverUrl={book.coverUrl}
              owner={book.owner}
            />
          ))}
        </div>
      </section>

      {/* Recommended Board Games Section */}
      <section>
        <h2 className="text-xl font-heading font-bold text-gray-800 mb-4 flex items-center">
          <PuzzlePiece size={20} className="mr-2 text-secondary-500" />
          Recommended Board Games
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendedBoards.map((board) => (
            <BoardGameCard
              key={board.id}
              title={board.title}
              type={board.type}
              imageUrl={board.imageUrl}
              owner={board.owner}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;