import React from 'react';
import { TrendingUp } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, color }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 transform hover:scale-102 transition-all duration-200">
      <div className="flex items-start">
        <div className={`p-3 rounded-lg ${color}`}>
          <div className="text-white">
            {icon}
          </div>
        </div>
        <div className="ml-4">
          <h3 className="text-gray-500 text-sm">{title}</h3>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
          {trend && (
            <p className="text-xs text-gray-500 flex items-center mt-1">
              <TrendingUp size={12} className="mr-1 text-green-500" />
              {trend}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatCard;