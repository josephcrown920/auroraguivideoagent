# NBA Court Glass Studio Upgrade

## Goal
Turn Aurora into a clear, premium creator workstation: pure glass controls over an NBA-court atmosphere, with an always-visible AI creative assistant guiding image and video creation.

## What will change

### 1. Model lineup
- Promote **Dola Seed 2.1 Turbo** from the existing chat list into the new assistant bar above the editor.
- Promote **GPT Image 2.5 Sunburst** in the image picker and label it clearly as a ZenMux model that may require balance.
- Add an available **Qwen** chat model as a second creative-assistant option after checking the connected provider’s live model list.
- Keep the existing image and video generation model choices intact.

### 2. AI director above the editor
- Replace the detached chat-first workflow with a visible **Creative Director** strip directly above the image/video editor.
- Add a compact LLM picker for Dola Seed 2.1 Turbo and Qwen.
- Let Josh ask for a concept, treatment, shot list, prompt rewrite, rollout angle, or edit direction without leaving the creation flow.
- Stream the assistant response into the strip and provide one-click actions to apply the result to the generation prompt or continue refining it.
- Preserve the existing NBA Josh profile, skills, conversation context, voice replies, and saved memory.

### 3. NBA court pure-glass visual system
- Replace the sad/dim moon-led first screen with a cinematic basketball-court backdrop: polished hardwood, arena light, tunnel energy, and space for readable controls.
- Rework surfaces into clearer neutral glass with stronger edge highlights, less muddy tint, and restrained court-red/gold accents.
- Keep the content visually tied to NBA Josh as an artist: courtside ambition and performance energy, not a sports-statistics dashboard.
- Make the editor the first-screen focal point, with the gallery visible below as the natural next step.

### 4. Editor GUI refinement
- Reorganize mode, references, model, ratio, quality/duration, and generate controls into a compact workstation layout.
- Keep multi-reference upload and removal fully available.
- Make model menus, toggles, assistant controls, and generation actions visibly clickable on desktop and mobile.
- Preserve image/video generation, task polling, gallery history, settings, voice, skills, and memory behavior.

### 5. Validation
- Verify Dola, Qwen, and Sunburst selection paths.
- Test streamed assistant output and “apply to prompt.”
- Test image and video mode controls, multi-reference uploads, menus, voice controls, and persistence.
- Check desktop and mobile layouts for overlap, readability, and working controls.
- Keep known provider balance errors visible rather than masking them.

## Technical notes
- Split the oversized main screen into focused editor/assistant pieces where practical instead of adding more state to one large file.
- Reuse the existing streaming chat endpoint and saved memory model; no new database is required.
- Use a bundled court image asset rather than a remote image URL.
- Keep server keys private and preserve provider routing for ModelArk and ZenMux.
