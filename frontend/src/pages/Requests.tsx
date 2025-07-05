import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, User, Calendar, Loader, AlertCircle } from 'lucide-react';
import apiService from '../services/api';
import { useUser } from '../context/UserContext';

interface Request {
  id: number;
  item_type: string;
  item_id: number;
  item_title: string;
  item_creator: string;
  requester_id: number;
  requester_name: string;
  requester_email: string;
  owner_id: number;
  owner_name: string;
  owner_email: string;
  status: string;
  request_date: string;
  response_date?: string;
  pickup_date: string;
  return_date: string;
  notes?: string;
  is_owner: boolean;
  is_requester: boolean;
}

const Requests: React.FC = () => {
  const { user } = useUser();
  const [filter, setFilter] = useState<'all' | 'sent' | 'received'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'returned'>('all');
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRequests();
  }, [filter, statusFilter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError('');

      const params: any = {};
      
      if (filter !== 'all') {
        params.type = filter;
      }
      
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      const response = await apiService.getRequests(params);
      setRequests(response.data || []);
    } catch (err: any) {
      console.error('Error fetching requests:', err);
      setError('Failed to load requests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await apiService.approveRequest(id);
      fetchRequests();
    } catch (err: any) {
      alert(err.message || 'Failed to approve request');
    }
  };

  const handleReject = async (id: number) => {
    try {
      await apiService.rejectRequest(id);
      fetchRequests();
    } catch (err: any) {
      alert(err.message || 'Failed to reject request');
    }
  };

  const handleCancel = async (id: number) => {
    try {
      await apiService.cancelRequest(id);
      fetchRequests();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel request');
    }
  };

  const handleReturn = async (id: number) => {
    try {
      await apiService.returnItem(id);
      fetchRequests();
    } catch (err: any) {
      alert(err.message || 'Failed to mark as returned');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'returned':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="animate-spin h-8 w-8 text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-700">{error}</p>
          <button
            onClick={fetchRequests}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Requests</h1>

        <div className="flex space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="bg-white border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Requests</option>
            <option value="sent">Sent by Me</option>
            <option value="received">Received by Me</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-white border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="returned">Returned</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {requests.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">No requests found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {requests.map((request) => (
              <div key={request.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <User size={20} className="text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900">{request.item_title}</h3>
                      <p className="text-sm text-gray-500 capitalize">{request.item_type} by {request.item_creator}</p>
                      
                      <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center">
                          <User size={12} className="mr-1" />
                          <span>
                            {request.is_requester ? `To: ${request.owner_name}` : `From: ${request.requester_name}`}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Calendar size={12} className="mr-1" />
                          <span>{formatDate(request.pickup_date)} - {formatDate(request.return_date)}</span>
                        </div>
                      </div>

                      {request.notes && (
                        <p className="mt-2 text-sm text-gray-600 italic">"{request.notes}"</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>

                    {/* Action buttons based on status and user role */}
                    {request.status === 'pending' && (
                      <div className="flex space-x-1">
                        {request.is_owner ? (
                          <>
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
                          </>
                        ) : request.is_requester ? (
                          <button
                            onClick={() => handleCancel(request.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                            title="Cancel"
                          >
                            <XCircle size={18} />
                          </button>
                        ) : null}
                      </div>
                    )}

                    {request.status === 'approved' && request.is_owner && (
                      <button
                        onClick={() => handleReturn(request.id)}
                        className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                        title="Mark as Returned"
                      >
                        Mark Returned
                      </button>
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