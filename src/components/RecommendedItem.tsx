import React from 'react';
import { Book, Puzzle as PuzzlePiece } from 'lucide-react';

interface RecommendedItemProps {
  type: 'book' | 'board';
  title: string;
  subtitle: string;
  imageUrl: string;
}

const RecommendedItem = ({ type, title, subtitle, imageUrl }: RecommendedItemProps) => {
  return (
    <div className="card group transition-all duration-300 hover:shadow-md hover:scale-105">
      <div className="relative h-32 overflow-hidden rounded-t-lg">
        <img 
          src={imageUrl} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-2 left-2">
          {type === 'book' ? (
            <div className="bg-primary-600 text-white p-1 rounded-full">
              <Book size={16} />
            </div>
          ) : (
            <div className="bg-secondary-500 text-white p-1 rounded-full">
              <PuzzlePiece size={16} />
            </div>
          )}
        </div>
      </div>
      <div className="p-3">
        <h3 className="font-medium text-gray-800 line-clamp-1">{title}</h3>
        <p className="text-xs text-gray-600">{subtitle}</p>
      </div>
    </div>
  );
};

export default RecommendedItem;