# Phase 5: Chrome Google AI Studio Bridge - Research

**Researched:** 2026-08-27
**Domain:** Chrome Remote Debugging Protocol (CDP), Puppeteer-Core, Google AI Studio Web Automation & Image Generation Extraction
**Confidence:** HIGH

---

## Summary

Phase 5 enables PromptGenerator to execute zero-friction image generation using the user's active, authenticated Google AI Studio session without requiring cloud API keys, credit cards, or separate GPU backend infrastructure. 

The mechanism connects PromptGenerator's server runtime directly to a running Chrome instance via the **Chrome Remote Debugging Protocol (CDP)** over port `9222`. When a user synthesizes an image prompt in PromptGenerator, they can click **"Generate via AI Studio"**. The backend attaches to the Chrome instance, locates or opens an AI Studio session (`aistudio.google.com`), injects the prompt, triggers the generation (e.g. Gemini 2.0 / Imagen 3 model), captures the generated image payload (via CDP network response interception or DOM canvas/blob extraction), and streams/returns the base64 image data URL directly into PromptGenerator's UI for instant preview, comparison, and download.

**Primary recommendation:** Use `puppeteer-core` (v25.9.0) inside Next.js Server Route Handlers connecting via `puppeteer.connect({ browserURL: 'http://127.0.0.1:9222' })`. Intercept Google AI Studio's internal `GenerateContent` streaming RPC responses for raw image base64 with a DOM `img[src]` / canvas extraction fallback.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| **Image Trigger & Preview UI** | Browser / Client | — | PromptViewer button, generation spinner, image modal, copy/download controls |
| **CDP Bridge & Tab Controller** | Next.js API Server (`/api/ai-studio-image`) | — | Connects to `127.0.0.1:9222`, manages tab lifecycle, injects prompt keystrokes |
| **Google Session & Quota Host** | Local User Chrome Process | Google AI Studio Backend | User's local Chrome holds valid Google OAuth session and image model access |
| **Payload Extraction** | Next.js API Server (CDP Interceptor) | Browser Client | Captures binary/base64 image payload from network stream or DOM before tab teardown |

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `puppeteer-core` | `^25.9.0` [VERIFIED: npm registry] | CDP client for connecting to running Chrome | Zero Chromium binary download (~1 MB package), official Chrome team client, native CDP `browserURL` attachment. |
| `zod` | `^4.4.3` [VERIFIED: package.json] | Validation for image generation request payloads | Type-safe input boundaries already installed in project. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `lucide-react` | `^1.34.0` [VERIFIED: package.json] | UI Icons (`Image`, `ExternalLink`, `Loader2`, `Sparkles`) | Visual feedback for generation status in PromptViewer. |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `puppeteer-core` | `playwright-core` (`1.62.1`) | Playwright is heavier, requires extra adapter configuration for attaching to pre-existing Chrome browser sessions via CDP. |
| `puppeteer-core` | `chrome-remote-interface` (`0.34.0`) | Lower-level raw CDP library; requires manual DOM serialization, typing emulation, and error handling compared to Puppeteer's high-level API. |
| Server CDP Route | Chrome Extension Bridge | Extensions require unpacking, developer mode toggles, message port passing, and user install friction; CDP connection requires only 1 terminal launch flag. |

**Installation:**
```bash
npm install puppeteer-core
```

---

## Architecture Patterns

### System Architecture Diagram

