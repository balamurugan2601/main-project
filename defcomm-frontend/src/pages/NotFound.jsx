import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-6xl font-bold">404</h1>
      <p className="mt-4 text-xl">Page Not Found</p>
      <Link to="/login" className="mt-6 text-blue-400 hover:underline">
        Go to Login
      </Link>
    </div>
  );
};

export default NotFound;
