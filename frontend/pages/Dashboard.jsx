import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

export default function Dashboard() {
  const socketRef = useRef(null);

  const [frame, setFrame] = useState(null);
  const [stats, setStats] = useState({});
  const [violations, setViolations] = useState([]);

  useEffect(() => {
    socketRef.current = io("http://localhost:5000", {
      transports: ["websocket", "polling"],
    });

    socketRef.current.on("video_frame", (data) => {
      setFrame(`data:image/jpeg;base64,${data}`);
    });

    socketRef.current.on("stats", (data) => {
      setStats(data);
    });

    socketRef.current.on("violations", (data) => {
      setViolations(data);
    });

    return () => socketRef.current.disconnect();
  }, []);

  return (
    <div className="flex h-screen bg-[#0B1220] text-gray-200">
      {/* MAIN PANEL */}
      <div className="flex-1 flex flex-col p-6 gap-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">
            🚦 AI Traffic Monitoring
          </h2>

          <div className="flex gap-3">
            <button
              onClick={() => socketRef.current.emit("start_detection")}
              disabled={stats.detection}
              className="px-5 py-2 bg-green-600 rounded-lg text-sm font-medium disabled:bg-gray-600"
            >
              ▶ Start
            </button>

            <button
              onClick={() => socketRef.current.emit("stop_detection")}
              disabled={!stats.detection}
              className="px-5 py-2 bg-red-600 rounded-lg text-sm font-medium disabled:bg-gray-600"
            >
              ⛔ Stop
            </button>
          </div>
        </div>

        {/* Video Feed */}
        <div className="bg-[#121C31] border border-[#1F2A44] rounded-xl overflow-hidden shadow">
          {frame ? (
            <img src={frame} className="w-full max-h-[420px] object-contain bg-black" />
          ) : (
            <div className="h-[420px] flex items-center justify-center text-gray-400">
              Waiting for video stream...
            </div>
          )}
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-4">
          <Metric
            title="Detection"
            value={stats.detection ? "ACTIVE" : "STOPPED"}
            color={stats.detection ? "text-green-400" : "text-red-400"}
          />
          <Metric title="Vehicles Detected" value={stats.vehicle_count} />
          <Metric
            title="Violations"
            value={stats.violation_count}
            color="text-red-400"
          />
          <Metric
            title="Speed Limit"
            value={stats.speed_limit ? `${stats.speed_limit} km/h` : "-"}
          />
          <Metric
            title="Camera FPS"
            value={stats.camera_fps ? stats.camera_fps : "-"}
          />
        </div>
      </div>

      {/* RIGHT SIDEBAR */}
      <div className="w-[240px] bg-[#0E1627] border-l border-[#1F2A44] p-5 overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">Recent Violations</h3>

        {!stats.detection && (
          <p className="text-gray-400 text-sm">
            Detection is currently OFF
          </p>
        )}

        {stats.detection && violations.length === 0 && (
          <p className="text-gray-400 text-sm">
            No violations detected yet
          </p>
        )}

        <div className="space-y-3 mt-3">
          {violations.map((v, i) => (
            <div
              key={i}
              className="p-3 bg-[#121C31] border border-red-500/40 rounded-lg"
            >
              <p className="text-sm">
                <span className="text-gray-400">Vehicle:</span>{" "}
                <b>{v.id}</b>
              </p>
              <p className="text-sm">
                <span className="text-gray-400">Speed:</span>{" "}
                {v.speed} km/h
              </p>
              <p className="text-sm text-red-400 font-semibold">
                {v.type}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Metric({ title, value, color = "text-white" }) {
  return (
    <div className="bg-[#121C31] border border-[#1F2A44] rounded-xl px-5 py-4">
      <p className="text-sm text-gray-400">{title}</p>
      <p className={`text-2xl font-bold ${color}`}>
        {value ?? "-"}
      </p>
    </div>
  );
}
