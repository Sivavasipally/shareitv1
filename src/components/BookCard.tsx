import React from 'react';
import { User, MessageCircle } from 'lucide-react';

interface BookCardProps {
  title: string;
  author: string;
  coverUrl: string;
  owner: string;
}

const BookCard = ({ title, author, coverUrl, owner }: BookCardProps) => {
  return (
    <div className="card group transition-all duration-300 hover:scale-105 hover:shadow-md">
      <div className="relative h-48 md:h-56 overflow-hidden">
        <img 
          src={coverUrl} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
          <div className="p-4 text-white">
            <div className="flex items-center space-x-1">
              <User size={14} />
              <span className="text-sm">{owner}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-gray-800 line-clamp-1">{title}</h3>
        <p className="text-sm text-gray-600 mb-3">{author}</p>
        <div className="flex justify-between">
          <span className="badge badge-available">Available</span>
          <button className="text-primary-600 hover:text-primary-700 transition-colors flex items-center space-x-1 text-sm">
            <MessageCircle size={14} />
            <span>Request</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookCard;