import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";

// Extended config: each emotion now has its own UI personality
const emotionConfig = {
  happy: {
    bg: "linear-gradient(135deg,#e6fff1,#ffffff)",
    accent: "#1aaf5d",
    title: "You look happy!",
    moodTag: "High energy · Positive",
    showHelp: false,
    fontSize: 16,
    workspaceTitle: "Productive and exploratory mode",
    background:"#9cff98ff",
    workspaceText:
      "You seem comfortable, so the interface exposes more options and encourages exploration.",
    primaryActionLabel: "Start something new",
  },
  sad: {
    bg: "linear-gradient(135deg,#e6ecff,#ffffff)",
    accent: "#3f51b5",
    title: "You look a bit down.",
    moodTag: "Low energy · Needs support",
    showHelp: true,
    fontSize: 18,
    workspaceTitle: "Gentle mode",
    background:"#9dafffff",
    workspaceText:
      "The interface is simplified to reduce pressure. You can take things slowly and focus on one task.",
    primaryActionLabel: "Do one small step",
  },
  angry: {
    bg: "linear-gradient(135deg,#ffe6e6,#ffffff)",
    accent: "#b71c1c",
    title: "You seem tense.",
    moodTag: "High energy · Stressed",
    showHelp: true,
    fontSize: 17,
    workspaceTitle: "Calm and focused mode",
    background:"#ffb6b6ff",
    workspaceText:
      "Animations and distractions are reduced. The UI guides you to resolve one thing at a time.",
    primaryActionLabel: "Resolve current issue",
  },
  surprised: {
    bg: "linear-gradient(135deg,#fff8e1,#ffffff)",
    accent: "#ff9800",
    title: "You seem surprised.",
    moodTag: "Alert · Curious",
    showHelp: false,
    fontSize: 16,
    workspaceTitle: "Orientation mode",
    background:"#ffca98ff",
    workspaceText:
      "You might be seeing something new. The interface highlights key information and orientation tips.",
    primaryActionLabel: "Take a quick tour",
  },
  neutral: {
    bg: "linear-gradient(135deg,#f5f5f5,#ffffff)",
    accent: "#1976d2",
    title: "All good, neutral mode.",
    moodTag: "Balanced · Default",
    showHelp: false,
    fontSize: 16,
    workspaceTitle: "Standard workspace",
    background:"#98d9ffff",
    workspaceText:
      "Everything is balanced. You see the usual controls without extra guidance or constraints.",
    primaryActionLabel: "Continue where you left off",
  },
};

