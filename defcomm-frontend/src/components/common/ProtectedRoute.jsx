import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <div className="text-green-400">Verifying session...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If a specific role is required and the user doesn't have it
  // Note: Adjust the condition based on how your user object is structured.
  // Assuming user object has a 'role' property.
  if (role && user.role !== role) {
    // Redirect to a page they are allowed to see, or a 403 page
    // For now, if they are logged in but wrong role, maybe go to their default dashboard
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
