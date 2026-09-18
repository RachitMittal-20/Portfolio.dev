# THE FORGE — Portfolio Build Plan (for Claude Code)

A cinematic, scroll-driven 3D portfolio for **Rachit Mittal** — full-stack developer building with AI.
Motion language studied from leoparpeix.com (Awwwards SOTD, Sep 2026); every scene, character, asset and line of code is original.

---

## 0. How to use this file

1. Create an empty folder `the-forge/`, open it in your terminal, run `git init`.
2. Copy **Section 2 (CLAUDE.md)** into `the-forge/CLAUDE.md` **before your first prompt**. Claude Code reads it automatically every session — it is what stops Claude from committing on its own.
3. Put this whole file at `the-forge/docs/BUILD_PLAN.md` so Claude Code can reference it.
4. Run the prompts **in order**, one at a time. After each prompt:
   - Run `npm run dev`, check the result in the browser.
   - Claude will stop and say **"Ready for review — suggested commit: …"**.
   - If it looks right, commit yourself:
     ```bash
     git add -A
     git commit -m "<the commit message under that prompt>"
     ```
   - If not, tell Claude what's wrong in the same session before committing.
5. Every prompt begins with `Read CLAUDE.md and docs/BUILD_PLAN.md section <X> first.` — keep that line, it re-anchors Claude in long projects.

> Tip: start a **fresh Claude Code session per Phase** (not per prompt). Keeps context clean, and CLAUDE.md + this plan carry all the memory it needs.

---

## 1. Creative direction (decisions already made)

### 1.1 Concept — "The Forge"
You are an unfinished sword. Every project forges a rune into the blade. A small dragon companion guides visitors, eats embers they find, and — once fed — reveals its true, colossal form and unlocks **"Ask the Dragon"**, a RAG chat grounded in your real work.

### 1.2 Art style — "Painted Clay Anime"
The finish of Léo's soft clay renders + the warmth of hand-painted anime backgrounds. Original, not imitating any studio or film.

| Element | Rule |
|---|---|
| Materials | Matte, rounded, clay-like. No chrome, no photoreal textures |
| Shading | **Custom toon shader**: 3-step soft gradient ramp (light / mid / shadow) + subtle painted noise + soft rim light. Not hard cel lines |
| Outlines | Very thin, only on characters (knight, dragon, sword), colour = darker shade of the object, never pure black |
| Skies | Big painted cumulus clouds, gradient skies, drifting — the "anime background" moment |
| Light | Golden-hour key light, warm; cool sky fill; god-rays as gradient planes |
| Post-processing | Gentle bloom on glowing things only, soft vignette, fine film grain (Léo uses grain too — keeps renders from looking "CG") |

### 1.3 Palette — "Dawn Ember"
```
--stone-50   #F6F1E7   ivory (page bg, light surfaces)
--stone-200  #E4D8C3   sandstone
--stone-400  #B9A68A   warm stone shadow
--ink-900    #1B1A22   text, dark UI
--sky-200    #CFE3EE   sky
--sky-400    #8DB6CF   deep sky
--moss-500   #5E7F5A   mountains / forest
--ember-500  #E8703A   PRIMARY ACCENT — runes, embers, CTAs
--ember-300  #F4A874   ember glow
--arcane-400 #5FD3C6   secondary accent — gem core, AI chat, magic
--night-900  #10202A   loader + playground dark surfaces
--gold-400   #E3B85C   treasure, stamps
```
Rule: accents (ember / arcane / gold) cover < 10 % of any screen.

### 1.4 Typography
- **Display (big uppercase statements):** `Clash Display` (Fontshare, free for commercial use) — wide, confident, close in energy to Léo's Avantt without copying it.
- **Body / UI:** `Satoshi` (Fontshare, free) — clean grotesk.
- **Parchment posters only:** `Cinzel` (Google Fonts) for "WANTED" headers.
- Self-host all fonts from `/public/fonts` with `font-display: swap`.

### 1.5 Motion language (taken from the Léo study — keep exact)
```ts
// src/lib/motion/easings.ts
export const EASE = {
  main:   'cubic-bezier(0.16, 1, 0.1, 1)',   // most UI + reveals (fast start, velvet landing)
  expo:   'cubic-bezier(0.19, 1, 0.22, 1)',  // big movements, page transitions
  inOut:  'cubic-bezier(0.45, 0, 0.2, 1)',   // loops, camera
  std:    'cubic-bezier(0.4, 0, 0.2, 1)',    // small hovers
}
```
- **Lenis** smooth scroll everywhere (lerp ≈ 0.1), synced to GSAP ticker.
- **Line-mask reveal:** each line inside `overflow: clip`, slides from `yPercent: 110` → `0`, stagger 0.08s, 1.2s, `EASE.main`. Keeps `aria-label` with full text.
- **Scroll character fill:** two stacked layers — base chars at `opacity 0.15`, reveal chars `0 → 1` scrubbed by ScrollTrigger, one char at a time.
- **Cursor pill:** fixed, `pointer-events: none`, origin bottom-left, scales `0 → 1` on contextual targets ("Click — feed the dragon").
- **Sound bars:** 4 bars, equaliser bounce when on, flat (`scaleY 0.1`) when muted. Body class `awaiting-sound-click` until first click.
- **Popup unmask:** outer wrapper slides in, inner wrapper slides the opposite way at the same time.
- **Fixed full-screen WebGL canvas** behind the DOM; scroll progress drives camera between scenes.
- `prefers-reduced-motion`: disable scrubs/parallax, keep fades.

### 1.6 Tech stack (final)
| Area | Choice | Why |
|---|---|---|
| Framework | **Next.js 15 (App Router) + TypeScript (strict)** | Your stack; SSG for speed + SEO |
| Styling | **CSS Modules + CSS variables** (no Tailwind) | Motion-heavy bespoke UI is cleaner in plain CSS |
| 3D | **three + @react-three/fiber + @react-three/drei + @react-three/postprocessing** | |
| Motion | **gsap (+ ScrollTrigger, SplitText — free since 3.13)**, **lenis** | Same as studied site |
| Characters' 2D states | **@rive-app/react-canvas** for the small dragon companion | State machine: idle/fly/eat/talk/breathe |
| Physics (Playground) | **matter-js** | Coins & embers |
| State | **zustand** | Dragon hunger, runes, sound, loader |
| Sound | **howler** | Same as studied site |
| AI | **Groq** (`llama-3.3-70b-versatile` chat) + **local embeddings at build time** (`@xenova/transformers`, `all-MiniLM-L6-v2`) stored as JSON; cosine search in a Route Handler | Free, fast, zero vector-DB cost |
| Content | Typed TS/JSON files in `src/content/` | One place to edit projects/achievements |
| Quality | ESLint, Prettier, Vitest (logic), Playwright (smoke), Lighthouse CI | |
| Deploy | Vercel | |

