import { useMemo, useState } from "react";

import { WORKSPACES, defaultWorkspace, type WorkspaceId } from "../lib/studio-workspaces";
import { MODEL_REGISTRY, getModelsByCategory } from "../lib/studio-model-registry";

export default function NexusDolaStudioScaffold() {
  const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceId>(defaultWorkspace);
  const [selectedModelId, setSelectedModelId] = useState<string>("dola-seed-2.1-turbo");

  const models = useMemo(() => getModelsByCategory("assistant"), []);
  const activeModel = useMemo(
    () => MODEL_REGISTRY.find((model) => model.id === selectedModelId) ?? MODEL_REGISTRY[0],
    [selectedModelId],
  );

  return (
    <div style={{
      minHeight: "100vh",
      display: "grid",
      gridTemplateColumns: "260px minmax(0, 1fr)",
      background: "#05070d",
      color: "#edf2ff",
      fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
    }}>
      <aside style={{
        background: "rgba(15,19,30,0.94)",
        borderRight: "1px solid rgba(255,255,255,0.08)",
        padding: "22px 14px",
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          fontWeight: 700,
          fontSize: "18px",
          marginBottom: "18px",
          padding: "0 8px",
        }}>
          <div style={{
            width: 26,
            height: 26,
            borderRadius: 8,
            background: "linear-gradient(135deg, #77f1db, #85a4ff)",
            display: "grid",
            placeItems: "center",
            color: "#071018",
            fontSize: "12px",
          }}>A</div>
          Nexus Dola
        </div>

        <nav style={{ display: "grid", gap: 8 }}>
          {WORKSPACES.map((workspace) => {
            const active = workspace.id === activeWorkspace;
            return (
              <button
                key={workspace.id}
                type="button"
                onClick={() => setActiveWorkspace(workspace.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  border: active ? "1px solid rgba(113, 235, 214, 0.8)" : "1px solid rgba(255,255,255,0.08)",
                  background: active ? "rgba(17, 243, 205, 0.12)" : "rgba(255,255,255,0.02)",
                  color: active ? "#dffef8" : "#dbe4ff",
                  borderRadius: 12,
                  padding: "10px 12px",
                  textAlign: "left",
                  cursor: "pointer",
                  transition: "all 150ms ease",
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span>{workspace.icon}</span>
                  <span style={{ fontWeight: 600 }}>{workspace.label}</span>
                </span>
                {active && <span style={{ fontSize: 10, opacity: 0.9 }}>●</span>}
              </button>
            );
          })}
        </nav>
      </aside>

      <main style={{
        padding: "28px 24px 24px",
        background: "radial-gradient(circle at top, rgba(110,140,255,0.12), transparent 35%), #05070d",
      }}>
        <header style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 18,
          padding: "12px 14px",
          borderRadius: 16,
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}>
          <div>
            <div style={{ fontSize: 12, opacity: 0.75, textTransform: "uppercase", letterSpacing: "0.12em" }}>
              Studio Workspace
            </div>
            <div style={{ fontSize: 24, fontWeight: 800 }}>{WORKSPACES.find((w) => w.id === activeWorkspace)?.label}</div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <select
              value={selectedModelId}
              onChange={(e) => setSelectedModelId(e.target.value)}
              style={{
                background: "rgba(255,255,255,0.04)",
                color: "#edf2ff",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 10,
                padding: "10px 12px",
              }}
            >
              {MODEL_REGISTRY.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.label}
                </option>
              ))}
            </select>
            <button type="button" style={{
              background: "linear-gradient(135deg, #7cf3db, #8dff7c)",
              color: "#08100f",
              border: 0,
              borderRadius: 10,
              padding: "10px 16px",
              fontWeight: 800,
              cursor: "pointer",
            }}>
              Run workflow
            </button>
          </div>
        </header>

        <section style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.2fr) minmax(260px, 420px)",
          gap: 20,
        }}>
          <div style={{
            borderRadius: 18,
            padding: 22,
            background: "rgba(18,22,32,0.9)",
            border: "1px solid rgba(255,255,255,0.08)",
            minHeight: 460,
          }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 18,
              alignItems: "center",
            }}>
              <div>
                <div style={{ fontSize: 12, opacity: 0.7, textTransform: "uppercase", letterSpacing: "0.12em" }}>
                  Active model
                </div>
                <div style={{ fontSize: 24, fontWeight: 700 }}>{activeModel?.label}</div>
              </div>
              <div style={{
                fontSize: 12,
                padding: "6px 10px",
                borderRadius: 999,
                background: "rgba(124,243,219,0.12)",
                color: "#8ef7df",
                border: "1px solid rgba(124,243,219,0.38)",
              }}>
                {activeModel?.provider}
              </div>
            </div>

            <div style={{
              display: "grid",
              gap: 12,
              fontSize: 14,
              opacity: 0.86,
            }}>
              <div style={{
                borderRadius: 14,
                padding: 16,
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>Creative brief</div>
                <textarea
                  rows={7}
                  placeholder="Describe a scene, style, camera move, mood, shot structure, and references..."
                  style={{
                    width: "100%",
                    resize: "none",
                    borderRadius: 12,
                    border: "1px solid rgba(255,255,255,0.08)",
                    background: "rgba(9,11,17,0.9)",
                    color: "#edf2ff",
                    padding: 14,
                    fontSize: 15,
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0,1fr))",
                gap: 12,
              }}>
                {models.map((model) => (
                  <button
                    key={model.id}
                    type="button"
                    onClick={() => setSelectedModelId(model.id)}
                    style={{
                      textAlign: "left",
                      padding: 14,
                      background: selectedModelId === model.id ? "rgba(124,243,219,0.12)" : "rgba(255,255,255,0.02)",
                      border: selectedModelId === model.id ? "1px solid rgba(124,243,219,0.45)" : "1px solid rgba(255,255,255,0.06)",
                      borderRadius: 12,
                      color: "#edf2ff",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ fontWeight: 700 }}>{model.label}</div>
                    <div style={{ opacity: 0.75, marginTop: 6 }}>{model.description}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <aside style={{
            borderRadius: 18,
            padding: 18,
            background: "rgba(18,22,32,0.9)",
            border: "1px solid rgba(255,255,255,0.08)",
            minHeight: 460,
          }}>
            <div style={{ fontSize: 12, opacity: 0.7, textTransform: "uppercase", letterSpacing: "0.12em" }}>
              Orchestration
            </div>
            <div style={{ fontSize: 26, fontWeight: 700, margin: "8px 0 16px" }}>Agent stack</div>

            <div style={{ display: "grid", gap: 10 }}>
              {[
                "Creative Director",
                "Reference Analyst",
                "Prompt Agent",
                "Editor Agent",
                "Motion Agent",
                "Memory Agent",
                "Review Agent",
              ].map((name, index) => (
                <div
                  key={name}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    border: "1px solid rgba(255,255,255,0.08)",
                    background: "rgba(255,255,255,0.02)",
                    borderRadius: 12,
                    padding: "10px 12px",
                  }}
                >
                  <span>{name}</span>
                  <span style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: index < 3 ? "#7cf3db" : "#d6d9ee",
                    opacity: index < 3 ? 1 : 0.75,
                  }} />
                </div>
              ))}
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}
