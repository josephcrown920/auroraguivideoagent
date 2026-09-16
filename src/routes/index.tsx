import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import "../aurora.css";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Aurora Creative Studio — AI Images & Videos in Seconds" },
      {
        name: "description",
        content:
          "Create AI images and videos in seconds. 30+ image tools, state-of-the-art video models — turn any idea into stunning visuals, no design skills needed.",
      },
      { property: "og:title", content: "Aurora Creative Studio — AI Images & Videos" },
      {
        property: "og:description",
        content:
          "30+ image tools, state-of-the-art video models. Turn any idea into stunning visuals — no design skills needed.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Mode = "image" | "video";

interface Creation {
  id: number;
  prompt: string;
  model: string;
  kind: Mode;
  gradient: string;
}

interface ChatMsg {
  role: "u" | "a";
  text: string;
}

const GRADIENTS = [
  "linear-gradient(135deg, #2a4a6a, #1a2a3a)",
  "linear-gradient(135deg, #6a4a2a, #3a2a1a)",
  "linear-gradient(135deg, #4a2a5a, #2a1a3a)",
  "linear-gradient(135deg, #2a5a4a, #1a3a2a)",
  "linear-gradient(135deg, #5a3a3a, #3a2020)",
];

const CHAT_REPLIES = [
  "Great idea! Try adding more detail — lighting, mood, and colors help a lot. 🎨",
  "Love it. For best results, describe the scene, the style, and the camera angle.",
  "Nice prompt! Hit Generate above and I'll help you refine the result afterwards.",
  "I can help with that — want a cinematic look or something bright and playful?",
];

function ImageIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  );
}

function VideoIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M23 7l-7 5 7 5V7z" />
      <rect x="1" y="5" width="15" height="14" rx="2" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z" />
    </svg>
  );
}

function Index() {
  const [mode, setMode] = useState<Mode>("image");
  const [prompt, setPrompt] = useState("");
  const [aspect, setAspect] = useState<"16:9" | "9:16">("16:9");
  const [resolution, setResolution] = useState<"2K" | "4K">("2K");
  const [creations, setCreations] = useState<Creation[]>([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      role: "a",
      text: "Welcome to Aurora Creative Studio! Describe what you want to create and I'll bring it to life. 🎬",
    },
  ]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [sessionId, setSessionId] = useState("");
  const chatBodyRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(1);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("aurora_settings");
      if (saved) {
        const s = JSON.parse(saved) as { apiKey?: string; sessionId?: string };
        setApiKey(s.apiKey ?? "");
        setSessionId(s.sessionId ?? "");
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    chatBodyRef.current?.scrollTo({ top: chatBodyRef.current.scrollHeight });
  }, [messages, chatOpen]);

  const handleGenerate = () => {
    const text = prompt.trim();
    if (!text) return;
    const hash = Array.from(text).reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 7);
    const gradient = GRADIENTS[Math.abs(hash) % GRADIENTS.length];
    setCreations((prev) => [
      {
        id: nextId.current++,
        prompt: text,
        model: mode === "image" ? "Seedream 4.0" : "Seedance 2.5",
        kind: mode,
        gradient,
      },
      ...prev,
    ]);
    setPrompt("");
  };

  const handleSendChat = () => {
    const text = chatInput.trim();
    if (!text) return;
    setMessages((prev) => [...prev, { role: "u", text }]);
    setChatInput("");
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { role: "a", text: CHAT_REPLIES[prev.filter((m) => m.role === "u").length % CHAT_REPLIES.length] },
      ]);
    }, 600);
  };

  const saveSettings = () => {
    localStorage.setItem("aurora_settings", JSON.stringify({ apiKey, sessionId }));
    setSettingsOpen(false);
  };

  return (
    <div className="aurora-body">
      <div className="aurora-bg-layer">
        <div className="aurora-bg-cards">
          {[1, 2, 3, 4, 5].map((n) => (
            <div className="aurora-bg-card" key={n}>
              <div className="aurora-bg-card-inner" />
            </div>
          ))}
        </div>
      </div>

      <div className="aurora-logo-top">
        <div className="aurora-logo-mark">A</div>
        Aurora
      </div>

      <button
        className="aurora-settings-fab"
        aria-label="Settings"
        onClick={() => setSettingsOpen(true)}
      >
        ⚙️
      </button>

      <div className="aurora-wrap">
        <section className="aurora-hero">
          <div className="aurora-top-badge">
            <span className="new-pill">New</span>
            Seedance 2.5 is coming soon
          </div>

          <h1 className="aurora-h1">
            Create AI Images &amp; Videos
            <br />
            in Seconds
          </h1>

          <p className="aurora-subhead">
            30+ image tools, state-of-the-art video models, and growing. Turn any idea into
            stunning visuals — no design skills needed.
          </p>

          <div className="aurora-mode-switch">
            <button
              className={`aurora-mode-btn ${mode === "image" ? "active" : ""}`}
              onClick={() => setMode("image")}
            >
              <ImageIcon />
              Image
            </button>
            <button
              className={`aurora-mode-btn ${mode === "video" ? "active" : ""}`}
              onClick={() => setMode("video")}
            >
              <VideoIcon />
              Video
            </button>
          </div>

          <div className="aurora-prompt-card">
            <div className="aurora-prompt-top">
              <button className="aurora-add-btn" aria-label="Add reference">+</button>
              <textarea
                className="aurora-prompt-input"
                placeholder={
                  mode === "image"
                    ? "Describe the image you want to create…"
                    : "Describe the video you want to create…"
                }
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleGenerate();
                  }
                }}
              />
            </div>
            <div className="aurora-controls">
              <button className="aurora-model-pill">
                <span className="aurora-model-logo">S</span>
                <span className="name">
                  {mode === "image" ? "Seedream 4.0" : "Seedance 2.5"}
                </span>
                <span className="chev">▼</span>
              </button>

              <div className="aurora-seg-control">
                <button
                  className={`aurora-seg-btn ${aspect === "16:9" ? "active" : ""}`}
                  onClick={() => setAspect("16:9")}
                >
                  16:9
                </button>
                <button
                  className={`aurora-seg-btn ${aspect === "9:16" ? "active" : ""}`}
                  onClick={() => setAspect("9:16")}
                >
                  9:16
                </button>
              </div>

              <div className="aurora-seg-control">
                <button
                  className={`aurora-seg-btn ${resolution === "2K" ? "active" : ""}`}
                  onClick={() => setResolution("2K")}
                >
                  2K
                </button>
                <button
                  className={`aurora-seg-btn ${resolution === "4K" ? "active" : ""}`}
                  onClick={() => setResolution("4K")}
                >
                  4K
                </button>
              </div>

              <button
                className="aurora-gen-btn"
                onClick={handleGenerate}
                disabled={!prompt.trim()}
              >
                <SparkleIcon />
                Generate
              </button>
            </div>
          </div>

          <div className="aurora-stats-row">
            <div className="aurora-stat-item">
              <div className="aurora-stat-num">2025</div>
              <div className="aurora-stat-label">EDITOR'S PICK</div>
            </div>
            <div className="aurora-stat-item">
              <div className="aurora-stat-num">10M+</div>
              <div className="aurora-stat-label">ACTIVE USERS</div>
            </div>
            <div className="aurora-stat-item">
              <div className="aurora-stat-num">TOP 30</div>
              <div className="aurora-stat-label">AI PLATFORM</div>
            </div>
          </div>
        </section>

        <section className="aurora-gallery">
          <h2>Your Creations</h2>
          {creations.length === 0 ? (
            <div className="aurora-empty">
              <div className="spark">✨</div>
              <h3>✨ Your first creation</h3>
              <p>Generate something amazing to see it here</p>
            </div>
          ) : (
            <div className="aurora-gallery-grid">
              {creations.map((c) => (
                <div className="aurora-g-card" key={c.id}>
                  <div className="aurora-g-thumb" style={{ background: c.gradient }}>
                    {c.kind === "video" && (
                      <span style={{ fontSize: 32, color: "rgba(255,255,255,0.7)" }}>▶</span>
                    )}
                  </div>
                  <div className="aurora-g-info">
                    <div className="aurora-g-model">
                      {c.kind === "video" ? "🎬" : "🖼"} {c.model} · {aspect}
                    </div>
                    <div className="aurora-g-prompt">{c.prompt}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {!chatOpen && (
        <button className="aurora-chat-fab" aria-label="Open chat" onClick={() => setChatOpen(true)}>
          💬
        </button>
      )}

      {chatOpen && (
        <div className="aurora-chat-panel">
          <div className="aurora-chat-hd">
            <h3>🎬 Aurora Creative Director</h3>
            <button className="aurora-chat-close" aria-label="Close chat" onClick={() => setChatOpen(false)}>
              ×
            </button>
          </div>
          <div className="aurora-chat-body" ref={chatBodyRef}>
            {messages.map((m, i) => (
              <div className={`aurora-cm ${m.role}`} key={i}>
                {m.text}
              </div>
            ))}
          </div>
          <div className="aurora-chat-input-row">
            <input
              placeholder="Ask anything…"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
            />
            <button onClick={handleSendChat}>Send</button>
          </div>
        </div>
      )}

      {settingsOpen && (
        <div className="aurora-modal" onClick={() => setSettingsOpen(false)}>
          <div className="aurora-modal-box" onClick={(e) => e.stopPropagation()}>
            <h2>Settings</h2>
            <div className="aurora-fld">
              <label htmlFor="aurora-api-key">ARK API Key</label>
              <input
                id="aurora-api-key"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your ARK API key"
              />
            </div>
            <div className="aurora-fld">
              <label htmlFor="aurora-session-id">Session ID</label>
              <input
                id="aurora-session-id"
                type="text"
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
                placeholder="Enter your session ID"
              />
            </div>
            <div className="aurora-m-actions">
              <button className="aurora-btn-s" onClick={() => setSettingsOpen(false)}>
                Cancel
              </button>
              <button className="aurora-btn-p" onClick={saveSettings}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
