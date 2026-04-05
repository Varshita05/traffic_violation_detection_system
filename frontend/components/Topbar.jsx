import { useAuth } from "../auth/AuthContext";

export default function Topbar() {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 sticky top-0 z-20 bg-white/80 backdrop-blur border-b shadow-sm">
      <div className="flex items-center justify-between h-full px-6">
        {/* Left: User Info */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Logged in as</span>
          <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase bg-green-100 text-green-700">
            {user?.role}
          </span>
        </div>

        {/* Right: Actions */}
        <button
          onClick={logout}
          className="flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700 transition"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
