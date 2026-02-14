import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { login as loginAPI } from '../../services/api';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, logout } = useAuth();
  const navigate = useNavigate();

  // Security: Invalidate session when hitting the login page
  useEffect(() => {
    logout();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userData = await loginAPI(username, password);

      // Check enrollment status
      if (userData.status === 'rejected') {
        setError('Your account has been REJECTED by HQ. Access to the communication network is denied.');
        setLoading(false);
        return;
      }

      if (!userData.isApproved) {
        setError('Your account is PENDING HQ approval. Please wait for authorization.');
        setLoading(false);
        return;
      }

      // Login successful
      login(userData);

      // Redirect based on role
      if (userData.role === 'hq') {
        navigate('/dashboard');
      } else {
        navigate('/chat');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F3F0] flex items-center justify-center px-4 font-sans">
      <div className="bg-white rounded-lg shadow-xl p-10 w-full max-w-md border border-gray-200">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-[#014BAA] tracking-tight mb-2">
            DefComm
          </h1>
          <p className="text-gray-500 text-sm font-medium">SECURE COMMUNICATION PORTAL</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-bold text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#014BAA] focus:border-transparent transition-all disabled:opacity-50"
              placeholder="Enter your username"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#014BAA] focus:border-transparent transition-all disabled:opacity-50"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#014BAA] hover:bg-[#013B8A] text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md mt-4"
          >
            {loading ? 'Authenticating...' : 'Login'}
          </button>
        </form>

        <p className="text-sm text-center text-gray-500 mt-8">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-[#014BAA] font-bold hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
