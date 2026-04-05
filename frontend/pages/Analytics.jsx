import { useEffect, useState } from "react";
import { getAnalytics } from "../services/violations";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
} from "recharts";

const COLORS = ["#4F7DFF", "#38BDF8", "#22C55E", "#A78BFA"];

export default function Analytics() {
  const [barChartData, setBarChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);


  useEffect(() => {
    getAnalytics()
      .then((data) => {
        setBarChartData(Array.isArray(data) ? data : data?.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Analytics fetch failed", err);
        setError(true);
        setLoading(false);
      });
  }, []);

  const pieData = barChartData.map((d) => ({
    name: d.name,
    value: d.count,
  }));

  const totalViolations = barChartData.reduce(
    (s, d) => s + d.count,
    0
  );

  const mostCommon =
    barChartData.length > 0
      ? barChartData.reduce((a, b) =>
          b.count > a.count ? b : a
        ).name
      : "-";

  const peakCount =
    barChartData.length > 0
      ? Math.max(...barChartData.map((d) => d.count))
      : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Loading analytics…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-500">
        Failed to load analytics
      </div>
    );
  }

if (barChartData.length === 0) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">
        Traffic Analytics
      </h1>

      <div className="bg-white border border-gray-200 rounded-xl p-10 text-center text-gray-500">
        No analytics data available yet
      </div>
    </div>
  );
}


  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Traffic Analytics
        </h1>
        <p className="text-sm text-gray-500">
          Violation trends & distribution
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <MiniCard title="Total Violations" value={totalViolations} />
        <MiniCard title="Most Common" value={mostCommon} />
        <MiniCard title="Categories" value={barChartData.length} />
        <MiniCard title="Peak Count" value={peakCount} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="analytics-card min-h-[320px]">
          <h2 className="analytics-title">Violations by Type</h2>
          <ResponsiveContainer width="100%" height={260}>
            {barChartData.length > 0 && (
              <BarChart data={barChartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#4F7DFF" radius={[6, 6, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="analytics-card">
          <h2 className="analytics-title">Violation Distribution</h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              {pieData.length > 0 && (
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={95}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
              )}
              <Tooltip />
              <Legend verticalAlign="bottom" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insights */}
      <div className="analytics-card">
        <h2 className="analytics-title">Insights</h2>
        <ul className="list-disc ml-5 space-y-1 text-gray-600 text-sm">
          <li>Overspeeding dominates across all zones</li>
          <li>Evening hours show peak violations</li>
          <li>No Helmet cases frequent on highways</li>
          <li>Signal jumps high at busy intersections</li>
        </ul>
      </div>
    </div>
  );
}

function MiniCard({ title, value }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl px-5 py-4 shadow-sm">
      <p className="text-xs text-gray-500">{title}</p>
      <p className="text-2xl font-semibold text-gray-900">{value}</p>
    </div>
  );
}