### 1.7 3D asset strategy
**Placeholder-first.** Every model is built as a procedural placeholder (primitives + the toon shader) behind a `<ModelSlot name="sword" />` component that loads `/public/models/<name>.glb` if it exists and falls back to the placeholder otherwise. The whole site ships and looks good *before* any Blender work; you swap in real `.glb` files later with zero code changes. Phase 11 lists every model spec for Blender / an artist.

### 1.8 Featured content
- **Projects (runes):** Trident Oracle · RagForge · QuantForge · CareerLens
- **Bounty board:** Nile Technologies internship · Doritech internship · NLP research paper · hackathon/challenge entries · B.Tech SRMIST (edit freely in `src/content/bounties.ts`)

### 1.9 Site map
```
/            Home     Loader(gem) → Altar above clouds → Throne Room (statement) → The Armoury (projects/runes) → Balcony at sunset (contact)
/about       About    The Encounter (knight vs colossal dragon) → The Road (bounty board) → skills/stack → CTA
/playground  Hoard    Flat bold page, feed-the-dragon coin physics, experiments gallery, live relic demo, "About this portfolio" popup
/work/[slug] Case study page per project (line reveals, architecture diagram drawn on scroll)
Global: dragon companion, sound, cursor pill, menu, "Ask the Dragon" chat (unlocked)
```

---

## 2. CLAUDE.md — paste this into the project root FIRST

```markdown
# CLAUDE.md — The Forge portfolio

## ⛔ GIT RULES (highest priority, never override)
- NEVER run `git commit`, `git push`, `git reset`, `git rebase`, `git stash`, `git checkout -- .`, or any command that writes git history or discards changes.
- NEVER amend commits or create branches/tags unless the user explicitly types the command for you.
- You MAY run read-only git commands: `git status`, `git diff`, `git log`.
- When a task is finished, STOP and print exactly:
  `✅ Ready for review — suggested commit: "<message>"`
  followed by a short list of files changed and how to verify in the browser. Then wait. The user commits manually.

## Working style (user preferences)
- Think through the full plan for the task first, then write each file completely in one go.
- Prefer whole-file rewrites over small patches when a file changes substantially.
- Every file gets inline comments explaining what each part does and what it connects to.
- One prompt = one reviewable step. Do not start the next step from docs/BUILD_PLAN.md unless asked.
- If something in the plan is ambiguous or a better approach exists, ASK before building.

## Project facts
- Next.js 15 App Router, TypeScript strict, CSS Modules + CSS variables (no Tailwind).
- 3D: three, @react-three/fiber, drei, postprocessing. Motion: gsap (ScrollTrigger, SplitText), lenis. Sound: howler. State: zustand.
- Easings live in src/lib/motion/easings.ts — never invent new curves.
- Design tokens live in src/styles/tokens.css — never hardcode colours.
- All 3D models load through <ModelSlot/>; procedural placeholder when the .glb is missing.
- Respect prefers-reduced-motion everywhere.
- Never copy code, fonts, models, or copy text from leoparpeix.com or any other site.

## Quality bar
- `npm run lint` and `npm run typecheck` must pass before you say a task is ready.
- No console errors. 60fps target on a mid laptop; check with the in-app perf monitor (dev only).
- Mobile (≤ 768px) must work: lighter scenes / video fallbacks as specified.
```

---

## 3. The prompts

Format for every step:
> **Prompt** — paste into Claude Code
> **Verify** — what you check
> **Commit** — the message to use once you're happy

---

### PHASE 1 — Foundation

#### Prompt 1.1 — Scaffold
```
Read CLAUDE.md and docs/BUILD_PLAN.md sections 1 and 2 first.

Scaffold the project in the current folder:
- Next.js 15 App Router, TypeScript strict, src/ directory, ESLint, no Tailwind, import alias @/*.
- Add Prettier (+ eslint-config-prettier), scripts: dev, build, start, lint, typecheck (tsc --noEmit), format.
- Install: three @react-three/fiber @react-three/drei @react-three/postprocessing gsap lenis howler zustand matter-js @rive-app/react-canvas, and types: @types/three @types/howler @types/matter-js.
- Folder structure:
  src/app, src/components/{ui,motion,layout,three,dragon,sections}, src/scenes, src/lib/{motion,audio,three,ai}, src/store, src/content, src/styles, public/{fonts,models,audio,textures,rive}, docs/
- Replace the default page with a single centered "The Forge — under construction" line.
- Add a .gitignore suitable for Next.js + .env*.local, and a README with project name, stack and run commands.
Do not commit. Finish with the review message.
```
**Verify:** `npm run dev` shows the placeholder line; `npm run lint` and `npm run typecheck` pass.
**Commit:** `chore: scaffold Next.js 15 project with 3D, motion and audio dependencies`

---

#### Prompt 1.2 — Design tokens, fonts, global styles
```
Read CLAUDE.md and docs/BUILD_PLAN.md sections 1.3, 1.4, 1.5.

1. Download Clash Display (500, 600) and Satoshi (400, 500, 700) from Fontshare, and Cinzel (600) from Google Fonts, as woff2 into public/fonts. Load them with next/font/local in src/app/fonts.ts (display: swap). If you cannot download, create the folder structure and tell me exactly which files to place where.
2. Create src/styles/tokens.css with every palette variable from section 1.3, plus: spacing scale (4px base), fluid type scale using clamp() (xs → display-xl), radii, z-index layers (canvas, content, ui, cursor, loader, popup), and grid (12 cols, 24px gutter desktop / 16px mobile).
3. Create src/lib/motion/easings.ts exactly as section 1.5, and export CSS custom properties for them in tokens.css (--ease-main, etc.).
4. src/styles/globals.css: modern reset, body uses Satoshi, ivory background, ink text, grain overlay (tiny SVG noise as fixed pseudo-element, opacity ~0.06, pointer-events none), selection colour ember, focus-visible ring arcane, reduced-motion media query that kills transitions longer than 0.2s.
5. A dev-only /styleguide route that shows every colour swatch, type size, easing (animated demo boxes) so I can review the system.
Do not commit. Finish with the review message.
```
**Verify:** `/styleguide` shows the palette, fonts and 4 easing demos; grain is subtle.
**Commit:** `feat(design): add design tokens, typography, easings and global styles`

