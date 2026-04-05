import { useEffect, useMemo, useState } from "react";
import axios from "axios";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState(null);

  const [form, setForm] = useState({
    username: "",
    role: "",
    status: "Active",
    password: ""
  });

  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  const [page, setPage] = useState(1);
  const perPage = 5;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/users");
      setUsers(res.data);
    } catch (err) {
      console.log(err);
      alert("Failed to fetch users");
    }
  };

  const filteredUsers = useMemo(() => {
    let data = [...users];

    if (search.trim()) {
      data = data.filter((u) =>
        u.username.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (filterRole !== "All") data = data.filter((u) => u.role === filterRole);
    if (filterStatus !== "All") data = data.filter((u) => u.status === filterStatus);

    return data;
  }, [users, search, filterRole, filterStatus]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / perPage));
  const paginatedUsers = filteredUsers.slice((page - 1) * perPage, page * perPage);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, filterRole, filterStatus]);

  // ----------------- Actions -----------------
  const handleEdit = (user) => {
    setEditingUser(user);
    setForm({
      username: user.username,
      role: user.role,
      status: user.status,
      password: ""
    });
  };

  const saveEdit = async () => {
    if (!form.username || !form.role || !form.status)
      return alert("Please fill all fields!");

    try {
      const payload = {
        username: form.username,
        role: form.role,
        status: form.status,
      };

      if (form.password) {
        payload.password = form.password;
      }
      console.log(payload, editingUser);
      await axios.put(
        `http://localhost:5000/api/users/${editingUser.id}`,
        payload
      );

      fetchUsers();
      setEditingUser(null);
    } catch (err) {
      console.log(err);
      alert("Failed to update user");
    }
  };

  const confirmDelete = (id) => {
    setDeleteUserId(id);
    setShowDeleteModal(true);
  };

  const deleteUser = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/users/${deleteUserId}`);
      fetchUsers();
      setShowDeleteModal(false);
    } catch (err) {
      console.log(err);
      alert("Failed to delete user");
    }
  };

  const addUser = async () => {
    if (!form.username || !form.role || !form.password || !form.status)
      return alert("Please fill all fields!");

    try {
      await axios.post("http://localhost:5000/api/users", form);
      fetchUsers();
      setForm({ username: "", role: "", status: "Active", password: "" });
      setEditingUser(null);
    } catch (err) {
      console.log(err);
      alert("Failed to add user");
    }
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <h1 className="text-3xl font-bold">System Users</h1>
        <div className="flex gap-2">
          <button
            className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
            onClick={() => {
              setEditingUser({ id: null });
              setForm({ username: "", role: "", status: "Active", password: "" });
            }}
          >
            + Add User
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <input
          className="border p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Search username..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="border p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
        >
          <option value="All">All Roles</option>
          <option value="Admin">Admin</option>
          <option value="Analyst">Analyst</option>
          <option value="Commoner">Commoner</option>
        </select>

        <select
          className="border p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="All">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>

        <div className="flex items-center justify-end">
          <div className="text-sm text-gray-500">
            Total: <span className="font-semibold text-black">{filteredUsers.length}</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4 font-semibold text-gray-600">Username</th>
              <th className="p-4 font-semibold text-gray-600">Role</th>
              <th className="p-4 font-semibold text-gray-600">Status</th>
              <th className="p-4 font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.map((user) => (
              <tr key={user.id} className="border-t hover:bg-gray-50">
                <td className="p-4 font-medium">{user.username}</td>
                <td className="p-4">{user.role}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${user.status === "Active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                    {user.status}
                  </span>
                </td>
                <td className="p-4 flex gap-2">
                  <button
                    className="px-3 py-1 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
                    onClick={() => handleEdit(user)}
                  >
                    Edit
                  </button>
                  <button
                    className="px-3 py-1 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
                    onClick={() => confirmDelete(user.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex justify-between items-center p-4 border-t">
          <span className="text-sm text-gray-600">
            Page <strong>{page}</strong> of <strong>{totalPages}</strong>
          </span>
          <div className="flex gap-2">
            <button
              className="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Prev
            </button>
            <button
              className="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-4">
              {editingUser.id ? "Edit User" : "Add New User"}
            </h2>

            <div className="grid grid-cols-1 gap-3">
              <input
                className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
              />

              <select
                className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value="">Select Role</option>
                <option value="Admin">Admin</option>
                <option value="Analyst">Analyst</option>
                <option value="Commoner">Commoner</option>
              </select>

              <select
                className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>

             
              <input
                className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Password"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
  
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
                onClick={() => setEditingUser(null)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                onClick={editingUser.id ? saveEdit : addUser}
              >
                {editingUser.id ? "Save" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-sm shadow-xl">
            <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
            <p className="mb-4">Are you sure you want to delete this user?</p>
            <div className="flex justify-end gap-2">
              <button className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
              <button className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700" onClick={deleteUser}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
