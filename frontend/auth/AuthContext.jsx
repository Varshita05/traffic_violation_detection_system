import { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(localStorage.getItem("role"));
  const [loading, setLoading] = useState(false);

  const login = async (username, password, selectedRole) => {
  setLoading(true);

  try {
    const res = await fetch("http://localhost:5000/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
        role: selectedRole,
      }),
    });

    const val = await res.json();

    if (!res.ok) {
      return {
        success: false,
        message: val.message || "Login failed",
      };
    }

    const d = jwtDecode(val.access_token);

    const data = {
      token: val.access_token,
      user: d.sub,
      role: d.sub.role,
    };

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    localStorage.setItem("role", data.role);

    setToken(data.token);
    setUser(data.user);
    setRole(data.role);

    return { success: true };

  } catch (err) {
    console.error("Login error:", err);
    return {
      success: false,
      message: "Something went wrong",
    };
  } finally {
    setLoading(false);
  }
};

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    setToken(null);
    setRole(null);
  };

  const authFetch = async (url, options = {}) => {
    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      Authorization: token ? `Bearer ${token}` : "",
    };

    const res = await fetch(url, {
      ...options,
      headers,
    });

    if (res.status === 401) {
      logout(); // auto logout if token invalid
    }

    return res;
  };

  useEffect(() => {
    const syncAuth = () => {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");
      const storedRole = localStorage.getItem("role");

      setToken(storedToken);
      setUser(storedUser ? JSON.parse(storedUser) : null);
      setRole(storedRole);
    };

    window.addEventListener("storage", syncAuth);
    return () => window.removeEventListener("storage", syncAuth);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        token,
        role,
        user,
        loading,
        login,
        logout,
        authFetch,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);