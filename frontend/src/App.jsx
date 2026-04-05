import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "../auth/AuthContext";
import MainLayout from "../components/MainLayout";
import ProtectedRoute from "../auth/ProtectedRoute";
import Login from "../pages/Login";
import { rolePages } from "../auth/roleAccess";

import Dashboard from "../pages/Dashboard";
import Violations from "../pages/Violations";
import Analytics from "../pages/Analytics";
import Reports from "../pages/Reports";
import Users from "../pages/Users";
import Settings from "../pages/Settings";

const pages = [
  { path: "/", element: <Dashboard /> },
  { path: "/violations", element: <Violations /> },
  { path: "/analytics", element: <Analytics /> },
  { path: "/reports", element: <Reports /> },
  { path: "/users", element: <Users /> },
  { path: "/settings", element: <Settings /> },
];


const AppRoutes = () => {
  const { token } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={token ? <Navigate to="/" /> : <Login />}
      />

      {pages.map(({ path, element }) => {
        
        const allowedRoles = Object.keys(rolePages).filter((role) =>
          rolePages[role].some((p) => p.path === path)
        );

        return (
          <Route
            key={path}
            path={path}
            element={
              <ProtectedRoute allowedRoles={allowedRoles}>
                <MainLayout>{element}</MainLayout>
              </ProtectedRoute>
            }
          />
        );
      })}

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};


export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}