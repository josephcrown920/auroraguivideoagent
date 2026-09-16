import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import "../aurora.css";
import bg1 from "../assets/aurora-bg-1.jpg";
import bg2 from "../assets/aurora-bg-2.jpg";
import bg3 from "../assets/aurora-bg-3.jpg";
import bg4 from "../assets/aurora-bg-4.jpg";
import bg5 from "../assets/aurora-bg-5.jpg";
import moonAsset from "../assets/aurora-moon.jpg.asset.json";
import chromeAsset from "../assets/aurora-chrome.jpg.asset.json";

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
type BgTheme = "moon" | "chrome" | "collage";

interface Creation {
  id: number;
  prompt: string;
  model: string;
  kind: Mode;
  aspect: Aspect;
  status: "pending" | "done" | "error";
  url?: string;
  error?: string;
}

interface ChatMsg {
  role: "u" | "a";
  text: string;
}

const IMAGE_MODEL = "Seedream 4.0";
const VIDEO_MODEL = "Seedance 1.0 Lite";

const IMAGE_SIZES: Record<Aspect, Record<"2K" | "4K", string>> = {
  "1:1": { "2K": "2048x2048", "4K": "4096x4096" },
  "16:9": { "2K": "2560x1440", "4K": "3840x2160" },
  "9:16": { "2K": "1440x2560", "4K": "2160x3840" },
};

const CHAT_SYSTEM =
  "You are Aurora's Creative Director. Help the user shape vivid image and video prompts: suggest concrete creative directions, lighting, mood, composition, camera and style. Be warm and concise, and offer ready-to-paste prompts.";

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
      <path d="M12 2l2.4 6.2L21 10l-5.2 3.4L17 21l-5-3.4L7 21l1.2-7.6L3 10l6.6-1.8z" />
    </svg>
  );
}

async function callArk<T>(key: string, body: unknown): Promise<T> {
  const res = await fetch("/api/ark", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-ark-key": key },
    body: JSON.stringify(body),
  });
  const json = (await res.json().catch(() => ({}))) as {
    error?: { message?: string };
    message?: string;
  };
  if (!res.ok) {
    throw new Error(json.error?.message || json.message || `Request failed (${res.status})`);
  }
  return json as T;
}