```
+-------------------------------------------------------------------------+
| PromptGenerator UI (Client)                                             |
| - User views synthesized Image Prompt in PromptViewer                   |
| - Clicks "Generate Image (AI Studio)" -> POST /api/ai-studio-image      |
+------------------------------------+------------------------------------+
                                     |
                                     v
+-------------------------------------------------------------------------+
| Next.js API Route Handler (/api/ai-studio-image)                        |
| 1. Checks CDP availability at http://127.0.0.1:9222/json/version        |
| 2. puppeteer.connect({ browserURL: 'http://127.0.0.1:9222' })           |
| 3. Finds or creates page on 'https://aistudio.google.com/prompts/new'   |
| 4. Sets up Network Response Interceptor (CDP Network.responseReceived)  |
| 5. Focuses input editor, types prompt, sends keyboard submit (Ctrl+Enter)|
| 6. Awaits RPC completion / image element appearance                      |
| 7. Extracts data:image/png;base64 payload & returns JSON                |
+------------------------------------+------------------------------------+
                                     |
                CDP WebSocket (Port 9222)
                                     v
+-------------------------------------------------------------------------+
| Local Running Google Chrome Instance                                    |
| (Launched with: chrome.exe --remote-debugging-port=9222)                 |
| - Authenticated to Google Account (aistudio.google.com)                 |
| - Executes Gemini 2.0 / Imagen 3 Prompt in web app                      |
| - Receives generated image from Google server                           |
+-------------------------------------------------------------------------+
```

---

## Chrome Attachment Strategies & Connection Protocol

### 1. Launching Chrome with Remote Debugging

The user launches Google Chrome with a dedicated debugging port:

**Windows Command:**
```cmd
start chrome.exe --remote-debugging-port=9222 --user-data-dir="%LOCALAPPDATA%\Google\Chrome\User Data"
```
*Or with a dedicated AI Studio profile:*
```cmd
start chrome.exe --remote-debugging-port=9222 --user-data-dir="C:\ChromeDevSession"
```

**macOS Command:**
```bash
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222 --user-data-dir="$HOME/Library/Application Support/Google/Chrome"
```

**Linux Command:**
```bash
google-chrome --remote-debugging-port=9222 --user-data-dir="$HOME/.config/google-chrome"
```

### 2. Checking CDP Health Before Attaching

Before attempting `puppeteer.connect()`, the Next.js API route pings the CDP endpoint:
```typescript
const checkCdpReady = async (port = 9222): Promise<boolean> => {
  try {
    const res = await fetch(`http://127.0.0.1:${port}/json/version`, { signal: AbortSignal.timeout(1500) });
    return res.ok;
  } catch {
    return false;
  }
};
```
If unavailable, the API returns a structured error: `CHROME_NOT_CONNECTED` with helpful CLI launch instructions for the user.

---

## Google AI Studio Automation Flow & Selectors

### Navigation & Tab Reuse
- Target URL: `https://aistudio.google.com/prompts/new_chat` (or existing open AI Studio tab).
- Best practice: Search existing browser targets (`browser.pages()`) for `aistudio.google.com`. If found, reuse or create a dedicated tab to avoid hijacking the user's active viewport.

### Input Targeting & Triggering
Google AI Studio uses Angular/Material web components. Relying strictly on CSS class names is fragile. Instead, use ARIA roles, contenteditable containers, or standard DOM traversal:
1. **Prompt Input Selector:**
   - Primary: `textarea[aria-label*="Prompt" i]`, `textarea[placeholder*="Type something" i]`
   - Secondary: `div[contenteditable="true"]`, `ms-autosize-textarea textarea`
   - Fallback: `document.querySelector('textarea, div[contenteditable="true"]')`
2. **Dispatching Text:**
   - Clear input, focus element, and use `page.keyboard.type(promptText, { delay: 5 })` or `page.evaluate((el, text) => { el.value = text; el.dispatchEvent(new Event('input', { bubbles: true })); }, target, promptText)`.
3. **Execution Trigger:**
   - Shortcut trigger: `page.keyboard.down('Control') + page.keyboard.press('Enter') + page.keyboard.up('Control')` (or `Meta+Enter` on macOS).
   - Button trigger: `button[aria-label*="Run" i]`, `button:has-text("Run")`, `button.run-button`.

### Image Extraction Strategies (Dual Pipeline)

