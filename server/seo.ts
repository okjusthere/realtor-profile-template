import { Router, type Request, type Response, type NextFunction } from "express";
import { getAgentBySlug } from "./db";
import { getDemoAgent } from "../client/src/data/demoAgents";

/**
 * SEO middleware — injects Open Graph, Twitter Card, and JSON-LD
 * structured data into the HTML <head> for crawler visibility.
 *
 * This runs BEFORE the Vite/static middleware so crawlers get
 * proper meta tags without executing JavaScript.
 */

type AgentData = {
  name: string;
  slug: string;
  title?: string | null;
  brokerage?: string | null;
  phone?: string | null;
  email?: string | null;
  bio?: string | null;
  photoUrl?: string | null;
  serviceAreas?: unknown;
  languages?: unknown;
  yearsExperience?: number | null;
  testimonials?: unknown;
  transactions?: unknown;
};

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Generate the full set of meta tags + JSON-LD for an agent page.
 */
function generateSEOTags(agent: AgentData, baseUrl: string): string {
  const areas = ((agent.serviceAreas ?? []) as string[]).join(", ");
  const pageTitle = `${agent.name} | ${agent.title || "Real Estate Agent"} | ${agent.brokerage || ""} – ${areas}`;
  const description = agent.bio
    ? agent.bio.slice(0, 155) + (agent.bio.length > 155 ? "…" : "")
    : `${agent.name} is a ${agent.title || "real estate agent"} at ${agent.brokerage || ""}. ${agent.yearsExperience || 0}+ years experience serving ${areas}. Contact for a free consultation.`;
  const url = `${baseUrl}/agents/${agent.slug}`;
  const image = agent.photoUrl || `${baseUrl}/og-default.png`;

  // ─── Open Graph Tags ───
  const ogTags = `
    <meta property="og:title" content="${escapeHtml(pageTitle)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:type" content="profile" />
    <meta property="og:url" content="${escapeHtml(url)}" />
    <meta property="og:image" content="${escapeHtml(image)}" />
    <meta property="og:site_name" content="Kevv Agent Pages" />
    <meta property="og:locale" content="en_US" />
    <meta property="profile:first_name" content="${escapeHtml(agent.name.split(' ')[0])}" />
    <meta property="profile:last_name" content="${escapeHtml(agent.name.split(' ').slice(1).join(' '))}" />
  `;

  // ─── Twitter Card Tags ───
  const twitterTags = `
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(pageTitle)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${escapeHtml(image)}" />
  `;

  // ─── Standard Meta Tags ───
  const metaTags = `
    <title>${escapeHtml(pageTitle)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta name="keywords" content="real estate, agent, ${escapeHtml(areas)}, home buying, home selling, ${escapeHtml(agent.name)}, ${escapeHtml(agent.brokerage || '')}" />
    <link rel="canonical" href="${escapeHtml(url)}" />
  `;

  // ─── JSON-LD Structured Data (Schema.org RealEstateAgent) ───
  const testimonials = (agent.testimonials ?? []) as Array<{ clientName?: string; text?: string; rating?: number }>;
  const transactions = (agent.transactions ?? []) as Array<{ address?: string; price?: string }>;

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: agent.name,
    url,
    image: image,
    jobTitle: agent.title || "Real Estate Agent",
    description,
    telephone: agent.phone || undefined,
    email: agent.email || undefined,
    worksFor: agent.brokerage
      ? { "@type": "RealEstateAgent", name: agent.brokerage }
      : undefined,
    areaServed: ((agent.serviceAreas ?? []) as string[]).map((area) => ({
      "@type": "City",
      name: area,
    })),
    knowsLanguage: agent.languages || ["English"],
  };

  // Add aggregate rating from testimonials
  if (testimonials.length > 0) {
    const ratings = testimonials.filter((t) => t.rating).map((t) => t.rating!);
    const avgRating = ratings.length > 0
      ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
      : "5.0";
    jsonLd.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: avgRating,
      reviewCount: testimonials.length,
      bestRating: "5",
      worstRating: "1",
    };

    // Add individual reviews (max 5)
    jsonLd.review = testimonials.slice(0, 5).map((t) => ({
      "@type": "Review",
      author: { "@type": "Person", name: t.clientName || "Client" },
      reviewBody: t.text || "",
      reviewRating: {
        "@type": "Rating",
        ratingValue: String(t.rating || 5),
        bestRating: "5",
      },
    }));
  }

  const jsonLdScript = `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`;

  return metaTags + ogTags + twitterTags + jsonLdScript;
}

