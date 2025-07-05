import React from 'react';

interface RecentItemProps {
  title: string;
  author: string;
  image: string;
  status: 'Available' | 'Checked Out';
}

const RecentItem: React.FC<RecentItemProps> = ({ title, author, image, status }) => {
  return (
    <div className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors duration-150">
      <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
        <img src={image} alt={title} className="w-full h-full object-cover" />
      </div>
      <div className="ml-3 flex-1">
        <h3 className="text-sm font-medium text-gray-800 truncate">{title}</h3>
        <p className="text-xs text-gray-500">{author}</p>
      </div>
      <div>
        <span 
          className={`px-2 py-1 text-xs rounded-full ${
            status === 'Available' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-amber-100 text-amber-800'
          }`}
        >
          {status}
        </span>
      </div>
    </div>
  );
};

export default RecentItem;