---

#### Prompt 1.3 — Smooth scroll + GSAP core
```
Read CLAUDE.md and docs/BUILD_PLAN.md section 1.5.

Build the scroll/motion foundation:
- src/components/motion/SmoothScroll.tsx: client component that creates one Lenis instance (lerp 0.1, smoothWheel true, syncTouch false), drives it from gsap.ticker (lagSmoothing 0), calls ScrollTrigger.update on scroll, exposes the instance via a zustand store (src/store/scroll.ts) with scroll progress 0–1 and velocity. Disabled under prefers-reduced-motion.
- src/lib/motion/gsap.ts: registers ScrollTrigger + SplitText once, sets gsap defaults (ease from EASE.main, duration 1.2).
- Html gets classes "lenis lenis-smooth" like a standard Lenis setup.
- Hook useLenisScrollTo() for anchor/menu navigation.
- Wire SmoothScroll into src/app/layout.tsx.
- Temporary test: make the home page 5 screens tall with numbered sections to feel the scroll.
Do not commit. Finish with the review message.
```
**Verify:** scroll feels buttery, not floaty; trackpad and mouse wheel both smooth; reduced-motion turns it off.
**Commit:** `feat(motion): add Lenis smooth scroll synced with GSAP ScrollTrigger`

---

#### Prompt 1.4 — Text animation components
```
Read CLAUDE.md and docs/BUILD_PLAN.md section 1.5 (line-mask reveal + scroll character fill).

Create two reusable, accessible components in src/components/motion:

1. <RevealLines as="p|h1|h2|h3" delay? trigger="inview|mount">
   - Uses GSAP SplitText (type: lines, mask: lines) or a manual splitter if needed.
   - Each line is wrapped in a mask with overflow: clip; the inner line animates yPercent 110 → 0, stagger 0.08, duration 1.2, EASE.main.
   - Original element keeps aria-label with full text; generated lines are aria-hidden.
   - Re-splits on resize (debounced) without replaying the animation if already revealed.

2. <ScrollFillText text="…" as="h2">
   - Renders two stacked layers of the same text split into chars inside line spans:
     base layer: every char opacity 0.15; reveal layer (aria-hidden): every char opacity 0.
   - ScrollTrigger scrub: reveal chars go 0 → 1 one after another across the element's scroll range (start "top 80%", end "bottom 30%").
   - Display font, uppercase, huge fluid size, tight line-height (~0.8).
   - Reduced motion: show fully filled.

Also add <FadeIn> (opacity + 24px y) for small UI.
Demo all three on the temporary home page.
Do not commit. Finish with the review message.
```
**Verify:** lines slide up from behind an invisible edge; the big text "writes itself" as you scroll, and reverses when you scroll back.
**Commit:** `feat(motion): add line-mask reveal and scroll character-fill text components`

---

#### Prompt 1.5 — Layout shell: header, menu, cursor pill, sound button
```
Read CLAUDE.md and docs/BUILD_PLAN.md sections 1.5 and 1.9.

Build the persistent UI shell:
- <Header>: left "Rachit Mittal", centre-left "Full-stack developer, AI engineer", right nav Work / About / Playground + menu button. Small Satoshi text, mix-blend or colour switch per scene via a data-theme attribute (light/dark).
- <MenuOverlay>: full-screen menu opened by the button; links revealed with RevealLines; closes on Esc; focus trapped.
- <CursorPill>: fixed, pointer-events none, follows mouse with gsap.quickTo (0.35s, EASE.main), anchored bottom-left of the cursor, scale 0 → 1 when hovering any element with data-cursor="text"; shows that text (supports "Click — feed the dragon" style with an em-dash separator). Hidden on touch devices.
- <SoundButton>: 4 vertical bars; when playing they bounce (GSAP, random heights, staggered, looping); when muted scaleY 0.1. Wire to src/store/sound.ts (enabled, muted). Before the first user click, body has class awaiting-sound-click and a yellow-ember pill "CLICK — TO ENABLE SOUND" floats bottom-right; first click anywhere enables audio.
- src/lib/audio/sound.ts: Howler manager with channels music / sfx, fade in/out helpers, and graceful no-op if files are missing (log once in dev).
Do not commit. Finish with the review message.
```
**Verify:** cursor pill appears only on tagged elements; sound bars animate on toggle; menu is keyboard accessible.
**Commit:** `feat(ui): add header, menu overlay, cursor pill and sound controls`

---

### PHASE 2 — WebGL core & art style

#### Prompt 2.1 — Canvas, scene manager, scroll-driven camera
```
Read CLAUDE.md and docs/BUILD_PLAN.md sections 1.2, 1.5, 1.9.

Set up the 3D architecture:
- <WorldCanvas>: one fixed full-screen R3F Canvas behind the DOM (z-index canvas layer), dpr [1, 2] capped by device tier, antialias, tone mapping ACES, sRGB output. Lives in the root layout so it persists across routes.
- src/lib/three/sceneRegistry.ts: each scene registers {id, component, cameraPath, scrollRange}. Home registers Altar, ThroneRoom, Armoury, Balcony.
- Camera rig: camera follows a CatmullRom path per scene; position/lookAt driven by the scroll store progress (smoothed with damp). Mouse adds ±2° parallax sway. Between scenes, a "cloud wipe" transition (full-screen shader plane that dissolves via noise) hides the swap.
- Device tier detection (src/lib/three/tier.ts): high / mid / low from GPU + memory + mobile; low = static poster images instead of the canvas.
- Dev-only r3f-perf / stats overlay toggled by pressing P.
- Placeholder: each scene = a coloured box + label so I can scroll through the flow.
Do not commit. Finish with the review message.
```
**Verify:** scrolling moves the camera smoothly through 4 placeholder scenes with cloud-wipe transitions; P shows FPS.
**Commit:** `feat(three): add persistent WebGL canvas, scene registry and scroll-driven camera rig`

