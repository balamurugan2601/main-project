import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import { getAdminStats, getRecentMessages } from "../../services/api";
import { decryptMessage } from "../../utils/encrypt";

const HQDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    approvedUsers: 0,
    pendingUsers: 0,
    totalGroups: 0,
    totalMessages: 0,
  });
  const [recentMessages, setRecentMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, messagesData] = await Promise.all([
        getAdminStats(),
        getRecentMessages(5),
      ]);
      setStats(statsData);
      setRecentMessages(messagesData);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard data');
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return !isNaN(date.getTime()) ? date.toLocaleString() : '--/--/----, --:--:--';
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-gray-400">Loading dashboard...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-green-400">HQ Dashboard</h1>

        {error && (
          <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-gray-900 p-6 rounded-lg">
            <div className="text-3xl font-bold text-green-400">{stats?.totalUsers || 0}</div>
            <div className="text-gray-300 mt-2">Total Users</div>
          </div>

          <div className="bg-gray-900 p-6 rounded-lg">
            <div className="text-3xl font-bold text-green-400">{stats?.approvedUsers || 0}</div>
            <div className="text-gray-300 mt-2">Approved Users</div>
          </div>

          <div className="bg-gray-900 p-6 rounded-lg">
            <div className="text-3xl font-bold text-green-400">{stats?.pendingUsers || 0}</div>
            <div className="text-gray-300 mt-2">Pending Users</div>
          </div>

          <div className="bg-gray-900 p-6 rounded-lg cursor-pointer hover:bg-gray-800 transition-colors border border-transparent hover:border-green-500" onClick={() => navigate('/hq/groups')}>
            <div className="text-3xl font-bold text-green-400">{stats?.totalGroups || 0}</div>
            <div className="text-gray-300 mt-2 font-semibold">Total Groups</div>
            <div className="text-xs text-green-500 mt-1">Click to Manage →</div>
          </div>

          <div className="bg-gray-900 p-6 rounded-lg">
            <div className="text-3xl font-bold text-green-400">{stats?.totalMessages || 0}</div>
            <div className="text-gray-300 mt-2">Total Messages</div>
          </div>
        </div>

        <div className="bg-gray-900 p-6 rounded-lg">
          <h2 className="text-2xl font-bold text-green-400 mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {recentMessages?.length === 0 ? (
              <div className="text-gray-400 text-center py-4">No recent messages</div>
            ) : (
              recentMessages?.map((msg, index) => (
                <div key={index} className="bg-gray-800 p-4 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-gray-300 font-semibold">
                        {msg.senderName}
                      </div>
                      <div className="text-gray-400 text-sm">
                        Group: {msg.groupName}
                      </div>
                    </div>
                    <div className="text-gray-500 text-sm">
                      {formatTimestamp(msg.timestamp)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HQDashboard;
