import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden">
      <Sidebar />
      <main className="flex-1 p-6 text-white min-w-0">
        {children}
      </main>
    </div>
  );
};

export default Layout;