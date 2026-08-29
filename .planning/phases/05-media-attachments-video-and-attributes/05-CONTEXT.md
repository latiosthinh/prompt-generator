# Phase 5: Media Attachments, Video Prompting & Pinned Attributes - Context

## Overview

User requested rich media expansion capabilities:
1. **File Attachment & Drag & Drop**: User can attach files (images, text, video thumbnails, documents) directly via file picker or drag-and-drop into seed input area.
2. **Video Prompt Generation Domain**: Dedicated support for Video Prompt Generation (Runway Gen-2/Gen-3, Pika, Sora, Kling, Luma Dream Machine, animated shorts, camera movement, motion intensity, FPS, aspect ratio).
3. **Break Prompt from Attached Files (Reverse Prompting / Multimodal Deconstruction)**: Analyze attached files (images/text) to break down and extract core prompt components (subject, style, lighting, camera angle, medium, palette) into seed / questionnaire.
4. **Pinned Type Attributes (Radio Pins / Presets)**: Quick attribute selectors per domain/type (e.g. for Image/Video: Aspect Ratio `16:9`, `9:16`, `1:1`, `4:3`, `21:9`; Resolution `HD`, `FullHD`, `2K`, `4K`, `8K`; Style tags; Motion speed) rendered as interactive pinned radio/chip selectors.

---

## Decisions

- **D-01 (File Attachments & Drag-Drop)**: Implement client-side drag-and-drop file upload zone in `SeedInput.tsx` with support for image previews (`png`, `jpg`, `webp`), text file extraction (`txt`, `md`, `json`), and file size limits. Files encoded as Base64/Data URLs for local processing.
- **D-02 (Video Generation Domain)**: Add `video-generation` domain in `src/config/domains.ts` and i18n dictionaries (`vi.ts`, `en.ts`). Implement domain rules for camera movements (pan, tilt, zoom, tracking shot, FPV), motion pacing/dynamics, aspect ratios, frame rates, and visual continuity in `/api/generate-prompt`.
- **D-03 (Deconstruct / Break Prompt from Attachments)**: Create `/api/deconstruct-media` route or multimodal prompt extraction using Xiaomi-MiMo / LLM to reverse-engineer prompts from attached image descriptions/metadata/text files, populating the seed idea and generating tailored questions automatically.
- **D-04 (Pinned Type Attributes / Radio Pins)**: Add interactive quick-preset bar with pinned radio buttons / chips for domain-specific attributes:
  - **Image**: Aspect Ratio (`1:1`, `16:9`, `9:16`, `4:3`, `21:9`), Quality/Resolution (`Standard`, `HD`, `FullHD`, `2K`, `4K`), Render Engine (`Photorealistic`, `Anime/Illustration`, `Digital Art`, `3D Render/Octane`).
  - **Video**: Aspect Ratio (`16:9`, `9:16`, `1:1`, `2.39:1`), Motion Intensity (`Subtle/Slow`, `Moderate`, `Dynamic/Action`), Camera Movement (`Static`, `Pan/Tilt`, `Tracking/Follow`, `Drone/FPV`), Duration/FPS (`5s / 24fps`, `10s / 30fps`, `60fps`).
- **D-05 (Unified Schema & Storage)**: Update Zod schemas in `src/types/schemas.ts` to include `attachments` (name, type, size, dataUrl) and `pinnedAttributes` (aspectRatio, resolution, motion, camera, etc.) in `GenerateQuestionsRequest`, `GeneratePromptRequest`, and `SessionRound`. Update LocalStorage store for persistence.
