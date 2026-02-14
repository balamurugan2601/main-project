import { useState, useEffect } from "react";
import Layout from "../../components/layout/Layout";
import { getPendingUsers, approveUser, rejectUser } from "../../services/api";

const Approvals = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    loadPendingUsers();

    // Real-time signup monitoring
    const interval = setInterval(loadPendingUsers, 30000); // Poll for new operatives every 30s
    return () => clearInterval(interval);
  }, []);

  const loadPendingUsers = async () => {
    try {
      setLoading(true);
      const users = await getPendingUsers();
      setPendingUsers(users);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load pending users');
      console.error('Error loading pending users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    try {
      setProcessingId(userId);
      await approveUser(userId);
      setPendingUsers((prev) => prev.filter((u) => u._id !== userId));
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve user');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (userId) => {
    if (!window.confirm('Are you sure you want to REJECT this operative? Access will be denied.')) return;
    try {
      setProcessingId(userId);
      await rejectUser(userId);
      setPendingUsers((prev) => prev.filter((u) => u._id !== userId));
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject user');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-gray-400">Loading pending users...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-green-400">User Approvals</h1>

        {error && (
          <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="bg-gray-900 p-6 rounded-lg">
          <h2 className="text-xl font-bold text-gray-300 mb-4">
            Pending Approvals ({pendingUsers.length})
          </h2>

          {pendingUsers.length === 0 ? (
            <div className="text-gray-400 text-center py-8">
              No pending user approvals
            </div>
          ) : (
            <div className="space-y-3">
              {pendingUsers.map((user) => (
                <div
                  key={user._id}
                  className="bg-gray-800 p-4 rounded-lg flex justify-between items-center"
                >
                  <div>
                    <div className="text-gray-200 font-semibold">
                      {user.username}
                    </div>
                    <div className="text-gray-400 text-sm">
                      Role: {user.role}
                    </div>
                    <div className="text-gray-500 text-xs mt-1">
                      Registered: {user.createdAt ? new Date(user.createdAt).toLocaleString() : '--/--/----, --:--:--'}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReject(user._id)}
                      disabled={processingId === user._id}
                      className="px-4 py-2 bg-red-900 hover:bg-red-800 text-red-200 font-bold rounded-lg transition-colors disabled:opacity-50"
                    >
                      {processingId === user._id ? '...' : 'Reject'}
                    </button>
                    <button
                      onClick={() => handleApprove(user._id)}
                      disabled={processingId === user._id}
                      className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition-colors disabled:opacity-50"
                    >
                      {processingId === user._id ? 'Processing...' : 'Approve'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Approvals;
