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
    <div className="w-64 bg-[#014BAA] flex flex-col justify-between p-6 shadow-xl z-10 shrink-0">
      <div>
        <div className="mb-10 pl-2">
          <h1 className="text-3xl font-bold !text-white tracking-tight">DefComm</h1>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `block px-4 py-3 rounded-md transition-all duration-200 font-medium ${isActive
                  ? 'bg-white text-[#014BAA] shadow-md transform translate-x-1'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="space-y-6">
        {/* Profile Details */}
        <div className="bg-black/10 p-4 rounded-lg border border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white text-[#014BAA] rounded-full flex items-center justify-center font-bold shadow-sm">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <div className="text-sm font-bold text-white truncate">
                {user.username}
              </div>
              <div className="text-[10px] text-white/80 font-semibold uppercase tracking-wider">
                {user.role === 'hq' ? 'Command HQ' : 'Field Operative'}
              </div>
            </div>
          </div>
          <div className="pt-2 border-t border-white/10 mt-2">
            <div className="text-[10px] text-white/60 uppercase font-bold tracking-tighter">
              Account Status: Verified
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full px-4 py-3 bg-white/10 text-white rounded-md hover:bg-white/20 transition-colors border border-transparent font-semibold text-sm tracking-wide"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;