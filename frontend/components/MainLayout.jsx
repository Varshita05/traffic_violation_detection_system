import Sidebar from "./Sidebar";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";

export default function MainLayout({ children }) {
  const { logout, role } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Section */}
      <div className="flex-1 flex flex-col">
        {/* Top Navbar */}
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b shadow-sm">
          <div className="flex justify-between items-center px-6 py-4">
            {/* Title */}
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-800">
                🚦 AI Traffic Violation System
              </h1>
              <p className="text-sm text-gray-500">
                Real-time monitoring & analytics
              </p>
            </div>

            {/* User Actions */}
            <div className="flex items-center gap-4">
              {/* Role Badge */}
              <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase bg-blue-100 text-blue-700">
                {role}
              </span>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg shadow hover:bg-red-600 active:scale-95 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
