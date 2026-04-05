import { NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { rolePages, roleNames } from "../auth/roleAccess";

export default function Sidebar() {
  const { role } = useAuth();

  const roleStyles = {
    Admin: "bg-red-600/20 text-red-400 border-red-500/30",
    Analyst: "bg-blue-600/20 text-blue-400 border-blue-500/30",
    Commoner: "bg-green-600/20 text-green-400 border-green-500/30",
  };

  return (
    <aside className="w-64 min-h-screen bg-slate-900 text-white flex flex-col border-r border-slate-800">
      {/* Logo & Role */}
      <div className="px-6 py-6 border-b border-slate-800">
        <h1 className="text-xl font-bold flex items-center gap-2">
          🚦 <span>AI Traffic</span>
        </h1>

        <span
          className={`mt-4 inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold uppercase border ${roleStyles[role]}`}
        >
          {roleNames[role]}
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 mt-6 px-3 space-y-1">
        {rolePages[role]?.map((page) => (
          <NavLink
            key={page.path}
            to={page.path}
            className={({ isActive }) =>
              `
              flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium
              transition-all duration-200
              ${
                isActive
                  ? "bg-slate-800 text-white shadow-inner"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }
            `
            }
          >
            <span className="h-2 w-2 rounded-full bg-slate-500"></span>
            {page.label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-slate-800 text-xs text-slate-400 text-center">
        © 2025 AI Traffic System
      </div>
    </aside>
  );
}
