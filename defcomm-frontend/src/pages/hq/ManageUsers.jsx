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
                <div className="flex items-center justify-center h-screen">
                    <div className="text-gray-400">Loading operative directory...</div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-green-400">Operative Directory</h1>
                    <div className="px-3 py-1 bg-green-900/30 text-green-500 rounded-full text-sm font-bold border border-green-800">
                        {users.length} Active Profiles
                    </div>
                </div>

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

                {/* Edit Modal / Area */}
                {editingUser && (
                    <div className="bg-gray-950 p-6 rounded-lg border border-green-600 shadow-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-100">Edit Permissions: {editingUser.username}</h2>
                            <span className="text-xs text-gray-500 font-mono italic">Identity Locked</span>
                        </div>
                        <form onSubmit={handleUpdate} className="flex gap-4 items-center">
                            <div className="flex-1">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Authorization Level</label>
                                <select
                                    value={newRole}
                                    onChange={(e) => setNewRole(e.target.value)}
                                    className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-2 text-white outline-none focus:border-green-500"
                                >
                                    <option value="user">Field Operative</option>
                                    <option value="hq">Command HQ</option>
                                </select>
                            </div>
                            <div className="flex gap-2 pt-5">
                                <button type="submit" className="px-6 py-2 bg-green-600 text-white font-bold rounded hover:bg-green-500 transition-colors">Grant Access</button>
                                <button type="button" onClick={() => setEditingUser(null)} className="px-6 py-2 bg-gray-800 text-gray-400 rounded hover:bg-gray-700 transition-colors">Cancel</button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-800/50 border-b border-gray-800">
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase">Username</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase">Role</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {users.map((user) => (
                                <tr key={user._id} className="hover:bg-gray-800/20 transition-colors">
                                    <td className="p-4 font-semibold text-gray-200">{user.username}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${user.role === 'hq' ? 'bg-purple-900 text-purple-200' : 'bg-blue-900 text-blue-200'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${user.status === 'approved' ? 'bg-green-900/40 text-green-400' :
                                            user.status === 'rejected' ? 'bg-red-900/40 text-red-400' :
                                                'bg-yellow-900/40 text-yellow-500'
                                            }`}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right space-x-2">
                                        <button onClick={() => handleStartEdit(user)} className="text-gray-400 hover:text-green-400 font-bold text-xs uppercase">Edit</button>
                                        <button onClick={() => handleDelete(user._id)} className="text-gray-600 hover:text-red-500 font-bold text-xs uppercase">Delete</button>
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
