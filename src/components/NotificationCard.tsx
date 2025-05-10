import React from 'react';

interface NotificationCardProps {
  message: string;
  time: string;
  isRead: boolean;
}

const NotificationCard = ({ message, time, isRead }: NotificationCardProps) => {
  return (
    <div className={`card p-3 transition-all duration-200 ${isRead ? 'bg-white' : 'bg-primary-50 border-l-4 border-primary-500'}`}>
      <div className="flex justify-between items-start gap-2">
        <p className={`text-sm ${isRead ? 'text-gray-600' : 'text-gray-800 font-medium'}`}>
          {message}
        </p>
        {!isRead && (
          <span className="h-2 w-2 rounded-full bg-primary-500 flex-shrink-0"></span>
        )}
      </div>
      <p className="text-xs text-gray-500 mt-1">{time}</p>
    </div>
  );
};

export default NotificationCard;