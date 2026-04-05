import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { rolePages } from "./roleAccess";

export default function ProtectedRoute({ children }) {
  const { token, role } = useAuth();
  const location = useLocation();

  if (!token) return <Navigate to="/login" replace />;

  const allowedPaths =
    rolePages[role]?.map((p) => p.path) || [];

  const currentPath = location.pathname;

  const isAllowed = allowedPaths.some((p) =>
    currentPath.startsWith(p)
  );

  if (!isAllowed) return <Navigate to="/" replace />;

  return children;
}