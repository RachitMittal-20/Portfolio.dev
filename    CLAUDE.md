CLAUDE.md — The Forge portfolio

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