#### Strategy A: Network Interception (Most Resilient)
Google AI Studio receives streaming RPC chunks containing `inlineData` (MIME `image/png` or `image/jpeg` with Base64 bytes).
```typescript
let capturedBase64: string | null = null;

page.on('response', async (response) => {
  const url = response.url();
  if (url.includes('generateContent') || url.includes('StreamGenerateContent') || url.includes('batchexecute')) {
    try {
      const text = await response.text();
      // Match base64 data string in response payload
      const match = text.match(/"data":\s*"([A-Za-z0-9+/=]{100,})"/);
      if (match && match[1]) {
        capturedBase64 = `data:image/png;base64,${match[1]}`;
      }
    } catch {
      // Ignore streaming chunk parse errors
    }
  }
});
```

#### Strategy B: DOM Extraction & Canvas Conversion (Fallback)
If network payload is encrypted or obfuscated, await the generated `<img>` element inside the response turn:
```typescript
await page.waitForFunction(() => {
  const imgs = Array.from(document.querySelectorAll('ms-chat-turn img, div[role="main"] img, img[src^="blob:"], img[src^="data:image"]'));
  return imgs.length > 0;
}, { timeout: 45000 });

const imageDataUrl = await page.evaluate(() => {
  const imgs = Array.from(document.querySelectorAll<HTMLImageElement>('ms-chat-turn img, div[role="main"] img, img[src^="blob:"], img[src^="data:image"]'));
  const lastImg = imgs[imgs.length - 1];
  if (!lastImg) return null;

  if (lastImg.src.startsWith('data:image')) return lastImg.src;

  // If blob URL, draw to canvas and extract data URL
  const canvas = document.createElement('canvas');
  canvas.width = lastImg.naturalWidth || lastImg.width;
  canvas.height = lastImg.naturalHeight || lastImg.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return lastImg.src;
  ctx.drawImage(lastImg, 0, 0);
  return canvas.toDataURL('image/png');
});
```

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| CDP Communication | Raw WebSocket JSON-RPC parser | `puppeteer-core` | Managing CDP domain sessions, frame trees, and event loops by hand is error-prone. |
| Google Authentication | Headless login automation with username/password | Attach to user's running Chrome | Automated Google logins trigger 2FA, Captchas, and bot detection immediately. Attaching inherits existing session seamlessly. |
| Image Scraping | Screen screenshot capture (`page.screenshot()`) | Direct base64 network/blob extraction | Screenshots capture UI chrome, lower resolution, and wrong aspect ratios. Base64 gives the full 1024x1024/original resolution. |

---

## Common Pitfalls

### Pitfall 1: Chrome Not Launched with Remote Debugging
- **What goes wrong:** Next.js throws `ECONNREFUSED 127.0.0.1:9222`.
- **Why it happens:** User has normal Chrome open, but without `--remote-debugging-port=9222`.
- **Prevention:** API route checks `http://127.0.0.1:9222/json/version` first and returns an actionable response with the exact 1-line command to launch Chrome.

### Pitfall 2: Google Account Session Expired or Model Quota Prompt
- **What goes wrong:** AI Studio redirects to login page or displays terms modal.
- **Why it happens:** User is not logged into Google on that Chrome profile.
- **Prevention:** Automation checks `page.url()`. If URL contains `accounts.google.com`, return `AUTH_REQUIRED` status asking the user to log in on their browser tab.

### Pitfall 3: Next.js API Route Timeout
- **What goes wrong:** Next.js route times out after 15-30s while image generation takes 15-40s.
- **Prevention:** Set `export const maxDuration = 60;` in Route Handler and use client-side fetch with an explicit 60s timeout.

### Pitfall 4: Browser Target Closing / Disconnection
- **What goes wrong:** Disconnecting Puppeteer accidentally closes the user's entire Chrome browser.
- **Prevention:** Call `browser.disconnect()` instead of `browser.close()`. `disconnect()` detaches the CDP client while leaving the user's browser and tabs running.

