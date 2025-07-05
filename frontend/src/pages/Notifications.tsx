import React, { useState } from 'react';
import { Bell, CheckCircle, AlertCircle, Clock, XCircle } from 'lucide-react';

interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
}

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      title: 'Request Approved',
      message: 'Your request for "The Midnight Library" has been approved.',
      time: '2 hours ago',
      read: false,
      type: 'success'
    },
    {
      id: 2,
      title: 'Overdue Return',
      message: 'The board game "Catan" is overdue. Please return it as soon as possible.',
      time: '1 day ago',
      read: false,
      type: 'warning'
    },
    {
      id: 3,
      title: 'New Book Added',
      message: 'A new book "Atomic Habits" has been added to the library.',
      time: '2 days ago',
      read: true,
      type: 'info'
    },
    {
      id: 4,
      title: 'Request Denied',
      message: 'Your request for "Pandemic" has been denied due to high demand.',
      time: '3 days ago',
      read: true,
      type: 'error'
    },
    {
      id: 5,
      title: 'Reminder',
      message: 'Your borrowed item "Dune" is due in 2 days.',
      time: '3 days ago',
      read: true,
      type: 'info'
    },
  ]);

  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const markAsRead = (id: number) => {
    setNotifications(prevNotifications =>
      prevNotifications.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prevNotifications =>
      prevNotifications.map(notification => ({ ...notification, read: true }))
    );
  };

  const deleteNotification = (id: number) => {
    setNotifications(prevNotifications =>
      prevNotifications.filter(notification => notification.id !== id)
    );
  };

  const filteredNotifications = filter === 'all'
    ? notifications
    : notifications.filter(notification => !notification.read);

  const unreadCount = notifications.filter(notification => !notification.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} className="text-green-500" />;
      case 'warning':
        return <AlertCircle size={20} className="text-amber-500" />;
      case 'error':
        return <XCircle size={20} className="text-red-500" />;
      default:
        return <Bell size={20} className="text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
          {unreadCount > 0 && (
            <span className="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'unread')}
            className="bg-white border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All</option>
            <option value="unread">Unread</option>
          </select>
          <button
            onClick={markAllAsRead}
            className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors"
          >
            Mark all as read
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {filteredNotifications.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredNotifications.map(notification => (
              <div 
                key={notification.id} 
                className={`p-4 ${notification.read ? 'bg-white' : 'bg-blue-50'} hover:bg-gray-50 transition-colors duration-150`}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-3 mt-0.5">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className={`text-sm font-medium ${notification.read ? 'text-gray-800' : 'text-blue-800'}`}>
                        {notification.title}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500 flex items-center">
                          <Clock size={12} className="mr-1" />
                          {notification.time}
                        </span>
                        {!notification.read && (
                          <button 
                            onClick={() => markAsRead(notification.id)}
                            className="text-blue-600 hover:text-blue-800 transition-colors duration-150"
                            title="Mark as read"
                          >
                            <CheckCircle size={16} />
                          </button>
                        )}
                        <button 
                          onClick={() => deleteNotification(notification.id)}
                          className="text-gray-500 hover:text-red-600 transition-colors duration-150"
                          title="Delete notification"
                        >
                          <XCircle size={16} />
                        </button>
                      </div>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">
                      {notification.message}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-gray-500">No notifications found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;