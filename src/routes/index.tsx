import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import "../aurora.css";
import bg1 from "../assets/aurora-bg-1.jpg";
import bg2 from "../assets/aurora-bg-2.jpg";
import bg3 from "../assets/aurora-bg-3.jpg";
import bg4 from "../assets/aurora-bg-4.jpg";
import bg5 from "../assets/aurora-bg-5.jpg";

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
type Aspect = "1:1" | "16:9" | "9:16";

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
  "Nice prompt! Hit the send button above and I'll help you refine the result afterwards.",
  "I can help with that — want a cinematic look or something bright and playful?",
];

function ImageIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="9" cy="9" r="1.6" />
      <path d="M21 15.5l-4.5-4.5L6 21.5" />
    </svg>
  );
}

function VideoIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="2" y="5" width="14" height="14" rx="5" />
      <path d="M23 8l-6 4 6 4V8z" />
    </svg>
  );
}


function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M3.4 20.4l17.8-7.6c.8-.4.8-1.5 0-1.9L3.4 3.6c-.7-.3-1.4.2-1.4.9v4.4c0 .5.4.9.9 1l11.3 2.1-11.3 2.1c-.5.1-.9.5-.9 1v4.4c0 .7.7 1.2 1.4.9z" />
    </svg>
  );
}

function OpenAiMark() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.28 9.82a5.98 5.98 0 0 0-.52-4.91 6.05 6.05 0 0 0-6.51-2.9A6.07 6.07 0 0 0 4.98 4.18a5.98 5.98 0 0 0-4 2.9 6.05 6.05 0 0 0 .75 7.1 5.98 5.98 0 0 0 .51 4.91 6.05 6.05 0 0 0 6.52 2.9A5.98 5.98 0 0 0 13.26 24a6.06 6.06 0 0 0 5.77-4.21 5.99 5.99 0 0 0 4-2.9 6.06 6.06 0 0 0-.75-7.07zm-9.02 12.61a4.48 4.48 0 0 1-2.88-1.04l.14-.08 4.78-2.76a.78.78 0 0 0 .39-.68v-6.74l2.02 1.17a.07.07 0 0 1 .04.05v5.58a4.5 4.5 0 0 1-4.49 4.5zm-9.66-4.13a4.47 4.47 0 0 1-.54-3.01l.14.09 4.78 2.76a.77.77 0 0 0 .78 0l5.84-3.37v2.33a.08.08 0 0 1-.03.06L8.32 19.4a4.5 4.5 0 0 1-4.72-1.1zM2.34 7.9a4.49 4.49 0 0 1 2.37-1.97v5.68a.77.77 0 0 0 .39.68l5.83 3.37-2.02 1.16a.08.08 0 0 1-.07 0L3.6 14.57A4.5 4.5 0 0 1 2.34 7.9zm16.6 3.86l-5.83-3.37 2.02-1.16a.08.08 0 0 1 .07 0l5.24 3.24a4.49 4.49 0 0 1-.69 8.1v-5.68a.78.78 0 0 0-.39-.68h-.42zm2.18-3.29l-.14-.09-4.78-2.76a.77.77 0 0 0-.78 0L9.58 9v-2.3a.07.07 0 0 1 .03-.06l5.24-3.23a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.13L6.46 11.4a.08.08 0 0 1-.04-.06V5.76a4.5 4.5 0 0 1 7.38-3.45l-.14.08L8.88 5.15a.78.78 0 0 0-.39.68zm1.1-2.37l2.6-1.5 2.6 1.5v3l-2.6 1.5-2.6-1.5z" />
    </svg>
  );
}

function Index() {
  const [mode, setMode] = useState<Mode>("image");
  const [prompt, setPrompt] = useState("");
  const [aspect, setAspect] = useState<Aspect>("1:1");
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

  const model = mode === "image" ? "GPT Image 2 Low" : "GPT Video 1";

  const handleGenerate = () => {
    const text = prompt.trim();
    if (!text) return;
    const hash = Array.from(text).reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 7);
    const gradient = GRADIENTS[Math.abs(hash) % GRADIENTS.length] ?? GRADIENTS[0]!;
    setCreations((prev) => [
      {
        id: nextId.current++,
        prompt: text,
        model,
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
        {
          role: "a",
          text:
            CHAT_REPLIES[prev.filter((m) => m.role === "u").length % CHAT_REPLIES.length] ??
            CHAT_REPLIES[0]!,
        },
      ]);
    }, 600);
  };

  const saveSettings = () => {
    localStorage.setItem("aurora_settings", JSON.stringify({ apiKey, sessionId }));
    setSettingsOpen(false);
  };

  const collageCols: string[][] = [
    [bg1, bg4],
    [bg2, bg5],
    [bg3, bg1],
  ];

  return (
    <div className="aurora-body">
      <div className="aurora-bg-layer">
        <div className="aurora-collage">
          {collageCols.map((col, i) => (
            <div className={`aurora-collage-col c${i + 1}`} key={i}>
              {col.map((src, j) => (
                <img
                  key={j}
                  src={src}
                  alt=""
                  width={768}
                  height={1024}
                  loading={i === 1 && j === 0 ? "eager" : "lazy"}
                />
              ))}
            </div>
          ))}
        </div>
        <div className="aurora-bg-overlay" />
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
            Create AI Images &amp; Videos in Seconds
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
                    ? "Try describing the image you want to create"
                    : "Try describing the video you want to create"
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
                <span className="aurora-model-logo">
                  <OpenAiMark />
                </span>
                <span className="name">{model}</span>
                <span className="chev">▼</span>
              </button>

              <div className="aurora-seg-control">
                {(["1:1", "16:9", "9:16"] as Aspect[]).map((a) => (
                  <button
                    key={a}
                    className={`aurora-seg-btn ${aspect === a ? "active" : ""}`}
                    onClick={() => setAspect(a)}
                  >
                    {a === "1:1" && <span className="aurora-square-icon" />}
                    {a}
                  </button>
                ))}
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
                className="aurora-send-btn"
                onClick={handleGenerate}
                disabled={!prompt.trim()}
                aria-label="Generate"
              >
                <SendIcon />
              </button>
            </div>
          </div>

          <div className="aurora-stats-row">
            <div className="aurora-stat-item">
              <div className="aurora-stat-num">2025</div>
              <div className="aurora-stat-label">Editor's pick</div>
            </div>
            <div className="aurora-stat-item">
              <div className="aurora-stat-num">10M+</div>
              <div className="aurora-stat-label">Active users</div>
            </div>
            <div className="aurora-stat-item">
              <div className="aurora-stat-num">TOP 30</div>
              <div className="aurora-stat-label">OpenAI Partner</div>
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