export default function App() {
  const videoRef = useRef(null);
  const [emotion, setEmotion] = useState("neutral");
  const [status, setStatus] = useState("Starting...");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // responsive: track screen width
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // load models
  useEffect(() => {
    const loadModels = async () => {
      try {
        console.log("Loading models from /models ...");
        await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
        await faceapi.nets.faceExpressionNet.loadFromUri("/models");
        console.log("Models loaded.");
        setStatus("Models loaded. Starting camera...");
        startVideo();
      } catch (err) {
        console.error("Error loading models:", err);
        setStatus("Error loading models. See console.");
      }
    };
    loadModels();
  }, []);

  // start camera
  const startVideo = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setStatus("Camera started. Detecting emotion...");
      })
      .catch((err) => {
        console.error("Camera error:", err);
        setStatus("Cannot access camera. Check permissions.");
      });
  };

  // detection loop
  useEffect(() => {
    const interval = setInterval(async () => {
      if (!videoRef.current) return;
      if (videoRef.current.readyState !== 4) return;

      try {
        const options = new faceapi.TinyFaceDetectorOptions({
          inputSize: 160,
          scoreThreshold: 0.4,
        });

        const result = await faceapi
          .detectSingleFace(videoRef.current, options)
          .withFaceExpressions();

        if (result && result.expressions) {
          const sorted = Object.entries(result.expressions).sort(
            (a, b) => b[1] - a[1]
          );
          setEmotion(sorted[0][0]);
        }
      } catch (err) {
        console.error("Detection error:", err);
      }
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const ui = emotionConfig[emotion] || emotionConfig.neutral;

  // extra suggestions per emotion (bottom section)
  const suggestionsByEmotion = {
    happy: [
      "Tackle a challenging task while energy is high.",
      "Explore advanced features or new ideas.",
      "Share your progress or notes.",
    ],
    sad: [
      "Pick one very small task and finish it.",
      "Use a timer and work for just 5 minutes.",
      "Write down how you feel in a private note.",
    ],
    angry: [
      "Take a short pause before taking actions.",
      "Focus on one issue and resolve it calmly.",
      "Avoid big decisions until you feel better.",
    ],
    surprised: [
      "Scan the main areas of the interface.",
      "Skim the help or walkthrough card.",
      "Experiment with one safe action.",
    ],
    neutral: [
      "Review your current tasks.",
      "Organize or clean up something small.",
      "Prepare a plan for the next session.",
    ],
  };

  const suggestions = suggestionsByEmotion[emotion] || suggestionsByEmotion.neutral;

  return (
    <div
      style={{
        background: ui.bg,
        minHeight: "100vh",
        width: "100vw",
        overflowX: "hidden",
        transition: "background 0.4s",
        padding: window.innerWidth < 600 ? "12px" : "24px",
        fontFamily: "system-ui, sans-serif",
        color: "#111",
        boxSizing: "border-box",
      }}
    >
      {/* HEADER */}
      <header
        style={{
          maxWidth: 1100,
          margin: "0 auto 20px",
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          gap: isMobile ? 10 : 0,
          justifyContent: "space-between",
          alignItems: isMobile ? "flex-start" : "center",
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: isMobile ? 22 : 28 }}>
            Emotion-Based UI Demo
          </h1>
          <p style={{ margin: "4px 0 0", opacity: 0.8, fontSize: 14 }}>
            The interface adapts based on your detected emotion.
          </p>
        </div>

        <div
          style={{
            padding: "8px 14px",
            borderRadius: 999,
            border: `1px solid ${ui.accent}`,
            fontSize: 13,
            
          }}
        >
          <div style={{ fontWeight: 600 }}>
            Current emotion: <span style={{ color: ui.accent }}>{emotion}</span>
          </div>
          <div style={{ fontSize: 12, opacity: 0.8 }}>{ui.moodTag}</div>
          <div style={{ fontSize: 11, opacity: 0.7, marginTop: 4 }}>
            Status: {status}
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "2fr 1.5fr",
          gap: 20,
        }}
      >
        {/* LEFT: camera + text */}
        <section
          style={{
            padding: 16,
            borderRadius: 12,
            background: "#ffffffdd",
            boxShadow: "0 4px 10px rgba(0,0,0,0.06)",
          }}
        >
          <h2 style={{ marginTop: 0, color: ui.accent }}>{ui.title}</h2>
          <p style={{ fontSize: ui.fontSize }}>
            I am using your facial expression to switch between different
            interface modes. Try smiling, frowning, or looking surprised and
            watch how the page reacts visually and behaviour-wise.
          </p>

          <video
            ref={videoRef}
            autoPlay
            muted
            style={{
              width: "100%",
              height: "auto",
              marginTop: 12,
              borderRadius: 10,
              border: "1px solid #ccc",
              objectFit: "cover",
            }}
          />

          <p style={{ marginTop: 10, fontSize: 13, opacity: 0.7 }}>
            Tip: Good lighting and facing the camera help the model detect your
            emotion more accurately.
          </p>
        </section>

        {/* RIGHT: adaptive workspace */}
        <section
          style={{
            padding: 16,
            borderRadius: 12,
            background: "#ffffffdd",
            boxShadow: "0 4px 10px rgba(0,0,0,0.06)",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <h3 style={{ marginTop: 0 }}>{ui.workspaceTitle}</h3>
          <p style={{ fontSize: 14 }}>{ui.workspaceText}</p>

          <button
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: "none",
              fontSize: 14,
              background: ui.accent,
              color: "white",
              cursor: "pointer",
              opacity: emotion === "angry" ? 0.8 : 1,
            }}
          >
            {ui.primaryActionLabel}
          </button>

          {ui.showHelp ? (
            <div
              style={{
                marginTop: 8,
                padding: 10,
                borderRadius: 8,
                border: `1px solid ${ui.accent}`,
                background: "#fefefe",
                fontSize: 14,
              }}
            >
              <strong>Support mode is enabled.</strong>
              <br />
              Because you look sad or tense, the interface offers extra
              guidance and keeps things calmer and simpler.
            </div>
          ) : (
            <div
              style={{
                marginTop: 8,
                padding: 10,
                borderRadius: 8,
                background: "#f9f9f9",
                fontSize: 14,
              }}
            >
              Advanced options are available because you appear calm or happy.
              The interface assumes you are comfortable exploring more controls.
            </div>
          )}
        </section>
      </main>

      {/* BOTTOM SUGGESTIONS */}
      <section
        style={{
          maxWidth: 1100,
          margin: "20px auto 0",
          padding: 16,
          borderRadius: 12,
          background: "#ffffffdd",
          boxShadow: "0 4px 10px rgba(0,0,0,0.03)",
        }}
      >
        <h3 style={{ marginTop: 0, color: ui.accent }}>Suggestions for now</h3>
        <p style={{ fontSize: 14, marginBottom: 8 }}>
          Based on your current emotion, here are a few things you could do:
        </p>
        <ul style={{ paddingLeft: 18, margin: 0, fontSize: 14 }}>
          {suggestions.map((item, idx) => (
            <li key={idx} style={{ marginBottom: 4 }}>
              {item}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
