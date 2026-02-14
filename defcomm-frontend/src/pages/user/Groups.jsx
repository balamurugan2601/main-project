import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import { fetchGroups } from "../../services/api";

const Groups = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const data = await fetchGroups();
      setGroups(data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load groups');
      console.error('Error loading groups:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && groups.length === 0) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-gray-400">Loading your groups...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-green-400">My Groups</h1>

        {error && (
          <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups?.map((group) => (
            <div key={group._id || group.id} className="bg-gray-900 p-6 rounded-lg border border-gray-800 flex flex-col">
              <div className="mb-4">
                <h2 className="text-xl font-bold text-green-400">{group.name}</h2>
                <p className="text-gray-500 text-xs">
                  Member since {group.createdAt ? new Date(group.createdAt).toLocaleDateString() : '--/--/----'}
                </p>
              </div>

              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">Group Members</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                  {group.members?.map((member) => (
                    <div key={member._id} className="flex items-center gap-3 bg-gray-800 px-3 py-2 rounded">
                      <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-green-400 font-bold">
                        {member.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-gray-200 font-medium">{member.username}</div>
                        <div className="text-xs text-gray-500 italic">{member.role}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-800">
                <button
                  onClick={() => navigate('/chat')}
                  className="w-full py-2 bg-green-600 hover:bg-green-500 text-white font-bold rounded transition-colors"
                >
                  Go to Chat
                </button>
              </div>
            </div>
          ))}
        </div>

        {groups.length === 0 && !loading && (
          <div className="text-center py-20 bg-gray-900 rounded-lg border border-dashed border-gray-700">
            <p className="text-gray-500 text-lg">You are not a member of any groups yet.</p>
            <p className="text-gray-600 text-sm mt-2">Contact HQ to be added to a group.</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Groups;
