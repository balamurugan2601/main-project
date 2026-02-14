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
  const navigate = useNavigate();

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
        <div className="flex items-center justify-center h-full">
          <div className="text-[#014BAA] font-semibold">Loading dashboard...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-black tracking-tight">HQ Dashboard</h1>
          <p className="text-gray-500 mt-1">System Overview & Status</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md shadow-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-4xl font-bold text-[#014BAA]">{stats?.totalUsers || 0}</div>
            <div className="text-gray-600 mt-2 font-medium">Total Users</div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-4xl font-bold text-[#014BAA]">{stats?.approvedUsers || 0}</div>
            <div className="text-gray-600 mt-2 font-medium">Approved Users</div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-4xl font-bold text-[#014BAA]">{stats?.pendingUsers || 0}</div>
            <div className="text-gray-600 mt-2 font-medium">Pending Users</div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:border-[#014BAA] transition-colors group" onClick={() => navigate('/hq/groups')}>
            <div className="text-4xl font-bold text-[#014BAA] group-hover:scale-105 transition-transform">{stats?.totalGroups || 0}</div>
            <div className="text-gray-600 mt-2 font-medium">Total Groups</div>
            <div className="text-xs text-[#014BAA] mt-2 font-semibold uppercase tracking-wide opacity-0 group-hover:opacity-100 transition-opacity">Manage →</div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-4xl font-bold text-[#014BAA]">{stats?.totalMessages || 0}</div>
            <div className="text-gray-600 mt-2 font-medium">Total Messages</div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-black mb-6 border-b pb-4">Recent Activity</h2>
          <div className="space-y-0 divide-y divide-gray-100">
            {recentMessages?.length === 0 ? (
              <div className="text-gray-400 text-center py-8">No recent messages</div>
            ) : (
              recentMessages?.map((msg, index) => (
                <div key={index} className="py-4 first:pt-0 last:pb-0 hover:bg-gray-50 transition-colors px-2 -mx-2 rounded-md">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-gray-900 font-semibold text-sm">
                        {msg.senderName}
                      </div>
                      <div className="text-gray-500 text-xs mt-1">
                        Group: <span className="text-[#014BAA] font-medium">{msg.groupName}</span>
                      </div>
                    </div>
                    <div className="text-gray-400 text-xs font-mono">
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
