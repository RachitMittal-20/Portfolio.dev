# The Forge

A cinematic, scroll-driven 3D portfolio for Rachit Mittal — full-stack developer building with AI.

## Stack

- **Framework:** Next.js 15 (App Router), TypeScript (strict)
- **Styling:** CSS Modules + CSS variables (no Tailwind)
- **3D:** three, @react-three/fiber, @react-three/drei, @react-three/postprocessing
- **Motion:** gsap (ScrollTrigger, SplitText), lenis
- **Characters:** @rive-app/react-canvas
- **Physics:** matter-js
- **State:** zustand
- **Sound:** howler

See [docs/BUILD_PLAN.md](docs/BUILD_PLAN.md) for the full build plan and creative direction.

## Run

```bash
npm install
npm run dev        # start the dev server
npm run build      # production build
npm run start      # run the production build
npm run lint        # eslint
npm run typecheck  # tsc --noEmit
npm run format      # prettier --write .
```
