import { useEffect, useState } from "react";
import { getReports } from "../services/violations";

export default function Reports() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [type, setType] = useState("All");
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const fetchReports = async () => {
  setLoading(true);
  setError(false);

  try {
    const data = await getReports(fromDate, toDate, type);
    const normalized = Array.isArray(data)
      ? data
      : data?.data || data?.reports || [];

    setReports(normalized);
  } catch (err) {
    console.error("Failed to fetch reports", err);
    setError(true);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchReports();
  }, []);  

  const totalViolations = reports.length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Reports</h1>
        <button
          onClick={() => window.open("http://localhost:5000/api/reports/pdf")}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Download PDF
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="text-sm text-gray-600">From Date</label>
          <input
            type="date"
            className="w-full border p-2 rounded"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm text-gray-600">To Date</label>
          <input
            type="date"
            className="w-full border p-2 rounded"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm text-gray-600">Violation Type</label>
          <select
            className="w-full border p-2 rounded"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="All">All</option>
            <option value="Over Speeding">Over Speeding</option>
            <option value="Signal Jump">Signal Jump</option>
            <option value="No Helmet">No Helmet</option>
            <option value="No Seatbelt">No Seatbelt</option>
            <option value="Wrong Lane">Wrong Lane</option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={fetchReports}
            className="w-full bg-gray-800 text-white p-2 rounded hover:bg-gray-900"
          >
            Apply Filters
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          ["Total Violations", totalViolations],
        ].map(([title, value]) => (
          <div key={title} className="bg-white p-5 rounded-xl shadow">
            <p className="text-gray-500 text-sm">{title}</p>
            <h2 className="text-2xl font-bold">{value}</h2>
          </div>
        ))}
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Timestamp</th>
              <th className="p-3">Vehicle Number</th>
              <th className="p-3">Violation Type</th>
              <th className="p-3">Confidence</th>
              <th className="p-3">Vehicle Type</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="p-4 text-center">
                  Loading...
                </td>
              </tr>
            ) : reports.length ? (
              reports.map((r) => (
                <tr key={r.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{r.timestamp}</td>
                  <td className="p-3">{r.vehicle_number}</td>
                  <td className="p-3">{r.violation_type}</td>
                  <td className="p-3">{r.confidence}</td>
                  <td className="p-3">{r.vehicle_type}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="p-3 text-center text-gray-500">
                  No reports found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {error && (
        <div className="text-red-600 text-center">
          Failed to load reports. Please try again.
        </div>
      )}
    </div>
  );
}
