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
import {
  CHAT_MODELS,
  IMAGE_MODELS,
  VIDEO_MODELS,
  modelLabel,
  type ModelOption,
} from "../lib/aurora-models";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Aurora Creative Studio — AI Images & Videos in Seconds" },
      {
        name: "description",
        content:
          "Create AI images and videos in seconds. Seedream, Seedance and Seed models — turn any idea into stunning visuals, no design skills needed.",
      },
      { property: "og:title", content: "Aurora Creative Studio — AI Images & Videos" },
      {
        property: "og:description",
        content:
          "Seedream 5.0 images, Seedance 2.5 video and a creative director in chat. Turn any idea into stunning visuals.",
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

const IMAGE_SIZES: Record<Aspect, Record<"2K" | "4K", string>> = {
  "1:1": { "2K": "2048x2048", "4K": "4096x4096" },
  "16:9": { "2K": "2560x1440", "4K": "3840x2160" },
  "9:16": { "2K": "1440x2560", "4K": "2160x3840" },
};

const WELCOME: ChatMsg = {
  role: "a",
  text: "Welcome to Aurora Creative Studio! Tell me what you're imagining and I'll turn it into a shootable prompt. 🎬",
};

const STORE_KEY = "aurora_state_v2";

interface StoredState {
  mode?: Mode;
  aspect?: Aspect;
  resolution?: "2K" | "4K";
  duration?: number;
  imageModel?: string;
  videoModel?: string;
  chatModel?: string;
  bg?: BgTheme;
  creations?: Creation[];
  messages?: ChatMsg[];
}

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

function SparkMark() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l2.4 6.2L21 10l-5.2 3.4L17 21l-5-3.4L7 21l1.2-7.6L3 10l6.6-1.8z" />
    </svg>
  );
}

