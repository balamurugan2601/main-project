import { useState, useEffect } from "react";
import Layout from "../../components/layout/Layout";
import { fetchGroups, createGroup, addMemberToGroup, getAllUsers, deleteGroup, removeMemberFromGroup } from "../../services/api";

const ManageGroups = () => {
    const [groups, setGroups] = useState([]);
    const [users, setUsers] = useState([]);
    const [newGroupName, setNewGroupName] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [addingMemberId, setAddingMemberId] = useState({}); // { groupId: userId }

    useEffect(() => {
        loadData();

        // Real-time mission synchronization
        const interval = setInterval(loadData, 45000); // 45-second heartbeat
        return () => clearInterval(interval);
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [groupsData, usersData] = await Promise.all([
                fetchGroups(),
                getAllUsers()
            ]);
            setGroups(groupsData);
            setUsers(usersData.filter(u => u.status === 'approved')); // Only show approved users for group assignment
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load data');
            console.error('Error loading management data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateGroup = async (e) => {
        e.preventDefault();
        if (!newGroupName.trim()) return;

        try {
            setLoading(true);
            await createGroup({ name: newGroupName });
            setNewGroupName("");
            setSuccess("Group created successfully!");
            await loadData();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create group');
        } finally {
            setLoading(false);
        }
    };

    const handleAddMember = async (groupId) => {
        const userId = addingMemberId[groupId];
        if (!userId) return;

        try {
            setError(null);
            await addMemberToGroup(groupId, userId);
            setSuccess("Member added successfully!");
            await loadData();
            setAddingMemberId(prev => ({ ...prev, [groupId]: "" }));
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add member');
        }
    };

    const handleDeleteGroup = async (groupId) => {
        if (!window.confirm('Are you sure you want to DELETE this group? All messages will be lost.')) return;
        try {
            setLoading(true);
            await deleteGroup(groupId);
            setSuccess("Group deleted successfully!");
            await loadData();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete group');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveMember = async (groupId, userId) => {
        if (!window.confirm('Remove this member from the group?')) return;
        try {
            setError(null);
            await removeMemberFromGroup(groupId, userId);
            setSuccess("Member removed!");
            await loadData();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to remove member');
        }
    };

    const handleUserSelectChange = (groupId, userId) => {
        setAddingMemberId(prev => ({ ...prev, [groupId]: userId }));
    };

    if (loading && groups.length === 0) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-screen">
                    <div className="text-gray-400">Loading management data...</div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="space-y-6">
                <h1 className="text-3xl font-bold text-green-400">Manage Groups</h1>

                {error && (
                    <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="bg-green-900 border border-green-700 text-green-200 px-4 py-3 rounded">
                        {success}
                    </div>
                )}

                {/* Create Group Form */}
                <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
                    <h2 className="text-xl font-bold text-gray-300 mb-4">Create New Group</h2>
                    <form onSubmit={handleCreateGroup} className="flex gap-4">
                        <input
                            type="text"
                            value={newGroupName}
                            onChange={(e) => setNewGroupName(e.target.value)}
                            placeholder="Group Name (e.g. Squad A)"
                            className="flex-1 px-4 py-2 bg-gray-800 rounded focus:outline-none focus:ring-2 focus:ring-green-500 text-white"
                            required
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
                        >
                            Create Group
                        </button>
                    </form>
                </div>

                {/* Group List */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {groups.map((group) => (
                        <div key={group._id} className="bg-gray-900 p-6 rounded-lg border border-gray-800 flex flex-col">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-green-400">{group.name}</h3>
                                    <p className="text-gray-500 text-xs">
                                        Created: {group.createdAt ? new Date(group.createdAt).toLocaleDateString() : '--/--/----'}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleDeleteGroup(group._id)}
                                        className="p-1.5 bg-red-900/30 text-red-400 hover:bg-red-800/50 rounded transition-colors"
                                        title="Delete Group"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
                                    </button>
                                    <span className="px-2 py-1 bg-gray-800 text-gray-400 text-xs rounded">
                                        {group.members?.length || 0} Members
                                    </span>
                                </div>
                            </div>

                            {/* Member List */}
                            <div className="flex-1 mb-4 max-h-40 overflow-y-auto pr-2">
                                <h4 className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wider">Members</h4>
                                {group.members && group.members.length > 0 ? (
                                    <div className="space-y-2">
                                        {group.members.map(member => (
                                            <div key={member._id || member.id} className="flex justify-between items-center bg-gray-800 px-3 py-2 rounded">
                                                <div className="flex flex-col">
                                                    <span className="text-gray-200">{member.username}</span>
                                                    <span className="text-gray-500 text-[10px] italic">{member.role}</span>
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveMember(group._id, member._id || member.id)}
                                                    className="text-gray-500 hover:text-red-400 transition-colors"
                                                    title="Remove Member"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-600 text-sm italic">No members yet</p>
                                )}
                            </div>

                            {/* Add Member Form */}
                            <div className="mt-auto pt-4 border-t border-gray-800">
                                <h4 className="text-sm font-semibold text-gray-400 mb-2">Add Member</h4>
                                <div className="flex gap-2">
                                    <select
                                        value={addingMemberId[group._id] || ""}
                                        onChange={(e) => handleUserSelectChange(group._id, e.target.value)}
                                        className="flex-1 bg-gray-800 border-none rounded px-3 py-2 text-sm text-white focus:ring-1 focus:ring-green-500"
                                    >
                                        {users && users
                                            .filter(user => !group.members?.some(m => (m._id === user._id || m.id === user.id)))
                                            .map(user => (
                                                <option key={user._id || user.id} value={user._id || user.id}>
                                                    {user.username} ({user.role})
                                                </option>
                                            ))
                                        }
                                    </select>
                                    <button
                                        onClick={() => handleAddMember(group._id)}
                                        disabled={!addingMemberId[group._id]}
                                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-bold rounded transition-colors disabled:opacity-50"
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {groups.length === 0 && !loading && (
                    <div className="text-center py-12 bg-gray-900 rounded-lg border border-dashed border-gray-700">
                        <p className="text-gray-500">No groups found. Create your first group above.</p>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default ManageGroups;
