import { useEffect, useState } from "react";
import axios from "axios";

export default function Violations() {
  const [violations, setViolations] = useState([]);
  const [search, setSearch] = useState("");

  const [selectedItem, setSelectedItem] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [loadingId, setLoadingId] = useState(null);

  const [visibleCount, setVisibleCount] = useState(15);
  const [filterStatus, setFilterStatus] = useState("All");

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/violations")
      .then((res) => setViolations(res.data || []))
      .catch((err) => console.error("API error:", err));
  }, []);

  const filtered = violations
  .filter((v) => {
    const matchSearch =
      (v.plate_number || "").toLowerCase().includes(search.toLowerCase()) ||
      (v.violation_type || "").toLowerCase().includes(search.toLowerCase());

    const matchStatus =
      filterStatus === "All"
        ? true
        : filterStatus === "Pending"
        ? v.status !== "Resolved"
        : v.status === "Resolved";

    return matchSearch && matchStatus;
  })
  .slice(0, visibleCount);

  // 🎯 Handlers
  const handleView = (item) => {
    setSelectedItem(item);
    setShowViewModal(true);
  };

  const handleResolve = async (id) => {
    setLoadingId(id);

    try {
      console.log(id);
      await axios.put(`http://localhost:5000/api/violations/${id}/resolve`);
      setViolations((prev) =>
        prev.map((v) =>
          v.id === id ? { ...v, status: "Resolved" } : v
        )
      );
    } catch (err) {
      console.log(err);
      alert("Failed to resolve");
    }

    setLoadingId(null);
  };

  // 🎨 Badge colors
  const getBadgeColor = (type) => {
    switch (type) {
      case "Over Speeding":
        return "bg-red-600 text-white";
      case "Signal Jump":
        return "bg-yellow-500 text-white";
      case "Wrong Lane":
        return "bg-orange-500 text-white";
      case "No Helmet":
        return "bg-blue-600 text-white";
      default:
        return "bg-gray-400 text-white";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">

  {/* LEFT: Title + Count */}
  <div>
    <h2 className="text-lg font-semibold">Violations</h2>
    <p className="text-xs text-gray-500">
      Showing {filtered.length} records
    </p>
  </div>

  {/* RIGHT: Filters + Search */}
  <div className="flex items-center gap-2 w-full md:w-auto">

    {/* Status Tabs */}
    <div className="flex bg-gray-100 rounded-lg p-1">
      {["All", "Pending", "Resolved"].map((status) => (
        <button
          key={status}
          onClick={() => {
            setFilterStatus(status);
            setVisibleCount(15);
          }}
          className={`px-3 py-1 text-xs rounded-md transition
            ${
              filterStatus === status
                ? "bg-white shadow text-blue-600"
                : "text-gray-600 hover:text-black"
            }`}
        >
          {status}
        </button>
      ))}
    </div>

    {/* Search Input */}
    <input
      type="text"
      placeholder="Search..."
      className="border px-3 py-1.5 rounded-lg text-sm w-40 md:w-56 focus:ring-2 focus:ring-blue-400 outline-none"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
    />

  </div>
</div>

      {/* Table */}
      <div className="overflow-x-auto bg-white shadow rounded-xl">
        <table className="w-full text-center text-sm">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-4">Vehicle Number</th>
              <th className="p-4">Violation</th>
              <th className="p-4">Timestamp</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.length ? (
              filtered.map((v) => (
                <tr key={v.id} className="border-t hover:bg-gray-50">
                  <td className="p-2 font-medium">{v.vehicle_number}</td>

                  <td className="p-2">
                    <span className={`px-2 py-1 rounded text-xs ${getBadgeColor(v.violation_type)}`}>
                      {v.violation_type}
                    </span>
                  </td>

                  <td className="p-2">{v.timestamp}</td>

                  <td className="p-2 flex justify-center gap-2">

                    {/* VIEW */}
                    <button
                      onClick={() => handleView(v)}
                      className="bg-blue-500 text-white px-3 py-1 rounded-lg text-xs hover:bg-blue-600"
                    >
                      View
                    </button>

                    {/* RESOLVE */}
                    <button
                      onClick={() => handleResolve(v.id)}
                      disabled={v.status === "Resolved" || loadingId === v.id}
                      className={`px-3 py-1 rounded-lg text-xs text-white
                        ${v.status === "Resolved"
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-green-500 hover:bg-green-600"
                        }`}
                    >
                      {loadingId === v.id
                        ? "Resolving..."
                        : v.status === "Resolved"
                        ? "✔ Done"
                        : "Resolve"}
                    </button>

                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="p-3 text-gray-500">
                  No violations found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center mt-4">
  {visibleCount < violations.length && (
    <button
      onClick={() => setVisibleCount(violations.length)}
      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
    >
      View All
    </button>
  )}
</div>

      {/* VIEW MODAL */}
      {showViewModal && selectedItem && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">

    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fadeIn">

      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">
          🚨 Violation Details
        </h2>
        <button
          onClick={() => setShowViewModal(false)}
          className="text-gray-500 hover:text-red-500 text-lg"
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div className="space-y-3 text-sm">

        <div className="flex justify-between">
          <span className="text-gray-500">Plate Number</span>
          <span className="font-semibold">{selectedItem.vehicle_number}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500">Violation</span>
          <span className="px-2 py-1 rounded text-xs font-semibold bg-red-100 text-red-600">
            {selectedItem.violation_type}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500">Confidence</span>
          <span className="font-semibold">
            {Math.round((selectedItem.confidence || 0) * 100)}%
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500">Time</span>
          <span className="font-semibold">{selectedItem.timestamp}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500">Status</span>
          <span
            className={`px-2 py-1 rounded text-xs font-semibold ${
              selectedItem.status === "Resolved"
                ? "bg-green-100 text-green-600"
                : "bg-yellow-100 text-yellow-600"
            }`}
          >
            {selectedItem.status || "Pending"}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end mt-6">
        <button
          onClick={() => setShowViewModal(false)}
          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
        >
          Close
        </button>
      </div>

    </div>
  </div>
)}
    </div>
  );
}