import React, { useState } from 'react';
import { Clock, CheckCircle, XCircle, User, Calendar } from 'lucide-react';

interface Request {
  id: number;
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
  item: {
    title: string;
    type: 'Book' | 'Board Game';
  };
  requestDate: string;
  returnDate: string;
  status: 'pending' | 'approved' | 'rejected';
}

const Requests: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  // Sample data - replace with API call
  const [requests, setRequests] = useState<Request[]>([
    {
      id: 1,
      user: {
        name: 'John Doe',
        email: 'john@example.com',
      },
      item: {
        title: 'The Midnight Library',
        type: 'Book'
      },
      requestDate: '2025-01-15',
      returnDate: '2025-01-29',
      status: 'pending'
    },
    {
      id: 2,
      user: {
        name: 'Jane Smith',
        email: 'jane@example.com',
      },
      item: {
        title: 'Catan',
        type: 'Board Game'
      },
      requestDate: '2025-01-14',
      returnDate: '2025-01-21',
      status: 'approved'
    }
  ]);

  const handleApprove = (id: number) => {
    setRequests(requests.map(req =>
      req.id === id ? { ...req, status: 'approved' as const } : req
    ));
  };

  const handleReject = (id: number) => {
    setRequests(requests.map(req =>
      req.id === id ? { ...req, status: 'rejected' as const } : req
    ));
  };

  const filteredRequests = filter === 'all'
    ? requests
    : requests.filter(req => req.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">My Requests</h1>

        <div className="flex space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="bg-white border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Requests</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {filteredRequests.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">No requests found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredRequests.map((request) => (
              <div key={request.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <User size={20} className="text-gray-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{request.item.title}</h3>
                      <p className="text-sm text-gray-500">{request.item.type}</p>
                      <div className="flex items-center mt-1 text-xs text-gray-500">
                        <Calendar size={12} className="mr-1" />
                        <span>{request.requestDate} - {request.returnDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      request.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : request.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>

                    {request.status === 'pending' && (
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleApprove(request.id)}
                          className="p-1 text-green-600 hover:bg-green-50 rounded"
                          title="Approve"
                        >
                          <CheckCircle size={18} />
                        </button>
                        <button
                          onClick={() => handleReject(request.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          title="Reject"
                        >
                          <XCircle size={18} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Requests;