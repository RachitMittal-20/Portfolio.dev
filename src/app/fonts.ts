// Self-hosted local fonts (see docs/BUILD_PLAN.md section 1.4). Files live in
// public/fonts — never fetched from Fontshare/Google at runtime.
import localFont from "next/font/local";

// Display font for big uppercase statements (hero lines, scroll-fill headings).
export const clashDisplay = localFont({
  src: [
    { path: "../../public/fonts/ClashDisplay-Medium.woff2", weight: "500", style: "normal" },
    { path: "../../public/fonts/ClashDisplay-Semibold.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-display",
  display: "swap",
});

// Body / UI grotesk.
export const satoshi = localFont({
  src: [
    { path: "../../public/fonts/Satoshi-Regular.woff2", weight: "400", style: "normal" },
    { path: "../../public/fonts/Satoshi-Medium.woff2", weight: "500", style: "normal" },
    { path: "../../public/fonts/Satoshi-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-body",
  display: "swap",
});

// Parchment "WANTED" poster headers only.
export const cinzel = localFont({
  src: [{ path: "../../public/fonts/Cinzel-SemiBold.woff2", weight: "600", style: "normal" }],
  variable: "--font-parchment",
  display: "swap",
});
