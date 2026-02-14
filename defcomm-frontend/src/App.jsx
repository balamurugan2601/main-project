import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import Chat from "./pages/user/Chat";
import Groups from "./pages/user/Groups";

import HQDashboard from "./pages/hq/HQDashboard";
import Approvals from "./pages/hq/Approvals";
import ManageGroups from "./pages/hq/ManageGroups";
import ManageUsers from "./pages/hq/ManageUsers";

import NotFound from "./pages/NotFound";
import { ChatProvider } from "./context/ChatContext";
import ProtectedRoute from "./components/common/ProtectedRoute";
import ErrorBoundary from "./components/common/ErrorBoundary";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <Router>
      <AuthProvider>
        <ChatProvider>
          <ErrorBoundary>
            <Routes>

              {/* Redirect Root to Login */}
              <Route path="/" element={<Navigate to="/login" replace />} />

              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* User Routes */}
              <Route
                path="/chat"
                element={
                  <ProtectedRoute role="user">
                    <Chat />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/groups"
                element={
                  <ProtectedRoute role="user">
                    <Groups />
                  </ProtectedRoute>
                }
              />

              {/* HQ Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute role="hq">
                    <HQDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/approvals"
                element={
                  <ProtectedRoute role="hq">
                    <Approvals />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/hq/groups"
                element={
                  <ProtectedRoute role="hq">
                    <ManageGroups />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/hq/users"
                element={
                  <ProtectedRoute role="hq">
                    <ManageUsers />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<NotFound />} />

            </Routes>
          </ErrorBoundary>
        </ChatProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