function Index() {
  const [mode, setMode] = useState<Mode>("image");
  const [prompt, setPrompt] = useState("");
  const [aspect, setAspect] = useState<Aspect>("1:1");
  const [resolution, setResolution] = useState<"2K" | "4K">("2K");
  const [creations, setCreations] = useState<Creation[]>([]);
  const [busy, setBusy] = useState(false);
  const [bg, setBg] = useState<BgTheme>("moon");
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatBusy, setChatBusy] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      role: "a",
      text: "Welcome to Aurora Creative Studio! Tell me what you're imagining and I'll turn it into a shootable prompt. 🎬",
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
      const savedBg = localStorage.getItem("aurora_bg");
      if (savedBg === "moon" || savedBg === "chrome" || savedBg === "collage") {
        setBg(savedBg);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    chatBodyRef.current?.scrollTo({ top: chatBodyRef.current.scrollHeight });
  }, [messages, chatOpen, chatBusy]);

  const model = mode === "image" ? IMAGE_MODEL : VIDEO_MODEL;

  const chooseBg = (theme: BgTheme) => {
    setBg(theme);
    try {
      localStorage.setItem("aurora_bg", theme);
    } catch {
      // ignore
    }
  };

  const updateCreation = (id: number, patch: Partial<Creation>) => {
    setCreations((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  };

  const handleGenerate = async () => {
    const text = prompt.trim();
    if (!text || busy) return;
    const id = nextId.current++;
    const currentMode = mode;
    const currentAspect = aspect;
    setCreations((prev) => [
      { id, prompt: text, model, kind: currentMode, aspect: currentAspect, status: "pending" },
      ...prev,
    ]);
    setPrompt("");
    setBusy(true);

    try {
      if (!apiKey.trim()) {
        throw new Error("Add your ARK API key in Settings to start generating.");
      }
      if (currentMode === "image") {
        const data = await callArk<{ data?: { url?: string; b64_json?: string }[] }>(apiKey, {
          kind: "image",
          prompt: text,
          size: IMAGE_SIZES[currentAspect][resolution],
        });
        const first = data.data?.[0];
        const url = first?.url ?? (first?.b64_json ? `data:image/png;base64,${first.b64_json}` : undefined);
        if (!url) throw new Error("No image was returned.");
        updateCreation(id, { status: "done", url });
      } else {
        const task = await callArk<{ id?: string }>(apiKey, {
          kind: "video",
          prompt: text,
          ratio: currentAspect,
        });
        if (!task.id) throw new Error("No video task was created.");
        let url: string | undefined;
        for (let i = 0; i < 120; i++) {
          await new Promise((r) => setTimeout(r, 5000));
          const status = await callArk<{
            status?: string;
            content?: { video_url?: string };
            error?: { message?: string };
          }>(apiKey, { kind: "videoStatus", taskId: task.id });
          if (status.status === "succeeded") {
            url = status.content?.video_url;
            break;
          }
          if (status.status === "failed" || status.status === "cancelled") {
            throw new Error(status.error?.message || "Video generation failed.");
          }
        }
        if (!url) throw new Error("Video is taking too long — try again.");
        updateCreation(id, { status: "done", url });
      }
    } catch (err) {
      updateCreation(id, {
        status: "error",
        error: err instanceof Error ? err.message : "Something went wrong.",
      });
    } finally {
      setBusy(false);
    }
  };

  const handleSendChat = async () => {
    const text = chatInput.trim();
    if (!text || chatBusy) return;
    setMessages((prev) => [...prev, { role: "u", text }]);
    setChatInput("");
    setChatBusy(true);
    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, sessionId: sessionId.trim() || undefined }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        reply?: string;
        error?: { message?: string };
      };
      if (!res.ok) throw new Error(data.error?.message || `Request failed (${res.status})`);
      const reply = data.reply?.trim();
      setMessages((prev) => [...prev, { role: "a", text: reply || "I didn't catch that — try again?" }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "a", text: err instanceof Error ? err.message : "Something went wrong." },
      ]);
    } finally {
      setChatBusy(false);
    }
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

  const singleBg = bg === "moon" ? moonAsset.url : chromeAsset.url;

  return (
    <div className="aurora-body">
      <div className="aurora-bg-layer">
        {bg === "collage" ? (
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
        ) : (
          <div className="aurora-bg-single">
            <img src={singleBg} alt="" />
          </div>
        )}
        <div className="aurora-bg-overlay" />
      </div>

      <div className="aurora-logo-top">
        <div className="aurora-logo-mark">A</div>
        Aurora
        <div className="aurora-bg-switch" role="group" aria-label="Background">
          {(["moon", "chrome", "collage"] as BgTheme[]).map((t) => (
            <button
              key={t}
              className={`aurora-bg-btn ${bg === t ? "active" : ""}`}
              onClick={() => chooseBg(t)}
              aria-pressed={bg === t}
            >
              {t === "moon" ? "Moon" : t === "chrome" ? "Chrome" : "Collage"}
            </button>
          ))}
        </div>
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

          <h1 className="aurora-h1">Create AI Images &amp; Videos in Seconds</h1>

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
              <button className="aurora-add-btn" aria-label="Add reference">
                +
              </button>
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
                    void handleGenerate();
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
                onClick={() => void handleGenerate()}
                disabled={!prompt.trim() || busy}
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
              <div className="aurora-stat-label">AI Platform</div>
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
                  <div className="aurora-g-thumb">
                    {c.status === "pending" && <span className="aurora-spinner" />}
                    {c.status === "error" && <span className="aurora-g-error">{c.error}</span>}
                    {c.status === "done" && c.url && c.kind === "image" && (
                      <img src={c.url} alt={c.prompt} loading="lazy" />
                    )}
                    {c.status === "done" && c.url && c.kind === "video" && (
                      <video src={c.url} controls playsInline preload="metadata" />
                    )}
                  </div>
                  <div className="aurora-g-info">
                    <div className="aurora-g-model">
                      {c.kind === "video" ? "🎬" : "🖼"} {c.model} · {c.aspect}
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
            <button
              className="aurora-chat-close"
              aria-label="Close chat"
              onClick={() => setChatOpen(false)}
            >
              ×
            </button>
          </div>
          <div className="aurora-chat-body" ref={chatBodyRef}>
            {messages.map((m, i) => (
              <div className={`aurora-cm ${m.role}`} key={i}>
                {m.text}
              </div>
            ))}
            {chatBusy && <div className="aurora-cm a aurora-typing">Thinking…</div>}
          </div>
          <div className="aurora-chat-input-row">
            <input
              placeholder="Ask for a creative direction…"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void handleSendChat();
              }}
            />
            <button onClick={() => void handleSendChat()} disabled={chatBusy}>
              Send
            </button>
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
