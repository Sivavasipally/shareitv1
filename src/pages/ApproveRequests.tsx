import React, { useState } from 'react';
import { CheckCircle, XCircle, Calendar } from 'lucide-react';

const ApproveRequests: React.FC = () => {
  // Sample data
  const initialRequests = [
    {
      id: 1,
      user: {
        name: 'Sarah Johnson',
        email: 'sarah.j@example.com',
        avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
      },
      item: {
        title: 'The Midnight Library',
        type: 'Book'
      },
      requestDate: '2025-05-15',
      returnDate: '2025-05-29',
      status: 'pending'
    },
    {
      id: 2,
      user: {
        name: 'Mark Wilson',
        email: 'mark.w@example.com',
        avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
      },
      item: {
        title: 'Catan',
        type: 'Board Game'
      },
      requestDate: '2025-05-16',
      returnDate: '2025-05-23',
      status: 'pending'
    },
    {
      id: 3,
      user: {
        name: 'Jessica Miller',
        email: 'jessica.m@example.com',
        avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
      },
      item: {
        title: 'Dune',
        type: 'Book'
      },
      requestDate: '2025-05-14',
      returnDate: '2025-05-28',
      status: 'pending'
    },
    {
      id: 4,
      user: {
        name: 'Alex Thompson',
        email: 'alex.t@example.com',
        avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
      },
      item: {
        title: 'Pandemic',
        type: 'Board Game'
      },
      requestDate: '2025-05-13',
      returnDate: '2025-05-20',
      status: 'pending'
    }
  ];

  const [requests, setRequests] = useState(initialRequests);
  const [filter, setFilter] = useState('all');

  const handleRequestAction = (id: number, action: 'approve' | 'reject') => {
    setRequests(prevRequests => 
      prevRequests.map(request => 
        request.id === id 
          ? { ...request, status: action === 'approve' ? 'approved' : 'rejected' } 
          : request
      )
    );
  };

  const filteredRequests = filter === 'all' 
    ? requests 
    : requests.filter(request => request.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Approve Pending Requests</h1>
        <div className="flex space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-white border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Requests</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {filteredRequests.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Request Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Return Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <img className="h-10 w-10 rounded-full object-cover" src={request.user.avatar} alt={request.user.name} />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{request.user.name}</div>
                          <div className="text-sm text-gray-500">{request.user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{request.item.title}</div>
                      <div className="text-sm text-gray-500">{request.item.type}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Calendar size={16} className="mr-2 text-gray-500" />
                        {request.requestDate}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Calendar size={16} className="mr-2 text-gray-500" />
                        {request.returnDate}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span 
                        className={`px-2 py-1 text-xs rounded-full ${
                          request.status === 'pending' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : request.status === 'approved'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {request.status === 'pending' ? (
                        <div className="flex justify-end space-x-2">
                          <button 
                            onClick={() => handleRequestAction(request.id, 'approve')}
                            className="text-green-600 hover:text-green-800 transition-colors duration-150"
                          >
                            <CheckCircle size={20} />
                          </button>
                          <button 
                            onClick={() => handleRequestAction(request.id, 'reject')}
                            className="text-red-600 hover:text-red-800 transition-colors duration-150"
                          >
                            <XCircle size={20} />
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-500">
                          {request.status === 'approved' ? 'Approved' : 'Rejected'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-gray-500">No matching requests found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApproveRequests;