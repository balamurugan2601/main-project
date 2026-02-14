import { useState } from 'react';
import { Link } from 'react-router-dom';
import { register as registerAPI } from '../../services/api';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await registerAPI(username, password, role);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F8F3F0] text-black font-sans px-4">
        <div className="w-full max-w-md p-10 space-y-6 bg-white rounded-lg shadow-xl border border-gray-200 text-center">
          <h2 className="text-2xl font-bold text-[#014BAA]">Registration Successful!</h2>
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-4 rounded-md text-left">
            <p className="mb-2 font-medium">Your account has been created successfully.</p>
            <p className="font-bold text-sm text-green-900">⏳ Account pending HQ approval</p>
            <p className="text-xs mt-2 text-green-700">Please wait for an HQ administrator to approve your account before logging in.</p>
          </div>
          <Link
            to="/login"
            className="block w-full py-3 font-bold text-center text-white bg-[#014BAA] rounded-lg hover:bg-[#013B8A] transition-colors shadow-md"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F8F3F0] text-black font-sans px-4">
      <div className="w-full max-w-md p-10 space-y-6 bg-white rounded-lg shadow-xl border border-gray-200">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-[#014BAA]">Register</h2>
          <p className="text-gray-500 text-sm mt-1">Create your DefComm account</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md shadow-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-bold text-gray-700">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#014BAA] focus:border-transparent transition-all"
              required
              disabled={loading}
              minLength={3}
              maxLength={30}
              pattern="[a-zA-Z0-9_]+"
              title="Username can only contain letters, numbers, and underscores"
            />
            <p className="text-xs text-gray-400 mt-1">3-30 characters, letters, numbers, and underscores only</p>
          </div>
          <div>
            <label className="block mb-1 text-sm font-bold text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#014BAA] focus:border-transparent transition-all"
              required
              disabled={loading}
              minLength={6}
            />
            <p className="text-xs text-gray-400 mt-1">Minimum 6 characters</p>
          </div>
          <div>
            <label className="block mb-1 text-sm font-bold text-gray-700">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#014BAA] focus:border-transparent transition-all text-black"
              disabled={loading}
            >
              <option value="user">User (Standard)</option>
              <option value="hq">HQ (Administrator)</option>
            </select>
            <p className="text-xs text-gray-400 mt-1">Select your intended role</p>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 font-bold text-white bg-[#014BAA] rounded-lg hover:bg-[#013B8A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md mt-4"
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <p className="text-sm text-center text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="text-[#014BAA] font-bold hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