---

#### Prompt 2.2 — Painted clay anime toon shader + ModelSlot
```
Read CLAUDE.md and docs/BUILD_PLAN.md sections 1.2, 1.3, 1.7.

1. src/lib/three/materials/ToonClayMaterial.ts: custom shader material (or onBeforeCompile on MeshStandardMaterial) with:
   - 3-step soft gradient ramp driven by a 1D ramp texture (light/mid/shadow, soft edges, not hard cel),
   - subtle painterly noise breakup in the shadows,
   - fresnel rim light (colour + strength uniforms),
   - optional emissive mask (for runes / gem core),
   - receives shadows.
   Export presets: stone, ivory, moss, metalMatte, cloth, dragonScale, ember.
2. Outline pass for characters only: inverted-hull outline component <SoftOutline color thickness>.
3. <ModelSlot name placeholder={<Jsx/>} />: tries useGLTF(`/models/${name}.glb`) (Draco + Meshopt decoders configured), applies ToonClay presets by material name convention (e.g. "stone_", "ivory_"), else renders the placeholder. Suspense-safe.
4. Post-processing stack: selective bloom (only emissive), soft vignette, very light noise. Tier-aware (off on low).
5. Lighting helper <GoldenHour/>: warm directional key with soft shadows, cool hemisphere fill, fog tinted sky-200.
6. Update /styleguide with a 3D material gallery (spheres + a test rounded box for every preset).
Do not commit. Finish with the review message.
```
**Verify:** material gallery looks soft, matte and painted, not plastic; rim light reads; outlines are thin and coloured.
**Commit:** `feat(three): add painted-clay toon material, outlines, ModelSlot and post-processing`

---

#### Prompt 2.3 — Anime sky & clouds system
```
Read CLAUDE.md and docs/BUILD_PLAN.md section 1.2.

Build reusable sky + cloud components used by every outdoor scene:
- <PaintedSky>: large inverted sphere with a vertical gradient shader (sky-400 → sky-200 → warm horizon), sun glow, time-of-day uniform (dawn / noon / sunset) for the Balcony later.
- <CloudBank>: puffy cumulus built from instanced soft spheres merged into clusters, shaded with ToonClay "ivory" + strong soft rim, slow drift (configurable wind), gentle breathing scale. Layers: far / mid / near for parallax. Must be able to hide objects (occlusion) — needed for the dragon later.
- <GodRays>: gradient-textured additive planes for light shafts, animated slowly.
- <Mountains>: stylized low-poly ridges (procedural noise mesh) in moss tones with fog.
Showcase on a dev route /lab/sky with controls (leva, dev only) for wind, time of day, density.
Do not commit. Finish with the review message.
```
**Verify:** `/lab/sky` looks like a painted anime sky with soft drifting clouds; runs at 60fps.
**Commit:** `feat(three): add painted sky, cloud banks, god rays and stylized mountains`

---

### PHASE 3 — The Gem Loader

#### Prompt 3.1 — Mythical gem + loading sequence
```
Read CLAUDE.md and docs/BUILD_PLAN.md sections 1.5 and 1.9.

Build the loader shown on first visit:
- Background night-900, full screen, above everything (loader z-layer).
- Centre: a small (≈160px) 3D mythical gem in its own tiny R3F canvas: elongated hexagonal bipyramid, flatShading facets, MeshPhysicalMaterial with transmission + thickness + iridescence, arcane-400 core glow (inner emissive mesh), slow spin + bob, rim light sweeping across facets.
- Progress: a glowing band rises inside the gem proportional to real asset loading progress (drei useProgress + font loading + audio preload). Never jumps backwards; min duration 1.8s so it doesn't flash.
- Text: "Rachit Mittal" / "Full-stack developer, AI engineer" enter with RevealLines. Bottom: small spinning gem icon (SVG) + status "Forging the world…" (then "Tempering…" at 70%, "Ready" at 100%).
- Exit at 100%: gem pulses bright (bloom spike), shatters into 6–8 shards that fly outward and fade, loader fades (0.8s EASE.expo), world canvas fades in, header reveals.
- Only full sequence on first visit per session (sessionStorage, try/catch); later route changes use a quick 0.6s version.
- Reduced motion: static gem image + fade.
- Sound: soft crystalline chime on exit (if enabled).
Do not commit. Finish with the review message.
```
**Verify:** reload the page → gem spins, fills, shatters, world fades in. Feels premium and never stutters.
**Commit:** `feat(loader): add 3D mythical gem loader with real progress and shatter exit`

---

### PHASE 4 — Home scenes

#### Prompt 4.1 — Scene 1: The Altar above the clouds (hero)
```
Read CLAUDE.md and docs/BUILD_PLAN.md sections 1.1, 1.2, 1.9.

Build the hero scene (placeholders via ModelSlot):
- An open-air stone sanctuary floating above the clouds: arched stone colonnade left and right (like tall arched windows opening to sky), polished stone floor, stone altar centre with a low-poly rock base.
- The Sword ("sword" slot): large, resting point-down into the altar, ivory/stone blade with 4 rune grooves (emissive mask, off at start), wrapped grip, simple crossguard. Placeholder built from primitives but proportioned beautifully.
- Props on side pedestals: a closed book, a floating crystal, a small anvil.
- CloudBank below and beyond, PaintedSky, GoldenHour light.
- Idle life: sword hovers 2cm up/down, dust motes floating in light shafts, clouds drift, faint camera breathing.
- DOM overlay bottom-left: RevealLines "Forged in code. / Tempered by AI." + small "Scroll down" with animated line.
- Cursor pill over the sword: "Scroll — to forge".
Do not commit. Finish with the review message.
```
**Verify:** first screen after the loader feels like a calm, beautiful painted-clay shrine; text is crisp.
**Commit:** `feat(home): build Altar hero scene with sword, sanctuary and idle ambience`

---

