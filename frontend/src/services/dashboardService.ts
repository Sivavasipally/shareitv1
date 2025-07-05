import apiService from './api';

interface DashboardStats {
  totalBooks: number;
  totalBoardGames: number;
  pendingRequests: number;
  activeUsers: number;
  recentActivities: Array<{
    id: number;
    user: string;
    action: string;
    item: string;
    time: string;
    type: 'book' | 'boardgame';
  }>;
  recentBooks: Array<{
    id: number;
    title: string;
    author: string;
    image: string;
    status: 'Available' | 'Checked Out';
  }>;
  recentBoardGames: Array<{
    id: number;
    title: string;
    designer: string;
    image: string;
    status: 'Available' | 'Checked Out';
  }>;
}

class DashboardService {
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      // Get stats from admin endpoint if available
      const statsResponse = await apiService.getAdminStats();

      // Get recent books
      const booksResponse = await apiService.getBooks({ available: undefined });
      const recentBooks = booksResponse.data?.slice(0, 3).map(book => ({
        id: book.id,
        title: book.title,
        author: book.author,
        image: book.cover_url || 'https://images.pexels.com/photos/1179229/pexels-photo-1179229.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        status: book.is_available ? 'Available' as const : 'Checked Out' as const
      })) || [];

      // Get recent board games
      const boardGamesResponse = await apiService.getBoardGames({ available: undefined });
      const recentBoardGames = boardGamesResponse.data?.slice(0, 3).map(game => ({
        id: game.id,
        title: game.title,
        designer: game.designer || 'Unknown',
        image: game.image_url || 'https://images.pexels.com/photos/2309234/pexels-photo-2309234.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        status: game.is_available ? 'Available' as const : 'Checked Out' as const
      })) || [];

      // Get recent activities
      const activitiesResponse = await apiService.getActivityLog({ limit: 4 });
      const recentActivities = activitiesResponse.data?.map(activity => ({
        id: activity.id,
        user: activity.username,
        action: activity.action,
        item: `Item #${activity.item_id}`, // You might want to fetch actual item names
        time: this.formatTimeAgo(new Date(activity.created_at)),
        type: activity.item_type as 'book' | 'boardgame'
      })) || [];

      return {
        totalBooks: statsResponse.data?.total_books || 0,
        totalBoardGames: statsResponse.data?.total_boardgames || 0,
        pendingRequests: statsResponse.data?.pending_requests || 0,
        activeUsers: statsResponse.data?.total_users || 0,
        recentActivities,
        recentBooks,
        recentBoardGames
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Return default values if API fails
      return {
        totalBooks: 0,
        totalBoardGames: 0,
        pendingRequests: 0,
        activeUsers: 0,
        recentActivities: [],
        recentBooks: [],
        recentBoardGames: []
      };
    }
  }

  private formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    } else {
      const weeks = Math.floor(diffInSeconds / 604800);
      return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
    }
  }
}

export default new DashboardService();