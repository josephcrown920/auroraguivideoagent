# Aurora GUI — ComfyUI Workflow Studio

This agent owns a separate ComfyUI workflow library and execution endpoint.

## Configure

Set `COMFYUI_BASE_URL=http://127.0.0.1:8188`.

The studio exposes Import, New, Save and Run controls from the main Nexus studio.

## Import format

API-format ComfyUI graphs are directly executable. Standard editor-format exports are retained as imported references and should be re-exported as API format from ComfyUI before running.

## Execution

The server queues the graph at `/prompt` and polls `/history/{prompt_id}` until completion. Outputs are returned to the studio review lifecycle.

## Agent routing

The multi-agent graph contains a ComfyUI Workflow Agent between storyboard planning and timeline editing so generation/compositing workflows can become first-class production steps.
