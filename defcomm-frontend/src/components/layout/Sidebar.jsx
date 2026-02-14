import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userMenu = [
    { name: 'Chat', path: '/chat' },
    { name: 'Groups', path: '/groups' }
  ];

  const hqMenu = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Approvals', path: '/approvals' },
    { name: 'Manage Groups', path: '/hq/groups' },
    { name: 'Manage Users', path: '/hq/users' }
  ];

  const menuItems = user.role === 'user' ? userMenu : hqMenu;

  return (
    <div className="w-64 bg-gray-900 flex flex-col justify-between p-6">
      <div>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-green-400">DefComm</h1>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `block px-4 py-2 rounded-lg transition-colors ${isActive
                  ? 'text-green-400 bg-gray-800'
                  : 'text-gray-300 hover:text-green-400 hover:bg-gray-800'
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="space-y-4">
        {/* Profile Details */}
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-900 rounded-full flex items-center justify-center text-green-400 font-bold border border-green-700">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <div className="text-sm font-bold text-gray-100 truncate">
                {user.username}
              </div>
              <div className="text-xs text-green-500 font-semibold uppercase tracking-wider">
                {user.role === 'hq' ? 'Command HQ' : 'Field Operative'}
              </div>
            </div>
          </div>
          <div className="pt-2 border-t border-gray-700 mt-2">
            <div className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">
              Account Status: Verified
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:text-green-400 hover:bg-gray-700 transition-colors border border-transparent hover:border-gray-600 font-semibold text-sm"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;