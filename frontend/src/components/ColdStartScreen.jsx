import { useState, useEffect, useRef } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "";

const TIPS = [
  "💡 This app lets you manage employees, track attendance, and view reports.",
  "📊 Dashboard shows real-time charts and attendance breakdown.",
  "🌙 Toggle dark/light mode from the header bar anytime.",
  "📥 Export employee data as CSV from the Employees page.",
  "✏️ Edit or remove employees directly from the table.",
  "📅 Mark and filter attendance records by date range.",
];

function ColdStartScreen({ onReady }) {
  const [statusIndex, setStatusIndex] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);
  const [dots, setDots] = useState("");

  const statusMessages = [
    "Connecting to server",
    "Server is waking up, hang tight",
    "Still loading — free-tier servers sleep after inactivity",
    "Almost there, preparing your dashboard",
    "Just a few more seconds",
  ];

  useEffect(() => {
    checkServer();

    // rotate status messages
    const statusTimer = setInterval(() => {
      setStatusIndex((prev) => Math.min(prev + 1, statusMessages.length - 1));
    }, 10000);

    // rotate tips
    const tipTimer = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % TIPS.length);
    }, 5000);

    // animate dots
    const dotTimer = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);

    return () => {
      clearInterval(statusTimer);
      clearInterval(tipTimer);
      clearInterval(dotTimer);
    };
  }, []);

  async function checkServer() {
    try {
      const response = await fetch(`${API_BASE}/`, {
        signal: AbortSignal.timeout(10000),
      });
      if (response.ok) {
        setTimeout(() => onReady(), 500);
        return;
      }
    } catch (err) {
      // not ready
    }

    setTimeout(checkServer, 5000);
  }

  return (
    <div className="cold-start-screen">
      <div className="cold-start-content">
        <div className="cold-start-logo">HR</div>
        <h2>HRMS Lite</h2>
        <p className="cold-start-subtitle">HR Management System</p>

        <div className="cold-start-bar">
          <div className="cold-start-bar-fill"></div>
        </div>

        <div className="cold-start-status">
          {statusMessages[statusIndex]}{dots}
        </div>

        <div className="cold-start-tip" key={tipIndex}>
          {TIPS[tipIndex]}
        </div>
      </div>

      <div className="cold-start-footer">
        Powered by FastAPI + React &middot; Deployed on Render + Vercel
      </div>
    </div>
  );
}

export default ColdStartScreen;