async function callArk<T>(body: unknown, key?: string): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (key?.trim()) headers["x-ark-key"] = key.trim();
  const res = await fetch("/api/ark", { method: "POST", headers, body: JSON.stringify(body) });
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
  const [hydrated, setHydrated] = useState(false);
  const [mode, setMode] = useState<Mode>("image");
  const [prompt, setPrompt] = useState("");
  const [aspect, setAspect] = useState<Aspect>("1:1");
  const [resolution, setResolution] = useState<"2K" | "4K">("2K");
  const [duration, setDuration] = useState(5);
  const [imageModel, setImageModel] = useState(IMAGE_MODELS[0]!.id);
  const [videoModel, setVideoModel] = useState(VIDEO_MODELS[0]!.id);
  const [chatModel, setChatModel] = useState(CHAT_MODELS[0]!.id);
  const [modelMenuOpen, setModelMenuOpen] = useState(false);
  const [chatMenuOpen, setChatMenuOpen] = useState(false);
  const [refUrl, setRefUrl] = useState("");
  const [refOpen, setRefOpen] = useState(false);
  const [creations, setCreations] = useState<Creation[]>([]);
  const [busy, setBusy] = useState(false);
  const [bg, setBg] = useState<BgTheme>("moon");
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatBusy, setChatBusy] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([WELCOME]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [sessionId, setSessionId] = useState("");
  const chatBodyRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const nextId = useRef(1);

  const handleRefFile = async (file?: File) => {
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      window.alert("That image is larger than 8 MB — please pick a smaller one.");
      return;
    }
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("Could not read that file."));
      reader.readAsDataURL(file);
    });
    setRefUrl(dataUrl);
  };

  // ---- persistent memory ----
  useEffect(() => {
    try {
      const saved = localStorage.getItem("aurora_settings");
      if (saved) {
        const s = JSON.parse(saved) as { apiKey?: string; sessionId?: string };
        setApiKey(s.apiKey ?? "");
        setSessionId(s.sessionId ?? "");
      }
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        const s = JSON.parse(raw) as StoredState;
        if (s.mode) setMode(s.mode);
        if (s.aspect) setAspect(s.aspect);
        if (s.resolution) setResolution(s.resolution);
        if (s.duration) setDuration(s.duration);
        if (s.imageModel) setImageModel(s.imageModel);
        if (s.videoModel) setVideoModel(s.videoModel);
        if (s.chatModel) setChatModel(s.chatModel);
        if (s.bg) setBg(s.bg);
        if (s.messages?.length) setMessages(s.messages);
        if (s.creations?.length) {
          const restored = s.creations.map((c) =>
            c.status === "pending"
              ? { ...c, status: "error" as const, error: "Interrupted — generate again." }
              : c,
          );
          setCreations(restored);
          nextId.current = Math.max(...restored.map((c) => c.id)) + 1;
        }
      } else {
        const legacyBg = localStorage.getItem("aurora_bg");
        if (legacyBg === "moon" || legacyBg === "chrome" || legacyBg === "collage") setBg(legacyBg);
      }
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      const state: StoredState = {
        mode,
        aspect,
        resolution,
        duration,
        imageModel,
        videoModel,
        chatModel,
        bg,
        creations: creations.slice(0, 40),
        messages: messages.slice(-60),
      };
      localStorage.setItem(STORE_KEY, JSON.stringify(state));
    } catch {
      // ignore (quota)
    }
  }, [
    hydrated,
    mode,
    aspect,
    resolution,
    duration,
    imageModel,
    videoModel,
    chatModel,
    bg,
    creations,
    messages,
  ]);

  useEffect(() => {
    chatBodyRef.current?.scrollTo({ top: chatBodyRef.current.scrollHeight });
  }, [messages, chatOpen, chatBusy]);

  useEffect(() => {
    if (!modelMenuOpen && !chatMenuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest(".aurora-model-wrap")) {
        setModelMenuOpen(false);
        setChatMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [modelMenuOpen, chatMenuOpen]);

  const modelList: ModelOption[] = mode === "image" ? IMAGE_MODELS : VIDEO_MODELS;
  const activeModel = mode === "image" ? imageModel : videoModel;

  const updateCreation = (id: number, patch: Partial<Creation>) => {
    setCreations((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  };

  const pickModel = (id: string) => {
    if (mode === "image") setImageModel(id);
    else setVideoModel(id);
    setModelMenuOpen(false);
  };

  const handleGenerate = async () => {
    const text = prompt.trim();
    if (!text || busy) return;
    const id = nextId.current++;
    const currentMode = mode;
    const currentAspect = aspect;
    const currentModel = activeModel;
    const reference = refUrl.trim() || undefined;
    setCreations((prev) => [
      {
        id,
        prompt: text,
        model: modelLabel(currentModel, modelList),
        kind: currentMode,
        aspect: currentAspect,
        status: "pending",
      },
      ...prev,
    ]);
    setPrompt("");
    setBusy(true);

    try {
      if (currentMode === "image") {
        const data = await callArk<{ data?: { url?: string; b64_json?: string }[] }>(
          {
            kind: "image",
            model: currentModel,
            prompt: text,
            size: IMAGE_SIZES[currentAspect][resolution],
            imageUrl: reference,
          },
          apiKey,
        );
        const first = data.data?.[0];
        const url =
          first?.url ?? (first?.b64_json ? `data:image/png;base64,${first.b64_json}` : undefined);
        if (!url) throw new Error("No image was returned.");
        updateCreation(id, { status: "done", url });
      } else {
        const task = await callArk<{ id?: string }>(
          {
            kind: "video",
            model: currentModel,
            prompt: text,
            ratio: currentAspect,
            duration,
            imageUrl: reference,
          },
          apiKey,
        );
        if (!task.id) throw new Error("No video task was created.");
        let url: string | undefined;
        for (let i = 0; i < 120; i++) {
          await new Promise((r) => setTimeout(r, 5000));
          const status = await callArk<{
            status?: string;
            content?: { video_url?: string };
            error?: { message?: string };
          }>({ kind: "videoStatus", taskId: task.id }, apiKey);
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
    const history = [...messages, { role: "u" as const, text }];
    setMessages(history);
    setChatInput("");
    setChatBusy(true);
    try {
      let reply: string | undefined;
      if (chatModel === "agent") {
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
        reply = data.reply;
      } else {
        const data = await callArk<{ choices?: { message?: { content?: string } }[] }>(
          {
            kind: "chat",
            model: chatModel,
            messages: [
              {
                role: "system",
                content:
                  "You are Aurora Creative Director, helping musicians and creators craft cinematic image and video prompts. Be concise and vivid.",
              },
              ...history.slice(-20).map((m) => ({
                role: m.role === "u" ? "user" : "assistant",
                content: m.text,
              })),
            ],
          },
          apiKey,
        );
        reply = data.choices?.[0]?.message?.content;
      }
      setMessages((prev) => [
        ...prev,
        { role: "a", text: reply?.trim() || "I didn't catch that — try again?" },
      ]);
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
    try {
      localStorage.setItem("aurora_settings", JSON.stringify({ apiKey, sessionId }));
    } catch {
      // ignore
    }
    setSettingsOpen(false);
  };

  const clearHistory = () => {
    setCreations([]);
    setMessages([WELCOME]);
    try {
      localStorage.removeItem(STORE_KEY);
    } catch {
      // ignore
    }
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
              onClick={() => setBg(t)}
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
            Seedance 2.5 &amp; Seedream 5.0 are live
          </div>

          <h1 className="aurora-h1">Create AI Images &amp; Videos in Seconds</h1>

          <p className="aurora-subhead">
            Seedream and Seedance models, plus a creative director in chat. Turn any idea into
            stunning visuals — no design skills needed.
          </p>

          <div className="aurora-mode-switch">
            <button
              className={`aurora-mode-btn ${mode === "image" ? "active" : ""}`}
              onClick={() => {
                setMode("image");
                setModelMenuOpen(false);
              }}
            >
              <ImageIcon />
              Image
            </button>
            <button
              className={`aurora-mode-btn ${mode === "video" ? "active" : ""}`}
              onClick={() => {
                setMode("video");
                setModelMenuOpen(false);
              }}
            >
              <VideoIcon />
              Video
            </button>
          </div>

          <div className="aurora-prompt-card">
            <div className="aurora-prompt-top">
              <button
                className={`aurora-add-btn ${refUrl.trim() ? "has-ref" : ""}`}
                aria-label="Add reference image"
                aria-expanded={refOpen}
                onClick={() => setRefOpen((v) => !v)}
              >
                {refUrl.trim() ? <img src={refUrl} alt="Reference" /> : "+"}
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

            {refOpen && (
              <div className="aurora-ref-row">
                {refUrl.trim() && <img className="aurora-ref-thumb" src={refUrl} alt="Reference" />}
                <input
                  type="text"
                  value={refUrl.startsWith("data:") ? "" : refUrl}
                  onChange={(e) => setRefUrl(e.target.value)}
                  placeholder={
                    refUrl.startsWith("data:")
                      ? "Uploaded image in use as style reference"
                      : "Paste a reference image URL, or upload one"
                  }
                  aria-label="Reference image URL"
                />
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => void handleRefFile(e.target.files?.[0])}
                />
                <button className="aurora-ref-upload" onClick={() => fileRef.current?.click()}>
                  Upload image
                </button>
                {refUrl.trim() && (
                  <button className="aurora-ref-clear" onClick={() => setRefUrl("")}>
                    Clear
                  </button>
                )}
              </div>
            )}

            <div className="aurora-controls">
              <div className="aurora-model-wrap">
                <button
                  className="aurora-model-pill"
                  onClick={() => setModelMenuOpen((v) => !v)}
                  aria-expanded={modelMenuOpen}
                >
                  <span className="aurora-model-logo">
                    <SparkMark />
                  </span>
                  <span className="name">{modelLabel(activeModel, modelList)}</span>
                  <span className="chev">▼</span>
                </button>
                {modelMenuOpen && (
                  <div className="aurora-menu" role="listbox">
                    {modelList.map((m) => (
                      <button
                        key={m.id}
                        className={`aurora-menu-item ${m.id === activeModel ? "active" : ""}`}
                        onClick={() => pickModel(m.id)}
                        role="option"
                        aria-selected={m.id === activeModel}
                      >
                        <span>{m.label}</span>
                        <small>{m.note ?? m.vendor}</small>
                      </button>
                    ))}
                  </div>
                )}
              </div>

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

              {mode === "image" ? (
                <div className="aurora-seg-control">
                  {(["2K", "4K"] as const).map((r) => (
                    <button
                      key={r}
                      className={`aurora-seg-btn ${resolution === r ? "active" : ""}`}
                      onClick={() => setResolution(r)}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="aurora-seg-control">
                  {[5, 10].map((d) => (
                    <button
                      key={d}
                      className={`aurora-seg-btn ${duration === d ? "active" : ""}`}
                      onClick={() => setDuration(d)}
                    >
                      {d}s
                    </button>
                  ))}
                </div>
              )}

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
              <div className="aurora-stat-num">{IMAGE_MODELS.length}</div>
              <div className="aurora-stat-label">Image models</div>
            </div>
            <div className="aurora-stat-item">
              <div className="aurora-stat-num">{VIDEO_MODELS.length}</div>
              <div className="aurora-stat-label">Video models</div>
            </div>
            <div className="aurora-stat-item">
              <div className="aurora-stat-num">{CHAT_MODELS.length - 1}</div>
              <div className="aurora-stat-label">Chat models</div>
            </div>
          </div>
        </section>

        <section className="aurora-gallery">
          <div className="aurora-gallery-hd">
            <h2>Your Creations</h2>
            {creations.length > 0 && (
              <button className="aurora-btn-s" onClick={clearHistory}>
                Clear history
              </button>
            )}
          </div>
          {creations.length === 0 ? (
            <div className="aurora-empty">
              <div className="spark">✨</div>
              <h3>✨ Your first creation</h3>
              <p>Generate something amazing to see it here — it stays saved on this device</p>
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
            <div className="aurora-model-wrap">
              <button
                className="aurora-chat-model"
                onClick={() => setChatMenuOpen((v) => !v)}
                aria-expanded={chatMenuOpen}
              >
                🎬 {modelLabel(chatModel, CHAT_MODELS)} <span className="chev">▼</span>
              </button>
              {chatMenuOpen && (
                <div className="aurora-menu up" role="listbox">
                  {CHAT_MODELS.map((m) => (
                    <button
                      key={m.id}
                      className={`aurora-menu-item ${m.id === chatModel ? "active" : ""}`}
                      onClick={() => {
                        setChatModel(m.id);
                        setChatMenuOpen(false);
                      }}
                      role="option"
                      aria-selected={m.id === chatModel}
                    >
                      <span>{m.label}</span>
                      <small>{m.note ?? m.vendor}</small>
                    </button>
                  ))}
                </div>
              )}
            </div>
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
            <button onClick={() => void handleSendChat()} disabled={chatBusy || !chatInput.trim()}>
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
              <label htmlFor="aurora-api-key">ARK API Key (optional)</label>
              <input
                id="aurora-api-key"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Leave empty to use the built-in key"
              />
            </div>
            <div className="aurora-fld">
              <label htmlFor="aurora-session-id">Session ID</label>
              <input
                id="aurora-session-id"
                type="text"
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
                placeholder="Optional — override the creative director session"
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
