import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { AgentPage } from "@/features/agent-page";
import { getDemoAgent } from "@/data/demoAgents";

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