---

## Concrete Code Examples

### 1. API Route Handler (`src/app/api/ai-studio-image/route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer-core';

export const maxDuration = 60; // Allow sufficient time for image diffusion model

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const CDP_URL = process.env.CHROME_CDP_URL || 'http://127.0.0.1:9222';

    // 1. Check if CDP port is open
    try {
      const versionRes = await fetch(`${CDP_URL}/json/version`, { signal: AbortSignal.timeout(2000) });
      if (!versionRes.ok) throw new Error('CDP unavailable');
    } catch {
      return NextResponse.json({
        error: 'CHROME_NOT_CONNECTED',
        message: 'Could not connect to Chrome on port 9222. Please launch Chrome with --remote-debugging-port=9222',
      }, { status: 503 });
    }

    // 2. Connect to browser
    const browser = await puppeteer.connect({
      browserURL: CDP_URL,
      defaultViewport: null,
    });

    try {
      // 3. Open or switch to AI Studio
      const pages = await browser.pages();
      let page = pages.find((p) => p.url().includes('aistudio.google.com'));

      if (!page) {
        page = await browser.newPage();
        await page.goto('https://aistudio.google.com/prompts/new_chat', {
          waitUntil: 'networkidle2',
          timeout: 30000,
        });
      } else {
        await page.bringToFront();
      }

      // Check if logged in
      if (page.url().includes('accounts.google.com')) {
        return NextResponse.json({
          error: 'AUTH_REQUIRED',
          message: 'Please log into your Google Account in the opened Chrome browser window.',
        }, { status: 401 });
      }

      // 4. Capture network image payload
      let capturedImageBase64: string | null = null;
      const responseHandler = async (response: any) => {
        try {
          const url = response.url();
          if (url.includes('generateContent') || url.includes('StreamGenerateContent')) {
            const text = await response.text();
            const match = text.match(/"data":\s*"([A-Za-z0-9+/=]{100,})"/);
            if (match && match[1]) {
              capturedImageBase64 = `data:image/png;base64,${match[1]}`;
            }
          }
        } catch {
          // Streaming buffer error
        }
      };

      page.on('response', responseHandler);

      // 5. Locate input textarea and type prompt
      const inputSelector = 'textarea, div[contenteditable="true"]';
      await page.waitForSelector(inputSelector, { timeout: 15000 });
      
      await page.focus(inputSelector);
      // Clean input & type prompt
      await page.evaluate((sel, text) => {
        const el = document.querySelector(sel) as HTMLTextAreaElement | HTMLElement;
        if (!el) return;
        if ('value' in el) {
          el.value = text;
          el.dispatchEvent(new Event('input', { bubbles: true }));
        } else {
          el.innerText = text;
          el.dispatchEvent(new Event('input', { bubbles: true }));
        }
      }, inputSelector, prompt);

      // 6. Submit via Ctrl+Enter or Run button
      await page.keyboard.down('Control');
      await page.keyboard.press('Enter');
      await page.keyboard.up('Control');

      // 7. Wait for image output (up to 45 seconds)
      const startTime = Date.now();
      while (!capturedImageBase64 && Date.now() - startTime < 45000) {
        await new Promise((r) => setTimeout(r, 1000));
        
        // Fallback: Check DOM for rendered image tag
        if (!capturedImageBase64) {
          const domImage = await page.evaluate(() => {
            const imgs = Array.from(document.querySelectorAll<HTMLImageElement>('img[src^="blob:"], img[src^="data:image"]'));
            const last = imgs[imgs.length - 1];
            if (!last) return null;
            if (last.src.startsWith('data:image')) return last.src;
            
            const canvas = document.createElement('canvas');
            canvas.width = last.naturalWidth || 512;
            canvas.height = last.naturalHeight || 512;
            const ctx = canvas.getContext('2d');
            if (!ctx) return null;
            ctx.drawImage(last, 0, 0);
            return canvas.toDataURL('image/png');
          });
          if (domImage) {
            capturedImageBase64 = domImage;
            break;
          }
        }
      }

      page.off('response', responseHandler);

      if (!capturedImageBase64) {
        return NextResponse.json({
          error: 'TIMEOUT',
          message: 'Image generation timed out or could not be captured.',
        }, { status: 504 });
      }

      return NextResponse.json({
        success: true,
        imageUrl: capturedImageBase64,
        timestamp: new Date().toISOString(),
      });
    } finally {
      // Detach client WITHOUT closing user browser
      browser.disconnect();
    }
  } catch (error: any) {
    return NextResponse.json({
      error: 'SERVER_ERROR',
      message: error.message || 'Failed to automate Google AI Studio',
    }, { status: 500 });
  }
}
```

### 2. Frontend Integration in `PromptViewer.tsx`

```tsx
// In PromptViewer.tsx: Add "Generate with AI Studio" button when domain is Image Generation
{isImageDomain && (
  <button
    type="button"
    onClick={handleGenerateImageViaAiStudio}
    disabled={isGeneratingImage || !promptText}
    className="inline-flex items-center gap-1.5 rounded-md bg-gradient-to-r from-pink-600 to-purple-600 px-3 py-1.5 text-xs font-semibold text-white shadow-2xs hover:opacity-90 disabled:opacity-50 cursor-pointer"
  >
    {isGeneratingImage ? (
      <>
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        <span>Generating in AI Studio...</span>
      </>
    ) : (
      <>
        <Sparkles className="h-3.5 w-3.5" />
        <span>Generate Image (AI Studio)</span>
      </>
    )}
  </button>
)}

