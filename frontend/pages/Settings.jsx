import { useState } from "react";
import { io } from "socket.io-client";

export default function Settings() {
  const [settings, setSettings] = useState(() => {
  const saved = localStorage.getItem("settings");
  return saved
    ? JSON.parse(saved)
    : {
        speedLimit: 60,
        ocrLanguage: "English (India)",
        trackingAlgorithm: "DeepSORT",
        detectionModel: "YOLOv11",
        cameraFPS: 10,
        autoFine: true,
      };
});

  const handleChange = (key, value) => {
    setSettings({ ...settings, [key]: value });
  };

 

const socket = io("http://localhost:5000");

const handleSave = (e) => {
  e.preventDefault();

  localStorage.setItem("settings", JSON.stringify(settings)); // ⭐ save

  socket.emit("update_settings", settings);

  alert("Settings saved!");
};

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">System Settings</h1>

      {/* General Settings */}
      <div className="card bg-white p-6 rounded-xl shadow space-y-4">
        <h2 className="text-xl font-semibold">General Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-gray-600 text-sm">Speed Limit (km/h)</label>
            <input
              type="number"
              value={settings.speedLimit}
              onChange={(e) => handleChange("speedLimit", e.target.value)}
              className="w-full border p-2 rounded mt-1"
            />
          </div>
          <div>
            <label className="text-gray-600 text-sm">OCR Language</label>
            <select
              value={settings.ocrLanguage}
              onChange={(e) => handleChange("ocrLanguage", e.target.value)}
              className="w-full border p-2 rounded mt-1"
            >
              <option>English (India)</option>
              <option>English (US)</option>
            </select>
          </div>
          <div>
            <label className="text-gray-600 text-sm">Tracking Algorithm</label>
            <select
              value={settings.trackingAlgorithm}
              onChange={(e) => handleChange("trackingAlgorithm", e.target.value)}
              className="w-full border p-2 rounded mt-1"
            >
              <option>DeepSORT</option>
              <option>SORT</option>
            </select>
          </div>
          <div>
            <label className="text-gray-600 text-sm">Detection Model</label>
            <select
              value={settings.detectionModel}
              onChange={(e) => handleChange("detectionModel", e.target.value)}
              className="w-full border p-2 rounded mt-1"
            >
              <option>YOLOv11</option>
              <option>YOLOv7</option>
            </select>
          </div>
          <div>
            <label className="text-gray-600 text-sm">Camera FPS</label>
            <input
              type="number"
              value={settings.cameraFPS}
              onChange={(e) => handleChange("cameraFPS", Math.min(10, parseInt(e.target.value) || 10))}
              className="w-full border p-2 rounded mt-1"
            />
          </div>
          <div className="flex items-center mt-5 md:mt-0">
            <label className="text-gray-600 mr-3">Violation Auto-Fine</label>
            <input
              type="checkbox"
              checked={settings.autoFine}
              onChange={(e) => handleChange("autoFine", e.target.checked)}
              className="h-5 w-5 accent-blue-600"
            />
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700"
          >
            Save Changes
          </button>
        </div>
      </div>

      <div className="text-sm text-gray-600">
        Adjust system parameters here. Changes will affect real-time detection and violation processing.
      </div>
    </div>
  );
}
