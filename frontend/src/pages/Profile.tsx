import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Camera, BookOpen, Dice1 as Dice } from 'lucide-react';

const Profile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
  });

  const recentActivity = [
    {
      type: 'book',
      title: 'The Midnight Library',
      date: '2025-05-15',
      status: 'Borrowed'
    },
    {
      type: 'boardgame',
      title: 'Catan',
      date: '2025-05-10',
      status: 'Returned'
    },
    {
      type: 'book',
      title: 'Atomic Habits',
      date: '2025-05-01',
      status: 'Returned'
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
    // TODO: Implement profile update
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-800">Personal Information</h2>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-sm text-blue-800 hover:text-blue-900"
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>

            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                    Location
                  </label>
                  <input
                    type="text"
                    id="location"
                    value={profile.location}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-800 text-white rounded-md hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center">
                  <User className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="text-sm font-medium text-gray-900">{profile.name}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-sm font-medium text-gray-900">{profile.email}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Phone className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="text-sm font-medium text-gray-900">{profile.phone}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="text-sm font-medium text-gray-900">{profile.location}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Profile Picture */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-center">
              <div className="relative inline-block">
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="h-32 w-32 rounded-full object-cover"
                />
                <button className="absolute bottom-0 right-0 bg-blue-800 p-2 rounded-full text-white hover:bg-blue-900 transition-colors">
                  <Camera size={16} />
                </button>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">{profile.name}</h3>
              <p className="text-sm text-gray-500">{profile.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-800">Recent Activity</h2>
          <a href="/activity" className="text-sm text-blue-800 hover:text-blue-900">
            View all
          </a>
        </div>

        <div className="space-y-4">
          {recentActivity.map((activity, index) => (
            <div key={index} className="flex items-center justify-between py-3 border-b last:border-0">
              <div className="flex items-center">
                {activity.type === 'book' ? (
                  <BookOpen className="h-5 w-5 text-blue-800 mr-3" />
                ) : (
                  <Dice className="h-5 w-5 text-purple-700 mr-3" />
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                  <p className="text-xs text-gray-500">{activity.date}</p>
                </div>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${
                activity.status === 'Borrowed' 
                  ? 'bg-amber-100 text-amber-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {activity.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Profile;