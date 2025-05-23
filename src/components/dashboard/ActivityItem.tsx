import React from 'react';
import { Link } from 'react-router-dom';

interface ActivityItemProps {
  user: string;
  action: string;
  item: string;
  time: string;
  icon: React.ReactNode;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ user, action, item, time, icon }) => {
  return (
    <div className="flex items-start py-2">
      <div className="p-2 bg-gray-100 rounded-full mr-3">
        {icon}
      </div>
      <div>
        <p className="text-sm">
          <span className="font-medium text-gray-800">{user}</span>{' '}
          <span className="text-gray-600">{action}</span>{' '}
          <Link to="/activity" className="font-medium text-gray-800 hover:text-blue-800 transition-colors">
            {item}
          </Link>
        </p>
        <p className="text-xs text-gray-500 mt-0.5">{time}</p>
      </div>
    </div>
  );
};

export default ActivityItem;