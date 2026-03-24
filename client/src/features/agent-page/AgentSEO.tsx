import { useEffect } from "react";

type AgentSEOData = {
  slug: string;
  name: string;
  title?: string | null;
  brokerage?: string | null;
  phone?: string | null;
  email?: string | null;
  photoUrl?: string | null;
  bio?: string | null;
  serviceAreas?: unknown;
  languages?: unknown;
  yearsExperience?: number | null;
  testimonials?: unknown;
};

/**
 * Dynamic SEO hook — sets page title, meta tags, Open Graph, Twitter Card,
 * and JSON-LD structured data based on agent profile data.
 *
 * Note: Server-side middleware (server/seo.ts) handles the initial HTML
 * injection for crawlers. This hook ensures correct tags during SPA navigation.
 */
export function useAgentSEO(agent: AgentSEOData | null | undefined) {
  useEffect(() => {
    if (!agent) return;

    const areas = ((agent.serviceAreas ?? []) as string[]).join(", ");
    const fullTitle = `${agent.name} | ${agent.title || "Real Estate Agent"} | ${agent.brokerage || ""} – ${areas}`;
    const description = agent.bio
      ? agent.bio.slice(0, 155) + (agent.bio.length > 155 ? "…" : "")
      : `${agent.name} is a ${agent.title || "real estate agent"} at ${agent.brokerage || ""}. ${agent.yearsExperience || 0}+ years experience. Contact for a free consultation.`;
    const url = `${window.location.origin}/agents/${agent.slug}`;
    const image = agent.photoUrl || `${window.location.origin}/og-default.png`;

    document.title = fullTitle;

    const setMeta = (name: string, content: string) => {
      let el = document.querySelector(`meta[name='${name}']`) as HTMLMetaElement;
      if (!el) {
        el = document.createElement("meta");
        el.name = name;
        document.head.appendChild(el);
      }
      el.content = content;
    };

    const setOgMeta = (property: string, content: string) => {
      let el = document.querySelector(`meta[property='${property}']`) as HTMLMetaElement;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("property", property);
        document.head.appendChild(el);
      }
      el.content = content;
    };

    // ─── Standard Meta Tags ───
    setMeta("description", description);
    setMeta("keywords", `real estate, agent, ${areas}, home buying, home selling, ${agent.name}, ${agent.brokerage || ""}`);

    // ─── Open Graph Tags ───
    setOgMeta("og:title", fullTitle);
    setOgMeta("og:description", description);
    setOgMeta("og:type", "profile");
    setOgMeta("og:url", url);
    setOgMeta("og:image", image);
    setOgMeta("og:site_name", "Kevv Agent Pages");
    setOgMeta("og:locale", "en_US");

    // ─── Twitter Card Tags ───
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", fullTitle);
    setMeta("twitter:description", description);
    setMeta("twitter:image", image);

    // ─── Canonical URL ───
    let canonical = document.querySelector("link[rel='canonical']") as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = url;

    // ─── JSON-LD Structured Data (Schema.org RealEstateAgent) ───
    const testimonials = (agent.testimonials ?? []) as Array<{ clientName?: string; text?: string; rating?: number }>;

    const jsonLd: Record<string, unknown> = {
      "@context": "https://schema.org",
      "@type": "RealEstateAgent",
      name: agent.name,
      url,
      image,
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

    // Aggregate rating from testimonials
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
    }

    let scriptEl = document.querySelector("#agent-jsonld") as HTMLScriptElement;
    if (!scriptEl) {
      scriptEl = document.createElement("script");
      scriptEl.id = "agent-jsonld";
      scriptEl.type = "application/ld+json";
      document.head.appendChild(scriptEl);
    }
    scriptEl.textContent = JSON.stringify(jsonLd);

    return () => {
      scriptEl?.remove();
    };
  }, [agent]);
}
