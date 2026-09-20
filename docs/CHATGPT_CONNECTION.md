# ChatGPT connection

Aurora now exposes server-side ModelArk routes. To connect an external assistant safely:

1. Deploy Aurora behind HTTPS.
2. Configure ARK_API_KEY only as a server environment variable.
3. Configure AURORA_MCP_TOKEN as a long random server secret.
4. Require Authorization: Bearer <AURORA_MCP_TOKEN> on assistant-facing routes.
5. Never accept ARK_API_KEY from the browser or from arbitrary client headers.
6. Put rate limiting and authentication in front of media generation.

The existing /api/ark route should remain internal to authenticated application requests.

For a native MCP integration, expose only narrowly scoped tools such as:
- aurora_plan_content
- aurora_generate_image
- aurora_generate_video
- aurora_check_video
- aurora_list_models

Those tools should call the authenticated Aurora backend, which then calls ModelArk.

Do not create a public endpoint that forwards arbitrary ModelArk requests or arbitrary URLs without authentication.
