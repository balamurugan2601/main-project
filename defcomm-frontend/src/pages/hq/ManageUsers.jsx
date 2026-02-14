import { useState, useEffect } from "react";
import Layout from "../../components/layout/Layout";
import { getAllUsers, deleteUser, updateUser } from "../../services/api";

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [editingUser, setEditingUser] = useState(null);
    const [newRole, setNewRole] = useState("");

    useEffect(() => {
        loadUsers();

        // Real-time directory synchronization
        const interval = setInterval(loadUsers, 30000); // 30-second heartbeat
        return () => clearInterval(interval);
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const data = await getAllUsers();
            setUsers(data);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (userId) => {
        if (!window.confirm('PERMANENTLY DELETE this operative? This cannot be undone.')) return;
        try {
            await deleteUser(userId);
            setSuccess("User deleted successfully");
            setUsers(prev => prev.filter(u => u._id !== userId));
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Deletion failed');
        }
    };

    const handleStartEdit = (user) => {
        setEditingUser(user);
        setNewRole(user.role);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const updatedUser = await updateUser(editingUser._id, { role: newRole });
            setSuccess("User role updated!");
            setEditingUser(null);

            // Update local state IMMEDIATELY
            setUsers(prev => prev.map(u => u._id === editingUser._id ? { ...u, role: updatedUser.role } : u));

            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Update failed');
        }
    };

    if (loading && users.length === 0) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-full">
                    <div className="text-[#014BAA] font-semibold">Loading operative directory...</div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-black tracking-tight">Operative Directory</h1>
                        <p className="text-gray-500 mt-1">Manage system access and roles</p>
                    </div>
                    <div className="px-4 py-2 bg-[#014BAA]/10 text-[#014BAA] rounded-full text-sm font-bold border border-[#014BAA]/20">
                        {users.length} Active Profiles
                    </div>
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

                {/* Edit Modal / Area */}
                {editingUser && (
                    <div className="bg-white p-6 rounded-lg border border-[#014BAA] shadow-lg sticky top-6 z-20">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-black">Edit Permissions: {editingUser.username}</h2>
                            <span className="text-xs text-gray-400 font-mono italic">Identity Locked</span>
                        </div>
                        <form onSubmit={handleUpdate} className="flex gap-4 items-center">
                            <div className="flex-1">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Authorization Level</label>
                                <select
                                    value={newRole}
                                    onChange={(e) => setNewRole(e.target.value)}
                                    className="w-full bg-white border border-gray-300 rounded px-4 py-2 text-black outline-none focus:ring-2 focus:ring-[#014BAA] focus:border-transparent"
                                >
                                    <option value="user">Field Operative</option>
                                    <option value="hq">Command HQ</option>
                                </select>
                            </div>
                            <div className="flex gap-2 pt-5">
                                <button type="submit" className="px-6 py-2 bg-[#014BAA] text-white font-bold rounded hover:bg-[#013B8A] transition-colors shadow-sm">Grant Access</button>
                                <button type="button" onClick={() => setEditingUser(null)} className="px-6 py-2 bg-white text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors">Cancel</button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Username</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {users.map((user) => (
                                <tr key={user._id} className="hover:bg-[#F8F3F0] transition-colors">
                                    <td className="p-4 font-semibold text-gray-900">{user.username}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-sm text-[10px] font-bold uppercase border ${user.role === 'hq' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-sm text-[10px] font-bold uppercase border ${user.status === 'approved' ? 'bg-green-50 text-green-700 border-green-200' :
                                            user.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                                                'bg-yellow-50 text-yellow-700 border-yellow-200'
                                            }`}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right space-x-3">
                                        <button onClick={() => handleStartEdit(user)} className="text-[#014BAA] hover:text-[#013B8A] font-bold text-xs uppercase hover:underline">Edit</button>
                                        <button onClick={() => handleDelete(user._id)} className="text-gray-400 hover:text-red-600 font-bold text-xs uppercase hover:underline">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </Layout>
    );
};

export default ManageUsers;