/**
 * Middleware: intercepts agent page requests and injects SEO tags.
 * Must be mounted BEFORE the catch-all HTML handler.
 */
export function createSEOMiddleware() {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Only handle agent page routes
    const agentMatch = req.path.match(/^\/agents\/([a-z0-9-]+)$/i);
    if (!agentMatch) return next();

    const slug = agentMatch[1];

    try {
      // Try DB first, fall back to demo data
      let agent: AgentData | null = null;
      const dbAgent = await getAgentBySlug(slug);
      if (dbAgent) {
        agent = dbAgent as unknown as AgentData;
      } else {
        const demoAgent = getDemoAgent(slug);
        if (demoAgent) agent = demoAgent as unknown as AgentData;
      }

      if (!agent) return next();

      const baseUrl = `${req.protocol}://${req.get("host")}`;

      // Store the SEO tags for the HTML template to pick up
      (res as any).__seoTags = generateSEOTags(agent, baseUrl);
    } catch (e) {
      // Don't block page load if SEO injection fails
      console.error("[SEO] Error generating tags:", e);
    }
    next();
  };
}

/**
 * Inject SEO tags into HTML template.
 * Call this from vite.ts / serveStatic before sending HTML.
 */
export function injectSEOTags(html: string, res: Response): string {
  const seoTags = (res as any).__seoTags;
  if (!seoTags) return html;
  // Insert before </head>
  return html.replace("</head>", `${seoTags}\n</head>`);
}

/**
 * Sitemap endpoint — dynamically generates sitemap.xml from all agents.
 */
export function createSitemapRouter() {
  const sitemapRouter = Router();

  sitemapRouter.get("/sitemap.xml", async (req, res) => {
    const baseUrl = `${req.protocol}://${req.get("host")}`;

    try {
      const dbModule = await import("./db");
      const db = await dbModule.getDb();
      const { agentProfiles } = await import("../drizzle/schema");

      let slugs: string[] = [];

      if (db) {
        const agents = await db
          .select({ slug: agentProfiles.slug })
          .from(agentProfiles);
        slugs = agents.map((a: { slug: string }) => a.slug);
      }

      // Always include demo agents
      const { DEMO_AGENTS } = await import("../client/src/data/demoAgents");
      for (const demo of DEMO_AGENTS) {
        if (!slugs.includes(demo.slug)) {
          slugs.push(demo.slug);
        }
      }

      const today = new Date().toISOString().split("T")[0];

      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/register</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
${slugs.map((slug) => `  <url>
    <loc>${baseUrl}/agents/${slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`).join("\n")}
</urlset>`;

      res.set("Content-Type", "application/xml");
      res.send(xml);
    } catch (e) {
      console.error("[Sitemap] Error:", e);
      res.status(500).send("Error generating sitemap");
    }
  });

  sitemapRouter.get("/robots.txt", (robotsReq, res) => {
    const baseUrl = `${robotsReq.protocol}://${robotsReq.get("host")}`;
    res.set("Content-Type", "text/plain");
    res.send(`User-agent: *
Allow: /
Allow: /agents/
Disallow: /dashboard/
Disallow: /api/

Sitemap: ${baseUrl}/sitemap.xml`);
  });

  return sitemapRouter;
}