#### Prompt 4.2 — Scene 2: The Throne Room (statement)
```
Read CLAUDE.md and docs/BUILD_PLAN.md sections 1.2, 1.5.

- Camera flies from the altar through a stone archway (cloud-wipe) into the castle throne room.
- Room: tall stained-glass window behind an empty throne on 3 steps; glass pattern = abstract circuit / neural-network lines in ember, arcane and deep blue (emissive, original design). Coloured god-rays fall across the floor leaving tinted light pools. Banners on pillars, candle stands with flickering light.
- A knight kneels centre-left, head bowed (placeholder: rounded armour primitives with SoftOutline). Only micro-motion: breathing.
- DOM: <ScrollFillText> "BUILDING SYSTEMS THAT THINK AND SCALE." over the scene (dark-theme header).
- Camera slow dolly toward the throne while the text fills.
- Sound hooks: soft choir pad layer fades in (music channel), distant echo.
Do not commit. Finish with the review message.
```
**Verify:** scroll → text fills letter by letter while the camera glides; stained-glass light looks gorgeous.
**Commit:** `feat(home): build Throne Room scene with stained-glass light and scroll-filled statement`

---

#### Prompt 4.3 — Content model for projects
```
Read CLAUDE.md and docs/BUILD_PLAN.md section 1.8.

Create src/content/projects.ts with a strict TypeScript type Project { slug, title, rune (name + glyph id), year, role, oneLiner, problem, approach, architecture: {nodes, edges} for a diagram, stack[], results[], links {live?, github?, demoVideo?}, colorAccent }.
Fill it for Trident Oracle, RagForge, QuantForge, CareerLens using placeholders marked TODO where you don't know facts — ask me for the real details in your final message (list the questions per project).
Create 4 original rune glyphs as SVG paths in src/content/runes.ts (simple, angular, readable at small size).
Do not commit. Finish with the review message.
```
**Verify:** types compile; you answer Claude's questions about each project in the next message and let it fill them in (then commit).
**Commit:** `feat(content): add typed project data and original rune glyphs`

---

#### Prompt 4.4 — Scene 3: The Armoury (projects + rune forging)
```
Read CLAUDE.md and docs/BUILD_PLAN.md sections 1.1, 1.5.

- The camera moves into a forge/armoury: anvil, glowing forge mouth, weapon racks, hanging chains; the sword now lies on the anvil.
- Pinned section (ScrollTrigger pin) with 4 project chapters. For each chapter:
  - Big project title via RevealLines, oneLiner, stack chips, year, "View case study →" link (cursor pill "Open — case study").
  - As the chapter completes, a hammer strike (sparks particle burst + metallic sfx) and that project's rune lights up on the blade (emissive mask + bloom), rune glyph also drawn in SVG next to the text.
- A rune progress indicator (4 small glyphs) fixed at the side during the pinned section.
- Store forged runes in src/store/forge.ts (persist per session).
Do not commit. Finish with the review message.
```
**Verify:** 4 chapters scroll in; each ends with sparks and a rune lighting on the blade.
**Commit:** `feat(home): build Armoury projects section with rune forging on scroll`

---

#### Prompt 4.5 — Scene 4: The Balcony at sunset (contact) + footer
```
Read CLAUDE.md and docs/BUILD_PLAN.md sections 1.2, 1.9.

- Camera exits onto a castle balcony at sunset (PaintedSky time = sunset, warm clouds, long shadows). The finished sword (all runes lit) is planted in the balcony stone.
- DOM: ScrollFillText "THE QUEST ISN'T OVER. JOIN THE NEXT ONE." then contact block: email (copy-to-clipboard with toast), GitHub, LinkedIn, resume PDF link. Big magnetic "Say hello" button (subtle magnetic hover).
- Footer: © year, "About this portfolio" opens the popup (Prompt 8.3), back-to-top using Lenis.
Do not commit. Finish with the review message.
```
**Verify:** sunset ending feels like the story's finale; contact actions work.
**Commit:** `feat(home): build sunset Balcony contact scene and footer`

---

### PHASE 5 — The Dragon companion

#### Prompt 5.1 — Dragon state + follow system
```
Read CLAUDE.md and docs/BUILD_PLAN.md section 1.1.

- src/store/dragon.ts (zustand, session-persisted): hunger 0–6, embersEaten, stage (hatchling → young → awakened), muted, lastLine.
- <DragonCompanion>: fixed-position DOM layer (not WebGL) so it stays crisp. Uses a Rive file /rive/dragon.riv with state machine "Dragon" and inputs: fly(bool), eat(trigger), talk(bool), breathe(trigger), stage(number). If the .riv is missing, render an original SVG placeholder dragon (cute, round, small wings, ember belly, circuit-line wing pattern) animated with GSAP (bob, wing flap, blink).
- Follow behaviour: glides to anchor points per section (data-dragon-anchor on elements) with a lagging spring; idles with bob; looks toward cursor; perches on headings.
- Stays out of text: never overlaps elements marked data-dragon-avoid.
- Mobile: collapses into a 56px floating button bottom-left.
- Hide/mute toggle in the menu.
Do not commit. Finish with the review message.
```
**Verify:** the little dragon follows you through the sections, perches, never blocks text.
**Commit:** `feat(dragon): add dragon companion with state store, follow system and SVG fallback`

---

#### Prompt 5.2 — Speech bubbles + dialogue script
```
Read CLAUDE.md and docs/BUILD_PLAN.md section 1.1.

- src/content/dragonLines.ts: lines per section id and per stage, plus idle quips and reactions (fed, full, clicked many times). Tone: witty, warm, a little smug, short (≤ 90 chars). Write them yourself — examples of the voice:
  hero: "Oh. A visitor. Rachit said you'd come."
  throne: "He kneels to the craft, not the crown."
  armoury/ragforge: "This rune taught me to retrieve before I speak."
  armoury/quantforge: "I still don't trust the markets."
  balcony: "You made it to the end. Most people just skim."
- <SpeechBubble>: appears near the dragon, typewriter text (respect reduced motion), auto-hides after reading time, never covers content, one line per section visit.
- Sound: tiny chirp per bubble (sfx channel).
Do not commit. Finish with the review message.
```
**Verify:** each section triggers one fitting line; bubbles never feel spammy.
**Commit:** `feat(dragon): add speech bubbles and dialogue script`

---

