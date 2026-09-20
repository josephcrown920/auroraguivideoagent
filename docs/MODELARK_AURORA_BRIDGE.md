# Aurora ↔ ModelArk Bridge

Aurora keeps ModelArk credentials server-side and exposes two backend routes:

- POST /api/modelark — Responses API proxy for agent/chat/tool-calling.
- POST /api/content-agent — creative-director content planning endpoint.

Required server environment:

- ARK_API_KEY
- Optional ARK_BASE_URL (defaults to https://ark.ap-southeast.bytepluses.com/api/v3)
- Optional ARK_AGENT_MODEL (defaults to dola-seed-2-1-turbo-260628)

Never put ARK_API_KEY in client-side code or commit it to Git.

The existing /api/ark route remains the media gateway for Seedream/Seedance generation and status polling.

Recommended flow:

ChatGPT or another authorized client → Aurora backend → ModelArk Responses API → Aurora media routes → Seedream/Seedance.

Reference images are passed as asset URLs through the backend; the client never needs to understand provider-specific reference syntax.

Before exposing these routes publicly, put them behind authentication and rate limiting. Do not rely on a custom x-ark-key header from untrusted browsers in production.