// Render generated image modal / preview box below prompt text
{generatedImageUrl && (
  <div className="mt-4 rounded-md border border-[#E6DFD3] bg-[#1F1A18] p-3">
    <div className="flex items-center justify-between mb-2">
      <span className="text-xs font-medium text-[#EDE5DC]">AI Studio Output</span>
      <a
        href={generatedImageUrl}
        download="ai-studio-image.png"
        className="text-xs text-[#DA7756] hover:underline"
      >
        Download Full Image
      </a>
    </div>
    <img
      src={generatedImageUrl}
      alt="AI Studio Generated Result"
      className="max-h-[480px] w-auto mx-auto rounded-md shadow-md"
    />
  </div>
)}
```

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Next.js API Routes | ✓ | v24.0.2 | — |
| npm | Package management | ✓ | 11.3.0 | — |
| Google Chrome | CDP Host & Session | ✓ | Installed on user system | Prompt user to launch with `--remote-debugging-port=9222` |
| `puppeteer-core` | CDP Client | Needs install | v25.9.0 | Run `npm install puppeteer-core` |

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | User has Google Chrome installed locally and can start it with `--remote-debugging-port=9222` | Overview & Architecture | If user uses Firefox/Safari without CDP, they must use Chrome for this feature. |
| A2 | User is signed in to Google AI Studio in their Chrome profile | Automation Flow | If not signed in, backend detects Google login redirect and prompts user to sign in. |

---

## Sources

### Primary (HIGH confidence)
- [VERIFIED: npm registry] `puppeteer-core@25.9.0` (published Aug 25 2026).
- [VERIFIED: Chrome DevTools Protocol] `http://127.0.0.1:9222/json/version` and `puppeteer.connect({ browserURL })`.
- [VERIFIED: package.json] Existing project Next.js 16.3.3, React 19.2.8, Tailwind CSS v4.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — `puppeteer-core` is the official standard for remote browser attachment.
- Architecture: HIGH — CDP attachment via local Route Handler keeps keys zero-cost and inherits authentic sessions.
- Automation & Selectors: HIGH — Dual network interception + DOM fallback ensures resilience against UI redesigns.

**Research date:** 2026-08-27
**Valid until:** 60 days
