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
        <div className="flex items-center justify-center h-full">
          <div className="text-[#014BAA] font-semibold">Loading pending users...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-black tracking-tight">User Approvals</h1>
          <p className="text-gray-500 mt-1">Review and manage access requests</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md shadow-sm">
            {error}
          </div>
        )}

        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-black mb-6">
            Pending Approvals ({pendingUsers.length})
          </h2>

          {pendingUsers.length === 0 ? (
            <div className="text-gray-400 text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-200">
              No pending user approvals
            </div>
          ) : (
            <div className="space-y-4">
              {pendingUsers.map((user) => (
                <div
                  key={user._id}
                  className="bg-white border border-gray-200 p-6 rounded-lg flex flex-col md:flex-row justify-between items-center gap-4 hover:shadow-md transition-shadow"
                >
                  <div>
                    <div className="text-black font-bold text-lg">
                      {user.username}
                    </div>
                    <div className="text-gray-600 text-sm">
                      Role: <span className="font-semibold text-[#014BAA]">{user.role}</span>
                    </div>
                    <div className="text-gray-500 text-xs mt-1">
                      Registered: {user.createdAt ? new Date(user.createdAt).toLocaleString() : '--/--/----, --:--:--'}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleReject(user._id)}
                      disabled={processingId === user._id}
                      className="px-5 py-2 bg-white border border-red-200 text-red-600 font-bold rounded-md hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      {processingId === user._id ? '...' : 'Reject'}
                    </button>
                    <button
                      onClick={() => handleApprove(user._id)}
                      disabled={processingId === user._id}
                      className="px-6 py-2 bg-[#014BAA] hover:bg-[#013B8A] text-white font-bold rounded-md transition-colors disabled:opacity-50 shadow-sm"
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
