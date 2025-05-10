import React from 'react';
import { BookOpen, Dice1 as Dice, CheckSquare, Bell, PlusCircle, TrendingUp, Users, Clock } from 'lucide-react';
import StatCard from '../components/dashboard/StatCard';
import RecentItem from '../components/dashboard/RecentItem';
import ActivityItem from '../components/dashboard/ActivityItem';

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-blue-800 text-white rounded-md hover:bg-blue-900 transition-colors duration-150 flex items-center text-sm">
            <PlusCircle size={16} className="mr-2" />
            Add New Item
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Books" 
          value="243" 
          icon={<BookOpen size={20} />} 
          trend="+5% from last month"
          color="bg-blue-800"
        />
        <StatCard 
          title="Board Games" 
          value="87" 
          icon={<Dice size={20} />}
          trend="+3% from last month"
          color="bg-purple-700"
        />
        <StatCard 
          title="Pending Requests" 
          value="12" 
          icon={<CheckSquare size={20} />}
          trend="4 new today"
          color="bg-amber-600"
        />
        <StatCard 
          title="Active Users" 
          value="156" 
          icon={<Users size={20} />}
          trend="10 new this week"
          color="bg-emerald-600"
        />
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Books */}
        <div className="bg-white rounded-lg shadow-sm p-6 col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Recent Books</h2>
            <a href="/books" className="text-sm text-blue-700 hover:text-blue-900 hover:underline transition-colors">View all</a>
          </div>
          <div className="space-y-4">
            <RecentItem 
              title="The Midnight Library" 
              author="Matt Haig"
              image="https://images.pexels.com/photos/1179229/pexels-photo-1179229.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
              status="Available"
            />
            <RecentItem 
              title="Atomic Habits" 
              author="James Clear"
              image="https://images.pexels.com/photos/3747139/pexels-photo-3747139.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
              status="Checked Out"
            />
            <RecentItem 
              title="Dune" 
              author="Frank Herbert"
              image="https://images.pexels.com/photos/2908984/pexels-photo-2908984.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
              status="Available"
            />
          </div>
        </div>

        {/* Recent Board Games */}
        <div className="bg-white rounded-lg shadow-sm p-6 col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Recent Board Games</h2>
            <a href="/board-games" className="text-sm text-blue-700 hover:text-blue-900 hover:underline transition-colors">View all</a>
          </div>
          <div className="space-y-4">
            <RecentItem 
              title="Catan" 
              author="Klaus Teuber"
              image="https://images.pexels.com/photos/2309234/pexels-photo-2309234.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
              status="Available"
            />
            <RecentItem 
              title="Ticket to Ride" 
              author="Alan R. Moon"
              image="https://images.pexels.com/photos/6333080/pexels-photo-6333080.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
              status="Checked Out"
            />
            <RecentItem 
              title="Pandemic" 
              author="Matt Leacock"
              image="https://images.pexels.com/photos/6686455/pexels-photo-6686455.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
              status="Available"
            />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm p-6 col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Recent Activity</h2>
            <button className="text-sm text-blue-700 hover:text-blue-900 hover:underline transition-colors">View all</button>
          </div>
          <div className="space-y-4">
            <ActivityItem 
              user="Sarah Johnson"
              action="checked out"
              item="The Midnight Library"
              time="2 hours ago"
              icon={<Clock size={16} className="text-blue-500" />}
            />
            <ActivityItem 
              user="Mark Wilson"
              action="returned"
              item="Catan"
              time="5 hours ago"
              icon={<CheckSquare size={16} className="text-green-500" />}
            />
            <ActivityItem 
              user="Admin"
              action="added"
              item="Atomic Habits"
              time="1 day ago"
              icon={<PlusCircle size={16} className="text-purple-500" />}
            />
            <ActivityItem 
              user="Jessica Miller"
              action="requested"
              item="Pandemic"
              time="2 days ago"
              icon={<Bell size={16} className="text-amber-500" />}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;