#### Prompt 5.3 — Embers & feeding loop
```
Read CLAUDE.md and docs/BUILD_PLAN.md section 1.1.

- <Ember>: small glowing collectible (DOM + CSS glow, subtle flicker), one hidden per section (6 total across Home + About), placed via data attributes in content. Cursor pill "Click — feed the dragon".
- Click: ember flies along a curved path to the dragon's mouth (GSAP motion path), dragon eat animation, hunger +1, a small HUD "Embers 3/6" (top-right under nav) updates with a spring.
- Stage changes: at 3 → "young" (bigger, new line); at 6 → "awakened": dragon breathes fire across the screen (canvas particle burst), line "Fine. Ask me anything about him." and the Ask the Dragon chat unlocks (Phase 9). Also unlock via menu for recruiters in a hurry ("Skip — wake the dragon").
- Persist per session.
Do not commit. Finish with the review message.
```
**Verify:** finding all embers grows the dragon and triggers the fire-breath moment.
**Commit:** `feat(dragon): add ember collectibles, feeding loop and awakening moment`

---

### PHASE 6 — Case study pages

#### Prompt 6.1 — /work/[slug]
```
Read CLAUDE.md and docs/BUILD_PLAN.md sections 1.5, 1.9.

- Static generation for each project in src/content/projects.ts.
- Layout: hero with giant title (RevealLines), rune glyph, year/role/stack meta row; demo video block (lazy, muted autoplay loop, poster image); Problem / Approach / Results sections with line reveals; results as big numbers that count up.
- <ArchitectureDiagram>: SVG nodes/edges from project.architecture; edges draw themselves on scroll (stroke-dashoffset scrub), nodes fade/scale in; accessible labels.
- Page transition from Armoury: the rune glyph morphs/scales into the case-study header (shared element feel via GSAP Flip), cloud-wipe for the canvas.
- Next project link at the bottom with ScrollFillText.
- WebGL scene here is minimal: soft forge glow background only (or none) to keep reading focused.
Do not commit. Finish with the review message.
```
**Verify:** each case study reads like a clean article; diagram draws as you scroll.
**Commit:** `feat(work): add case study pages with self-drawing architecture diagrams`

---

### PHASE 7 — About page

#### Prompt 7.1 — The Encounter
```
Read CLAUDE.md and docs/BUILD_PLAN.md sections 1.1, 1.2.

/about opening scene:
- Over-the-shoulder low camera behind a knight standing on a stone cliff rampart (crenellated wall, torch stand, broken pillar), holding the finished sword angled down. Cape moves in wind (vertex shader wave).
- Below: stylized mountains, pine forest (instanced toon trees, 2 species), reflective lake with shimmer, distant castle tower on a peak.
- Sky: CloudBank; the colossal dragon ("dragon_colossal" slot) emerges from clouds facing the knight — only head/neck, one wing tip, a tail curve visible; rest occluded by clouds. Placeholder built from primitives + outline, ember-belly, circuit wing lines.
- Life: dragon hover rises/falls (sine), steam puffs from nostrils every 4–6s (sprite particles), occasional blink, head subtly tracks the cursor; clouds drift; 2–3 distant birds; camera ±2° mouse sway.
- DOM bottom-left: RevealLines "I'm Rachit — a full-stack developer who builds with AI. / I face hard problems head on." + "Scroll to know me".
- Sound: wind bed + low dragon breath synced to steam.
- If the small companion reached "awakened", it says: "Yes. That one's me. Don't stare."
Do not commit. Finish with the review message.
```
**Verify:** the reveal is cinematic yet calm; dragon feels alive with small motions only.
**Commit:** `feat(about): build The Encounter scene with colossal dragon in the clouds`

---

#### Prompt 7.2 — The Road & the Bounty Board
```
Read CLAUDE.md and docs/BUILD_PLAN.md section 1.8.

- src/content/bounties.ts: type Bounty { id, status: 'wanted'|'claimed', title, org, period, summary, reward, tags[], details (markdown string), links[] }. Pre-fill from section 1.8 with TODOs and ask me for the facts.
- 3D: a winding dirt path through pines at golden hour; wooden bounty board with a small roof and a hanging lantern (flicker); a signpost whose arrows are real links (Projects →, Playground →, Dragon's Peak → chat); the colossal dragon circling a far peak.
- Posters are HTML pinned to the board with drei <Html transform occlude> on desktop: parchment texture, clip-path torn edges, Cinzel "WANTED"/"CLAIMED", red wax "CLAIMED" stamp that slams in on first view (scale 1.6 → 1, slight rotate, thud sfx), corners flutter.
- Hover: poster lifts + tilts to cursor; click: poster unpins and flies to centre as a large readable card (focus-trapped dialog) with full details.
- Header counter like "● Bounties claimed: 6".
- Mobile: static rendered background + vertical swipeable poster stack.
Do not commit. Finish with the review message.
```
**Verify:** posters are readable and selectable; stamps feel punchy; mobile stack works.
**Commit:** `feat(about): build the Road scene with interactive bounty board achievements`

---

#### Prompt 7.3 — Stack & closing of About
```
Read CLAUDE.md and docs/BUILD_PLAN.md section 1.5.

- "The Arsenal": skills grouped (Frontend, Backend, AI/ML, Data, DevOps) as an inventory grid of item slots; each item has an original simple icon, name, and a proficiency shown as 1–3 small gems; hover shows a tooltip with where you used it (links to projects).
- Education & a short personal paragraph (RevealLines).
- CTA ScrollFillText "READY FOR THE NEXT QUEST?" → contact.
Do not commit. Finish with the review message.
```
**Verify:** About page flows Encounter → Road → Arsenal → CTA without jank.
**Commit:** `feat(about): add arsenal skills inventory and closing call to action`

---

### PHASE 8 — Playground: The Dragon's Hoard

#### Prompt 8.1 — Hoard hero + coin physics
```
Read CLAUDE.md and docs/BUILD_PLAN.md section 1.9.

/playground:
- Tone shift: flat, bold page in ember-500 background with ink text, no 3D world (canvas hidden via scene registry).
- Intro paragraph (RevealLines) centred top; giant display heading "WELCOME TO THE DRAGON'S HOARD" + "(Click to feed the dragon)".
- matter-js world over the hero: each click spawns 3–5 gold coins / embers (DOM or 2D canvas sprites with toon look) that fall, bounce, pile at the bottom; walls = viewport; cap at 120 bodies (oldest fade out).
- The companion swoops to embers and eats them; every 10 eaten → small fire puff that scatters coins (radial impulse) and a line; after 30 → "Fine. Take a treasure." and it scrolls/highlights a random gallery item.
- Sfx: coin clinks (pooled, pitch variance), fire whoosh; upbeat variation music track.
Do not commit. Finish with the review message.
```
**Verify:** clicking feels playful and physical; performance stays smooth with many coins.
**Commit:** `feat(playground): add Dragon's Hoard hero with coin physics and feeding`

