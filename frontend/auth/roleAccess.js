export const rolePages = {
  Admin: [
    { path: "/", label: "Dashboard" },
    { path: "/analytics", label: "Analytics" },
    { path: "/users", label: "Users" },
    { path: "/settings", label: "Settings" },
    { path: "/reports", label: "Reports" },
    { path: "/violations", label: "Violations" },
  ],
  Analyst: [
    { path: "/", label: "Dashboard" },
    { path: "/analytics", label: "Analytics" },
    { path: "/violations", label: "Violations" },
    { path: "/reports", label: "Reports" },
  ],
  Commoner: [
    { path: "/", label: "Dashboard" },
    { path: "/analytics", label: "Analytics" },
  ],
};

export const roleNames = {
  Admin: "Admin",
  Analyst: "Analyst",
  Commoner: "Commoner",
};
