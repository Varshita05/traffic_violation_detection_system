import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { roleNames } from "../auth/roleAccess";


export default function Login() {

    const [error, setError] = useState("");

    const [form, setForm] = useState({
        username: "",
        password: "",
        role: "Commoner",
      });

    const { login } = useAuth();
    const navigate = useNavigate();
    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        if (!form.username || !form.password) {
        setError("Please fill all fields");
        return;
    }
    const res = await login(form.username, form.password, form.role);

    if (res.success) {
        console.log("Login successful, navigating to dashboard...");
        navigate("/dashboard");
    } else {
        setError(res.message);
    }
    };

    return (
        <div className="h-screen flex items-center justify-center bg-gradient-to-r from-blue-400 to-indigo-600">
        <div className="bg-white p-8 rounded-2xl shadow-lg w-80">
            <h1 className="text-2xl font-bold mb-6 text-center">🚦 Traffic Violation Detection System Login</h1>

            <input type="text" placeholder="Username"
                className="w-full px-4 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 mb-4"
                value={form.username} onChange={(e) =>
                    setForm({ ...form, username: e.target.value })
                }
            />
            
            <input type="password" placeholder="Password"
                className="w-full px-4 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 mb-4"
                value={form.password} onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                }
            />
            
            <select
                className="w-full px-4 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 mb-4"
                value={form.role} onChange={(e) =>
                    setForm({ ...form, role: e.target.value })
                }
            >
                {Object.entries(roleNames).map(([key, label]) => (
                    <option key={key} value={key}>
                        {label}
                    </option>
                ))}
            </select>


            {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

            <button
            onClick={handleLogin}
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition"
            >
                Login
            </button>
        </div>
        </div>
    );
    }