---

#### Prompt 8.2 — Experiments gallery + live relic
```
Read CLAUDE.md and docs/BUILD_PLAN.md section 1.9.

- src/content/experiments.ts: { title, year, tag, media (video/image), link? }. Seed with 8 TODO items (I'll supply recordings).
- Gallery: large cards in an editorial rhythm (alternating full-width / two-up), lazy videos that play only in view, title + year + tag under each; hover glint (gold sheen sweep) and slight tilt.
- One "Live Relic" card = a working mini AI demo embedded: "Rune Namer" — user types a short phrase, it calls /api/relic (Groq, tiny prompt, rate-limited) and returns a fantasy rune name + one-line meaning, rendered with the rune glyph style. Graceful fallback if API key missing.
Do not commit. Finish with the review message.
```
**Verify:** gallery loads fast; the live relic returns results.
**Commit:** `feat(playground): add experiments gallery and live AI relic demo`

---

#### Prompt 8.3 — Footer + "About this portfolio" popup
```
Read CLAUDE.md and docs/BUILD_PLAN.md section 1.5 (popup unmask).

- Playground footer: ScrollFillText "THE QUEST ISN'T OVER. JOIN THE NEXT ONE." + contact links.
- <Popup> component with the double-wrapper unmask (outer slides in from bottom, inner counter-slides), Esc/overlay close, focus trap, used for "About this portfolio".
- Popup content: credits, the story of the sword / knight / dragon symbolism, stack used, and "Motion language inspired by the Awwwards community" (no copied text).
Do not commit. Finish with the review message.
```
**Verify:** popup animation feels like a mask opening; accessible.
**Commit:** `feat(ui): add unmasking popup and About-this-portfolio credits`

---

### PHASE 9 — "Ask the Dragon" (AI)

#### Prompt 9.1 — Knowledge base + build-time embeddings
```
Read CLAUDE.md and docs/BUILD_PLAN.md section 1.6.

- docs/knowledge/*.md: create a template set (about.md, projects/<slug>.md, experience.md, skills.md, faq.md) generated from src/content + TODO blanks for me to enrich.
- scripts/build-embeddings.ts: chunk markdown (≈400 tokens, 60 overlap, keep headings as metadata), embed with @xenova/transformers all-MiniLM-L6-v2, write public-safe src/lib/ai/index.json (vectors + text + source). Add "prebuild" npm script.
- src/lib/ai/search.ts: cosine top-k with a minimum score threshold.
- Vitest tests for chunker and search.
Do not commit. Finish with the review message.
```
**Verify:** `npm run build` produces the index; tests pass.
**Commit:** `feat(ai): add knowledge base and build-time embedding index`

---

#### Prompt 9.2 — Chat API + dragon chat UI
```
Read CLAUDE.md and docs/BUILD_PLAN.md sections 1.1, 1.6.

- app/api/ask/route.ts (Edge or Node): validate input (zod, max 500 chars), rate limit per IP (in-memory + header-based, simple), embed query, retrieve top 5, call Groq llama-3.3-70b-versatile with a system prompt: answer ONLY from context about Rachit, in the dragon's witty voice but factual, cite sources as [project name], say "That scroll isn't in my hoard" when unknown. Stream the response.
- GROQ_API_KEY in .env.local (add .env.example). Never expose it client-side.
- <AskTheDragon> panel: opens from the dragon (after awakening) or menu; parchment-dark panel, streaming text, source chips linking to case studies, 3 suggested questions, keyboard accessible, mobile full-screen sheet.
- Friendly error states (rate limited, offline).
Do not commit. Finish with the review message.
```
**Verify:** ask "What did Rachit build at Doritech?" → correct, cited, in the dragon's voice.
**Commit:** `feat(ai): add streaming Ask-the-Dragon chat grounded in portfolio knowledge`

---

### PHASE 10 — Sound design

#### Prompt 10.1 — Soundscape
```
Read CLAUDE.md and docs/BUILD_PLAN.md section 1.5.

- public/audio manifest in src/lib/audio/manifest.ts: music_main (ambient fantasy loop), music_playground (upbeat variant), amb_wind, amb_forge, sfx_chime, sfx_hammer, sfx_rune, sfx_stamp, sfx_paper, sfx_coin_[1-4], sfx_whoosh, sfx_dragon_breath, sfx_chirp, sfx_ui_hover, sfx_ui_click.
- Scene-aware mixer: crossfade music/ambience layers by active scene (volumes per scene defined in one table).
- All sounds lazy-load after the loader; total initial audio ≤ 300KB.
- Write docs/AUDIO_SOURCES.md listing where I can get royalty-free versions of each (Pixabay, Uppbeat, Freesound CC0) with search terms and required length — do not download copyrighted material.
Do not commit. Finish with the review message.
```
**Verify:** with sound on, each scene has its own atmosphere and transitions smoothly.
**Commit:** `feat(audio): add scene-aware soundscape mixer and audio manifest`

---

### PHASE 11 — Real 3D assets (swap placeholders)

#### Prompt 11.1 — Asset spec sheet
```
Read CLAUDE.md and docs/BUILD_PLAN.md sections 1.2, 1.7.

Write docs/ASSET_SPEC.md: for every ModelSlot used (sword, altar, sanctuary, throne_room, knight_kneel, knight_stand, armoury, balcony, cliff_rampart, dragon_colossal, bounty_board, signpost, props): purpose, camera distance, max triangles, texture size, material naming convention (stone_, ivory_, moss_, metal_, cloth_, scale_, emissive_), required pivot/scale/orientation, bones/animations needed, Blender bake instructions (lightmap UV2, AO bake), export settings (glTF binary, Draco/Meshopt, no cameras/lights), and a validation checklist. Also add scripts/optimize-models.sh using gltf-transform (resize textures to KTX2, meshopt).
Do not commit. Finish with the review message.
```
**Verify:** spec is clear enough to hand to a 3D artist or follow in Blender yourself.
**Commit:** `docs(assets): add 3D asset specification and model optimization script`

