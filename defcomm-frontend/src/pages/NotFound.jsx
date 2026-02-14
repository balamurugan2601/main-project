import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8F3F0] text-black font-sans">
      <h1 className="text-8xl font-black text-[#014BAA] opacity-20">404</h1>
      <div className="absolute flex flex-col items-center">
        <p className="text-2xl font-bold text-black">Page Not Found</p>
        <p className="text-gray-500 mt-2 mb-6">The secure path you are looking for does not exist.</p>
        <Link to="/login" className="px-6 py-2 bg-[#014BAA] text-white font-bold rounded-lg hover:bg-[#013B8A] transition-colors shadow-sm">
          Return to Safety
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
