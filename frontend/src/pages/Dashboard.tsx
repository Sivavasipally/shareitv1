import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Dice1 as Dice, CheckSquare, Bell, PlusCircle, TrendingUp, Users, Clock, Loader, AlertCircle } from 'lucide-react';
import StatCard from '../components/dashboard/StatCard';
import RecentItem from '../components/dashboard/RecentItem';
import ActivityItem from '../components/dashboard/ActivityItem';
import apiService from '../services/api';

interface DashboardStats {
  books: {
    total: number;
    available: number;
  };
  boardgames: {
    total: number;
    available: number;
  };
  requests: {
    total: number;
    pending: number;
  };
  users: {
    total: number;
    active: number;
  };
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentBooks, setRecentBooks] = useState<any[]>([]);
  const [recentBoardGames, setRecentBoardGames] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch all data in parallel
      const [statsResponse, booksResponse, boardGamesResponse, activitiesResponse] = await Promise.all([
        apiService.getAdminStats().catch(() => ({ data: null })),
        apiService.getBooks({ limit: 3 }),
        apiService.getBoardGames({ limit: 3 }),
        apiService.getActivityLog({ limit: 4 }).catch(() => ({ data: [] }))
      ]);

      // Process stats
      if (statsResponse.data) {
        setStats({
          books: {
            total: statsResponse.data.books?.total || 0,
            available: statsResponse.data.books?.available || 0
          },
          boardgames: {
            total: statsResponse.data.boardgames?.total || 0,
            available: statsResponse.data.boardgames?.available || 0
          },
          requests: {
            total: statsResponse.data.requests?.total || 0,
            pending: statsResponse.data.requests?.pending || 0
          },
          users: {
            total: statsResponse.data.users?.total || 0,
            active: statsResponse.data.users?.active || 0
          }
        });
      } else {
        // Fallback: Calculate stats from books and board games data
        const allBooksResponse = await apiService.getBooks({ limit: 100 });
        const allBoardGamesResponse = await apiService.getBoardGames({ limit: 100 });

        setStats({
          books: {
            total: allBooksResponse.data?.length || 0,
            available: allBooksResponse.data?.filter(b => b.is_available).length || 0
          },
          boardgames: {
            total: allBoardGamesResponse.data?.length || 0,
            available: allBoardGamesResponse.data?.filter(g => g.is_available).length || 0
          },
          requests: {
            total: 0,
            pending: 0
          },
          users: {
            total: 0,
            active: 0
          }
        });
      }

      // Process recent books
      setRecentBooks(booksResponse.data?.slice(0, 3) || []);

      // Process recent board games
      setRecentBoardGames(boardGamesResponse.data?.slice(0, 3) || []);

      // Process recent activities
      if (activitiesResponse.data && activitiesResponse.data.length > 0) {
        setRecentActivities(activitiesResponse.data);
      }

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'added':
      case 'created':
        return <PlusCircle size={16} className="text-purple-500" />;
      case 'borrowed':
      case 'requested':
        return <Bell size={16} className="text-amber-500" />;
      case 'returned':
      case 'approved':
        return <CheckSquare size={16} className="text-green-500" />;
      default:
        return <Clock size={16} className="text-blue-500" />;
    }
  };

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
            onClick={fetchDashboardData}
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
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <div className="flex space-x-2">
          <div className="relative group">
            <button className="px-4 py-2 bg-blue-800 text-white rounded-md hover:bg-blue-900 transition-colors duration-150 flex items-center text-sm">
              <PlusCircle size={16} className="mr-2" />
              Add New Item
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 hidden group-hover:block z-10">
              <Link
                to="/add-book"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Add Book
              </Link>
              <Link
                to="/add-board-game"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Add Board Game
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Books"
          value={stats?.books.total.toString() || '0'}
          icon={<BookOpen size={20} />}
          trend={`${stats?.books.available || 0} available`}
          color="bg-blue-800"
        />
        <StatCard
          title="Board Games"
          value={stats?.boardgames.total.toString() || '0'}
          icon={<Dice size={20} />}
          trend={`${stats?.boardgames.available || 0} available`}
          color="bg-purple-700"
        />
        <StatCard
          title="Pending Requests"
          value={stats?.requests.pending.toString() || '0'}
          icon={<CheckSquare size={20} />}
          trend={`${stats?.requests.total || 0} total requests`}
          color="bg-amber-600"
        />
        <StatCard
          title="Active Users"
          value={stats?.users.active.toString() || '0'}
          icon={<Users size={20} />}
          trend={`${stats?.users.total || 0} total users`}
          color="bg-emerald-600"
        />
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Books */}
        <div className="bg-white rounded-lg shadow-sm p-6 col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Recent Books</h2>
            <Link to="/books" className="text-sm text-blue-700 hover:text-blue-900 hover:underline transition-colors">View all</Link>
          </div>
          <div className="space-y-4">
            {recentBooks.length > 0 ? (
              recentBooks.map((book) => (
                <RecentItem
                  key={book.id}
                  title={book.title}
                  author={book.author}
                  image={book.cover_url || "https://images.pexels.com/photos/1179229/pexels-photo-1179229.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"}
                  status={book.is_available ? "Available" : "Checked Out"}
                />
              ))
            ) : (
              <p className="text-sm text-gray-500">No books added yet</p>
            )}
          </div>
        </div>

        {/* Recent Board Games */}
        <div className="bg-white rounded-lg shadow-sm p-6 col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Recent Board Games</h2>
            <Link to="/board-games" className="text-sm text-blue-700 hover:text-blue-900 hover:underline transition-colors">View all</Link>
          </div>
          <div className="space-y-4">
            {recentBoardGames.length > 0 ? (
              recentBoardGames.map((game) => (
                <RecentItem
                  key={game.id}
                  title={game.title}
                  author={game.designer || "Unknown Designer"}
                  image={game.image_url || "https://images.pexels.com/photos/2309234/pexels-photo-2309234.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"}
                  status={game.is_available ? "Available" : "Checked Out"}
                />
              ))
            ) : (
              <p className="text-sm text-gray-500">No board games added yet</p>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm p-6 col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Recent Activity</h2>
            <Link to="/activity" className="text-sm text-blue-700 hover:text-blue-900 hover:underline transition-colors">View all</Link>
          </div>
          <div className="space-y-4">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity) => (
                <ActivityItem
                  key={activity.id}
                  user={activity.username || 'Unknown User'}
                  action={activity.action}
                  item={activity.details?.title || `${activity.item_type} #${activity.item_id}`}
                  time={formatTimeAgo(activity.created_at)}
                  icon={getActivityIcon(activity.action)}
                />
              ))
            ) : (
              <p className="text-sm text-gray-500">No recent activity</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;