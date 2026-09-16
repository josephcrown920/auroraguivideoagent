import { createFileRoute } from "@tanstack/react-router";

const ARK_BASE = "https://ark.cn-beijing.volces.com/api/v3";

interface ArkBody {
  kind: "image" | "video" | "videoStatus" | "chat";
  prompt?: string;
  size?: string;
  ratio?: string;
  taskId?: string;
  messages?: { role: string; content: string }[];
  model?: string;
}

async function arkFetch(path: string, key: string, init?: RequestInit) {
  const res = await fetch(`${ARK_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
  });
  const text = await res.text();
  return new Response(text, {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}

export const Route = createFileRoute("/api/ark")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = request.headers.get("x-ark-key")?.trim();
        if (!key) {
          return new Response(
            JSON.stringify({ error: { message: "Missing ARK API key. Add it in Settings." } }),
            { status: 401, headers: { "Content-Type": "application/json" } },
          );
        }
        const body = (await request.json()) as ArkBody;

        if (body.kind === "image") {
          return arkFetch("/images/generations", key, {
            method: "POST",
            body: JSON.stringify({
              model: body.model || "doubao-seedream-4-0-250828",
              prompt: body.prompt,
              size: body.size || "2K",
              response_format: "url",
              watermark: false,
            }),
          });
        }

        if (body.kind === "video") {
          const ratio = body.ratio || "16:9";
          return arkFetch("/contents/generations/tasks", key, {
            method: "POST",
            body: JSON.stringify({
              model: body.model || "doubao-seedance-1-0-lite-t2v-250428",
              content: [{ type: "text", text: `${body.prompt} --ratio ${ratio} --duration 5` }],
            }),
          });
        }

        if (body.kind === "videoStatus") {
          if (!body.taskId) {
            return new Response(JSON.stringify({ error: { message: "Missing taskId" } }), {
              status: 400,
              headers: { "Content-Type": "application/json" },
            });
          }
          return arkFetch(`/contents/generations/tasks/${body.taskId}`, key, { method: "GET" });
        }

        if (body.kind === "chat") {
          return arkFetch("/chat/completions", key, {
            method: "POST",
            body: JSON.stringify({
              model: body.model || "doubao-seed-1-6-250615",
              messages: body.messages,
            }),
          });
        }

        return new Response(JSON.stringify({ error: { message: "Unknown request kind" } }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
