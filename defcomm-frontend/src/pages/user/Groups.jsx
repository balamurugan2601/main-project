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
        <div className="flex items-center justify-center h-full">
          <div className="text-[#014BAA] font-semibold">Loading your groups...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-black tracking-tight">My Groups</h1>
          <p className="text-gray-500 mt-1">Active mission channels</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md shadow-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups?.map((group) => (
            <div key={group._id || group.id} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex flex-col hover:shadow-md transition-shadow">
              <div className="mb-4 pb-4 border-b border-gray-100">
                <h2 className="text-xl font-bold text-[#014BAA]">{group.name}</h2>
                <p className="text-gray-400 text-xs mt-1">
                  Member since {group.createdAt ? new Date(group.createdAt).toLocaleDateString() : '--/--/----'}
                </p>
              </div>

              <div className="flex-1">
                <h3 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">Group Members</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                  {group.members?.map((member) => (
                    <div key={member._id} className="flex items-center gap-3 bg-gray-50 px-3 py-2 rounded border border-gray-100">
                      <div className="w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center text-[#014BAA] font-bold text-xs shadow-sm">
                        {member.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-black font-medium">{member.username}</div>
                        <div className="text-[10px] text-gray-500 uppercase">{member.role}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100">
                <button
                  onClick={() => navigate('/chat')}
                  className="w-full py-2 bg-[#014BAA] hover:bg-[#013B8A] text-white font-bold rounded-md transition-colors shadow-sm"
                >
                  Go to Chat
                </button>
              </div>
            </div>
          ))}
        </div>

        {groups.length === 0 && !loading && (
          <div className="text-center py-20 bg-white rounded-lg border border-dashed border-gray-300">
            <p className="text-gray-500 text-lg font-medium">You are not a member of any groups yet.</p>
            <p className="text-gray-400 text-sm mt-2">Contact HQ to be added to a group.</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Groups;
