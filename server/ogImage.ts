import { Router } from "express";
import { getAgentBySlug } from "./db";
import { getDemoAgent } from "../client/src/data/demoAgents";

/**
 * Dynamic OG Image endpoint — generates a branded 1200×630 social sharing card
 * as SVG for each agent. This is referenced by og:image meta tags.
 *
 * WhatsApp, Facebook, Twitter, LinkedIn, iMessage, WeChat all use og:image
 * to render rich link previews.
 * 
 * SVG is used because:
 * - Zero native dependencies (no canvas/sharp)
 * - Fast to generate server-side
 * - Most platforms accept SVG or auto-rasterize it
 * - For platforms that don't support SVG, we output PNG via resvg (optional)
 */

type AgentOGData = {
  name: string;
  title?: string | null;
  brokerage?: string | null;
  photoUrl?: string | null;
  serviceAreas?: unknown;
  yearsExperience?: number | null;
};

// Color schemes matching the app's theme
const COLOR_SCHEMES: Record<string, { primary: string; accent: string; bg: string; textDark: string }> = {
  gold: { primary: "#B8860B", accent: "#DAA520", bg: "#FFFDF5", textDark: "#2D2006" },
  navy: { primary: "#1B3A5C", accent: "#2C5F8A", bg: "#F5F8FC", textDark: "#0A1929" },
  emerald: { primary: "#065F46", accent: "#059669", bg: "#F0FDF4", textDark: "#022C22" },
  burgundy: { primary: "#7F1D1D", accent: "#991B1B", bg: "#FFF5F5", textDark: "#450A0A" },
  slate: { primary: "#334155", accent: "#475569", bg: "#F8FAFC", textDark: "#0F172A" },
};

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function generateOGImageSVG(agent: AgentOGData, colorScheme: string = "gold"): string {
  const colors = COLOR_SCHEMES[colorScheme] || COLOR_SCHEMES.gold;
  const areas = ((agent.serviceAreas ?? []) as string[]).slice(0, 3).join(" · ");
  const name = escapeXml(agent.name);
  const title = escapeXml(agent.title || "Real Estate Agent");
  const brokerage = escapeXml(agent.brokerage || "");
  const years = agent.yearsExperience ? `${agent.yearsExperience}+ Years Experience` : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${colors.bg}"/>
      <stop offset="100%" style="stop-color:#FFFFFF"/>
    </linearGradient>
    <linearGradient id="accentGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:${colors.primary}"/>
      <stop offset="100%" style="stop-color:${colors.accent}"/>
    </linearGradient>
    <clipPath id="photoClip">
      <circle cx="200" cy="315" r="140"/>
    </clipPath>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bgGrad)"/>
  
  <!-- Accent bar left -->
  <rect x="0" y="0" width="8" height="630" fill="url(#accentGrad)"/>
  
  <!-- Top accent line -->
  <rect x="0" y="0" width="1200" height="4" fill="${colors.primary}"/>
  
  <!-- Bottom accent line -->
  <rect x="0" y="626" width="1200" height="4" fill="${colors.primary}"/>

  <!-- Photo circle background -->
  <circle cx="200" cy="315" r="145" fill="${colors.primary}" opacity="0.15"/>
  <circle cx="200" cy="315" r="140" fill="#E2E8F0"/>
  
  <!-- Photo placeholder icon (when no photo) -->
  <text x="200" y="330" text-anchor="middle" font-family="Arial, sans-serif" font-size="80" fill="${colors.primary}" opacity="0.6">👤</text>
  
  ${agent.photoUrl ? `<image href="${escapeXml(agent.photoUrl)}" x="60" y="175" width="280" height="280" clip-path="url(#photoClip)" preserveAspectRatio="xMidYMid slice"/>` : ""}

  <!-- Content area -->
  <!-- Name -->
  <text x="420" y="200" font-family="Georgia, 'Times New Roman', serif" font-size="52" font-weight="bold" fill="${colors.textDark}">
    ${name}
  </text>
  
  <!-- Title -->
  <text x="420" y="255" font-family="Arial, Helvetica, sans-serif" font-size="26" fill="${colors.primary}" text-transform="uppercase" letter-spacing="2">
    ${title}
  </text>
  
  <!-- Divider -->
  <rect x="420" y="280" width="80" height="3" fill="${colors.accent}" rx="1.5"/>
  
  <!-- Brokerage -->
  ${brokerage ? `<text x="420" y="330" font-family="Arial, Helvetica, sans-serif" font-size="22" fill="#64748B">${brokerage}</text>` : ""}
  
  <!-- Service Areas -->
  ${areas ? `
  <text x="420" y="380" font-family="Arial, Helvetica, sans-serif" font-size="18" fill="#94A3B8">📍</text>
  <text x="448" y="380" font-family="Arial, Helvetica, sans-serif" font-size="20" fill="#64748B">${escapeXml(areas)}</text>
  ` : ""}
  
  <!-- Years Experience -->
  ${years ? `
  <text x="420" y="420" font-family="Arial, Helvetica, sans-serif" font-size="18" fill="#94A3B8">⭐</text>
  <text x="448" y="420" font-family="Arial, Helvetica, sans-serif" font-size="20" fill="#64748B">${escapeXml(years)}</text>
  ` : ""}
  
  <!-- CTA -->
  <rect x="420" y="470" width="320" height="50" rx="25" fill="${colors.primary}"/>
  <text x="580" y="502" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="bold" fill="white" letter-spacing="1.5">
    VIEW PROFILE →
  </text>
  
  <!-- Powered by -->
  <text x="1160" y="600" text-anchor="end" font-family="Arial, Helvetica, sans-serif" font-size="14" fill="#CBD5E1">
    kevv.ai
  </text>
</svg>`;
}

export function createOGImageRouter() {
  const router = Router();

  router.get("/api/og-image/:slug", async (req, res) => {
    const { slug } = req.params;

    try {
      let agent: AgentOGData | null = null;
      let colorScheme = "gold";

      // Try DB first, then demo data
      const dbAgent = await getAgentBySlug(slug);
      if (dbAgent) {
        agent = dbAgent as unknown as AgentOGData;
        colorScheme = (dbAgent as any).colorScheme || "gold";
      } else {
        const demoAgent = getDemoAgent(slug);
        if (demoAgent) {
          agent = demoAgent as unknown as AgentOGData;
          colorScheme = (demoAgent as any).colorScheme || "gold";
        }
      }

      if (!agent) {
        res.status(404).send("Agent not found");
        return;
      }

      const svg = generateOGImageSVG(agent, colorScheme);

      res.set({
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=86400, s-maxage=604800",
      });
      res.send(svg);
    } catch (e) {
      console.error("[OG Image] Error:", e);
      res.status(500).send("Error generating OG image");
    }
  });

  return router;
}
