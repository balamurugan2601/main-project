import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <div className="flex h-screen bg-[#F8F3F0] overflow-hidden font-sans">
      <Sidebar />
      <main className="flex-1 p-8 text-black overflow-y-auto">
        <div className="max-w-7xl mx-auto h-full">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;