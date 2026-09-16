import { createFileRoute } from "@tanstack/react-router";

const ARK_BASE = "https://ark.ap-southeast.bytepluses.com/api/v3";

interface ArkBody {
  kind: "image" | "video" | "videoStatus" | "chat" | "models";
  prompt?: string;
  size?: string;
  ratio?: string;
  duration?: number;
  taskId?: string;
  imageUrl?: string;
  messages?: { role: string; content: string }[];
  model?: string;
}

function jsonError(message: string, status: number) {
  return new Response(JSON.stringify({ error: { message } }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
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
        const key = request.headers.get("x-ark-key")?.trim() || process.env["ARK_API_KEY"]?.trim();
        if (!key) {
          return jsonError("Missing ARK API key. Add it in Settings.", 401);
        }
        const body = (await request.json()) as ArkBody;

        if (body.kind === "models") {
          return arkFetch("/models?page_size=200", key, { method: "GET" });
        }

        if (body.kind === "image") {
          if (!body.prompt) return jsonError("Missing prompt", 400);
          const payload: Record<string, unknown> = {
            model: body.model || "seedream-5-0-260128",
            prompt: body.prompt,
            size: body.size || "2K",
            response_format: "url",
            watermark: false,
          };
          if (body.imageUrl) payload["image"] = body.imageUrl;
          return arkFetch("/images/generations", key, {
            method: "POST",
            body: JSON.stringify(payload),
          });
        }

        if (body.kind === "video") {
          if (!body.prompt) return jsonError("Missing prompt", 400);
          const ratio = body.ratio || "16:9";
          const duration = body.duration || 5;
          const content: Record<string, unknown>[] = [
            { type: "text", text: `${body.prompt} --ratio ${ratio} --duration ${duration}` },
          ];
          if (body.imageUrl) {
            content.push({ type: "image_url", image_url: { url: body.imageUrl } });
          }
          return arkFetch("/contents/generations/tasks", key, {
            method: "POST",
            body: JSON.stringify({
              model: body.model || "seedance-1-0-pro-250528",
              content,
            }),
          });
        }

        if (body.kind === "videoStatus") {
          if (!body.taskId) return jsonError("Missing taskId", 400);
          return arkFetch(`/contents/generations/tasks/${body.taskId}`, key, { method: "GET" });
        }

        if (body.kind === "chat") {
          if (!body.messages?.length) return jsonError("Missing messages", 400);
          return arkFetch("/chat/completions", key, {
            method: "POST",
            body: JSON.stringify({
              model: body.model || "seed-2-0-pro-260328",
              messages: body.messages,
            }),
          });
        }

        return jsonError("Unknown request kind", 400);
      },
    },
  },
});
