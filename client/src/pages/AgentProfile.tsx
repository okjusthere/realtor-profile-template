import { useEffect } from "react";
import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { AgentPage } from "@/features/agent-page";
import { getDemoAgent } from "@/data/demoAgents";

/** Detect device type from viewport width */
function getDeviceType(): "mobile" | "tablet" | "desktop" {
  const w = window.innerWidth;
  if (w < 768) return "mobile";
  if (w < 1024) return "tablet";
  return "desktop";
}

/** Extract UTM params from current URL */
function getUTMParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    utmSource: params.get("utm_source") || undefined,
    utmMedium: params.get("utm_medium") || undefined,
    utmCampaign: params.get("utm_campaign") || undefined,
  };
}

/**
 * Route handler for /agents/:slug
 * Loads agent data from tRPC. Falls back to hardcoded demo data
 * for known demo slugs when the database is unavailable.
 */
export default function AgentProfileRoute() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug || "";

  const { data: agent, isLoading, error } = trpc.agent.getBySlug.useQuery(
    { slug },
    { enabled: !!slug }
  );

  // Track page view
  const trackMutation = trpc.agent.trackPageView.useMutation();
  useEffect(() => {
    if (!slug) return;
    const utm = getUTMParams();
    trackMutation.mutate({
      agentSlug: slug,
      referrer: document.referrer || undefined,
      device: getDeviceType(),
      ...utm,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  // Fallback to demo data if tRPC returns null/undefined (e.g. no DB)
  const resolvedAgent = agent ?? getDemoAgent(slug) ?? null;

  return (
    <AgentPage
      profile={resolvedAgent}
      isLoading={isLoading}
      error={resolvedAgent ? null : (error as Error | null) ?? null}
      slug={slug}
    />
  );
}