#### Prompt 11.2 — (repeat per model as they arrive)
```
Read CLAUDE.md and docs/ASSET_SPEC.md.
I added public/models/<name>.glb. Validate it against the spec (triangles, materials, scale, pivot), run the optimize script, wire any animations, adjust camera framing/lighting in the scene if needed, and remove the placeholder only if the model passes. Report anything that doesn't match the spec.
Do not commit. Finish with the review message.
```
**Commit:** `feat(assets): replace <name> placeholder with final model`

---

### PHASE 12 — Polish, performance, launch

#### Prompt 12.1 — Performance & mobile pass
```
Read CLAUDE.md.
Audit and fix: bundle size (dynamic import three scenes per route, matter-js only on /playground), texture/model lazy loading per scene, frameloop="demand" where possible, pause rendering when tab hidden or canvas off-screen, device tiers verified, mobile fallbacks (poster images/looping videos) for all scenes, CLS 0, LCP < 2.5s on 4G mid phone emulation. Report before/after numbers.
Do not commit. Finish with the review message.
```
**Commit:** `perf: optimize loading, rendering and mobile fallbacks`

#### Prompt 12.2 — Accessibility & SEO
```
Read CLAUDE.md.
Full pass: semantic landmarks, headings order, skip link, keyboard paths for every interaction (embers, posters, chat), visible focus, reduced-motion audit, colour contrast AA, alt text, aria-live for chat. SEO: metadata per route, Open Graph images (generated with next/og in the site style), sitemap, robots, JSON-LD Person schema. A "Recruiter mode" link in the menu: a fast, text-only single page with everything (resume summary, projects, contact).
Do not commit. Finish with the review message.
```
**Commit:** `feat(a11y,seo): add accessibility pass, SEO metadata and recruiter mode`

#### Prompt 12.3 — Tests & CI
```
Read CLAUDE.md.
Add Playwright smoke tests (home loads past loader, nav works, poster dialog opens, chat returns a response with mocked API, recruiter mode renders), Vitest for stores, GitHub Actions workflow: install, lint, typecheck, test, build; Lighthouse CI budget (perf ≥ 85 desktop, a11y ≥ 95).
Do not commit. Finish with the review message.
```
**Commit:** `ci: add Playwright smoke tests, unit tests and Lighthouse CI workflow`

#### Prompt 12.4 — Deploy
```
Read CLAUDE.md.
Prepare for Vercel: env var documentation, caching headers for /models /audio /fonts (immutable), analytics (Vercel Analytics), custom 404 page in the world's style ("This path isn't on the map" with the dragon), final README with screenshots section, architecture overview and credits. List the exact steps for me to deploy — do not deploy or push yourself.
Do not commit. Finish with the review message.
```
**Commit:** `chore(release): prepare production deployment and final documentation`

---

## 4. Commit cheat-sheet (in order)

| # | Commit message |
|---|---|
| 1.1 | `chore: scaffold Next.js 15 project with 3D, motion and audio dependencies` |
| 1.2 | `feat(design): add design tokens, typography, easings and global styles` |
| 1.3 | `feat(motion): add Lenis smooth scroll synced with GSAP ScrollTrigger` |
| 1.4 | `feat(motion): add line-mask reveal and scroll character-fill text components` |
| 1.5 | `feat(ui): add header, menu overlay, cursor pill and sound controls` |
| 2.1 | `feat(three): add persistent WebGL canvas, scene registry and scroll-driven camera rig` |
| 2.2 | `feat(three): add painted-clay toon material, outlines, ModelSlot and post-processing` |
| 2.3 | `feat(three): add painted sky, cloud banks, god rays and stylized mountains` |
| 3.1 | `feat(loader): add 3D mythical gem loader with real progress and shatter exit` |
| 4.1 | `feat(home): build Altar hero scene with sword, sanctuary and idle ambience` |
| 4.2 | `feat(home): build Throne Room scene with stained-glass light and scroll-filled statement` |
| 4.3 | `feat(content): add typed project data and original rune glyphs` |
| 4.4 | `feat(home): build Armoury projects section with rune forging on scroll` |
| 4.5 | `feat(home): build sunset Balcony contact scene and footer` |
| 5.1 | `feat(dragon): add dragon companion with state store, follow system and SVG fallback` |
| 5.2 | `feat(dragon): add speech bubbles and dialogue script` |
| 5.3 | `feat(dragon): add ember collectibles, feeding loop and awakening moment` |
| 6.1 | `feat(work): add case study pages with self-drawing architecture diagrams` |
| 7.1 | `feat(about): build The Encounter scene with colossal dragon in the clouds` |
| 7.2 | `feat(about): build the Road scene with interactive bounty board achievements` |
| 7.3 | `feat(about): add arsenal skills inventory and closing call to action` |
| 8.1 | `feat(playground): add Dragon's Hoard hero with coin physics and feeding` |
| 8.2 | `feat(playground): add experiments gallery and live AI relic demo` |
| 8.3 | `feat(ui): add unmasking popup and About-this-portfolio credits` |
| 9.1 | `feat(ai): add knowledge base and build-time embedding index` |
| 9.2 | `feat(ai): add streaming Ask-the-Dragon chat grounded in portfolio knowledge` |
| 10.1 | `feat(audio): add scene-aware soundscape mixer and audio manifest` |
| 11.1 | `docs(assets): add 3D asset specification and model optimization script` |
| 11.2 | `feat(assets): replace <name> placeholder with final model` (repeat) |
| 12.1 | `perf: optimize loading, rendering and mobile fallbacks` |
| 12.2 | `feat(a11y,seo): add accessibility pass, SEO metadata and recruiter mode` |
| 12.3 | `ci: add Playwright smoke tests, unit tests and Lighthouse CI workflow` |
| 12.4 | `chore(release): prepare production deployment and final documentation` |

**If Claude Code ever tries to commit:** press Esc to reject the tool call and say "Remember CLAUDE.md git rules." You can also add a hard block in `.claude/settings.json`:
```json
{ "permissions": { "deny": ["Bash(git commit:*)", "Bash(git push:*)", "Bash(git reset:*)", "Bash(git rebase:*)"] } }
```
