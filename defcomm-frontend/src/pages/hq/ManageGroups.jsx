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
                <div className="flex items-center justify-center h-full">
                    <div className="text-[#014BAA] font-semibold">Loading management data...</div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-black tracking-tight">Manage Groups</h1>
                    <p className="text-gray-500 mt-1">Organize teams and communications</p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md shadow-sm">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md shadow-sm">
                        {success}
                    </div>
                )}

                {/* Create Group Form */}
                <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
                    <h2 className="text-xl font-bold text-black mb-6">Create New Group</h2>
                    <form onSubmit={handleCreateGroup} className="flex gap-4">
                        <input
                            type="text"
                            value={newGroupName}
                            onChange={(e) => setNewGroupName(e.target.value)}
                            placeholder="Group Name (e.g. Squad A)"
                            className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#014BAA] focus:border-transparent text-black"
                            required
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-3 bg-[#014BAA] hover:bg-[#013B8A] text-white font-bold rounded-md transition-colors disabled:opacity-50 shadow-sm"
                        >
                            Create Group
                        </button>
                    </form>
                </div>

                {/* Group List */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {groups.map((group) => (
                        <div key={group._id} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex flex-col h-full">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-xl font-bold text-[#014BAA]">{group.name}</h3>
                                    <p className="text-gray-400 text-xs mt-1">
                                        Created: {group.createdAt ? new Date(group.createdAt).toLocaleDateString() : '--/--/----'}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full border border-gray-200">
                                        {group.members?.length || 0} Members
                                    </span>
                                    <button
                                        onClick={() => handleDeleteGroup(group._id)}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                        title="Delete Group"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
                                    </button>
                                </div>
                            </div>

                            {/* Member List */}
                            <div className="flex-1 mb-6 max-h-48 overflow-y-auto pr-2">
                                <h4 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">Members</h4>
                                {group.members && group.members.length > 0 ? (
                                    <div className="space-y-2">
                                        {group.members.map(member => (
                                            <div key={member._id || member.id} className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded border border-gray-100">
                                                <div className="flex flex-col">
                                                    <span className="text-gray-900 font-medium text-sm">{member.username}</span>
                                                    <span className="text-gray-500 text-[10px] uppercase">{member.role}</span>
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveMember(group._id, member._id || member.id)}
                                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                                    title="Remove Member"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-400 text-sm italic py-2">No members assigned yet</p>
                                )}
                            </div>

                            {/* Add Member Form */}
                            <div className="mt-auto pt-4 border-t border-gray-100">
                                <h4 className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Add Member</h4>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <select
                                            value={addingMemberId[group._id] || ""}
                                            onChange={(e) => handleUserSelectChange(group._id, e.target.value)}
                                            className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#014BAA] appearance-none"
                                        >
                                            <option value="">Select User...</option>
                                            {users && users
                                                .filter(user => !group.members?.some(m => (m._id === user._id || m.id === user.id)))
                                                .map(user => (
                                                    <option key={user._id || user.id} value={user._id || user.id}>
                                                        {user.username} ({user.role})
                                                    </option>
                                                ))
                                            }
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleAddMember(group._id)}
                                        disabled={!addingMemberId[group._id]}
                                        className="px-4 py-2 bg-[#014BAA] hover:bg-[#013B8A] text-white text-sm font-bold rounded transition-colors disabled:opacity-50"
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {groups.length === 0 && !loading && (
                    <div className="text-center py-16 bg-white rounded-lg border border-dashed border-gray-300">
                        <p className="text-gray-500 font-medium">No groups found. Create your first group above.</p>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default ManageGroups;
