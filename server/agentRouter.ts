import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { getDb, getAgentBySlug, getAgentByEmail, createAgentProfile, updateAgentProfile, isSlugAvailable } from "./db";
import { generateSlug } from "./_core/auth";
import { agentProfiles, leads, chatSessions, agentUsage, pageViews, type AgentProfile } from "../drizzle/schema";
import { eq, and, desc, sql, gte } from "drizzle-orm";
import { getDemoAgent, DEMO_LEADS, DEMO_ANALYTICS } from "../client/src/data/demoAgents";
import { getPresignedUploadUrl, generatePhotoKey } from "./_core/storage";
import { createHash } from "crypto";

// ─── Input Schemas ──────────────────────────────────────────────────

const registerSchema = z.object({
  // Step 1: Basic
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
  title: z.string().optional(),
  brokerage: z.string().optional(),
  licenseState: z.string().optional(),

  // Step 2: Professional
  serviceAreas: z.array(z.string()).optional(),
  specialties: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  yearsExperience: z.number().min(0).max(100).optional(),
  bio: z.string().optional(),

  // Step 3: Branding
  photoUrl: z.string().optional(),
  colorScheme: z.enum(["gold", "navy", "emerald", "burgundy", "slate"]).optional(),
  socialLinks: z.record(z.string(), z.string()).optional(),
  slug: z.string().min(2).max(60).optional(),
});

const updateProfileSchema = z.object({
  slug: z.string(),
  data: z.object({
    name: z.string().optional(),
    phone: z.string().optional(),
    title: z.string().optional(),
    brokerage: z.string().optional(),
    licenseState: z.string().optional(),
    serviceAreas: z.array(z.string()).optional(),
    specialties: z.array(z.string()).optional(),
    languages: z.array(z.string()).optional(),
    yearsExperience: z.number().optional(),
    bio: z.string().optional(),
    photoUrl: z.string().optional(),
    colorScheme: z.string().optional(),
    socialLinks: z.record(z.string(), z.string()).optional(),
    awards: z.array(z.string()).optional(),
    transactions: z.array(z.object({
      address: z.string(),
      city: z.string(),
      price: z.string(),
      type: z.string(),
    })).optional(),
    testimonials: z.array(z.object({
      name: z.string(),
      text: z.string(),
      rating: z.number(),
    })).optional(),
    neighborhoodKnowledge: z.record(z.string(), z.string()).optional(),
    visibilitySettings: z.object({
      showPhone: z.boolean(),
      showEmail: z.boolean(),
      showTransactions: z.boolean(),
      showAwards: z.boolean(),
      showTestimonials: z.boolean(),
      showAddress: z.boolean(),
    }).optional(),
  }),
});

// ─── Helper: Filter profile for public display ──────────────────────

function toPublicProfile(agent: AgentProfile) {
  const vis = (agent.visibilitySettings as Record<string, boolean>) ?? {};

  return {
    slug: agent.slug,
    name: agent.name,
    title: agent.title,
    brokerage: agent.brokerage,
    phone: vis.showPhone !== false ? agent.phone : null,
    email: vis.showEmail !== false ? agent.email : null,
    licenseState: agent.licenseState,
    serviceAreas: agent.serviceAreas,
    specialties: agent.specialties,
    languages: agent.languages,
    yearsExperience: agent.yearsExperience,
    bio: agent.bio,
    photoUrl: agent.photoUrl,
    colorScheme: agent.colorScheme,
    socialLinks: agent.socialLinks,
    awards: vis.showAwards !== false ? agent.awards : [],
    transactions: vis.showTransactions !== false ? agent.transactions : [],
    testimonials: vis.showTestimonials !== false ? agent.testimonials : [],
    neighborhoodKnowledge: agent.neighborhoodKnowledge,
    templateId: agent.templateId,
    tier: agent.tier,
  };
}

// ─── Agent Router ───────────────────────────────────────────────────

export const agentRouter = router({
  /**
   * Register a new agent and create their profile page.
   * Returns the created profile with slug.
   */
  register: publicProcedure
    .input(registerSchema)
    .mutation(async ({ input }) => {
      // Check if email already exists
      const existing = await getAgentByEmail(input.email);
      if (existing) {
        throw new Error("An account with this email already exists");
      }

      // Generate or validate slug
      let slug = input.slug || generateSlug(input.name);
      let slugAvailable = await isSlugAvailable(slug);

      // If slug taken, append number
      if (!slugAvailable) {
        let counter = 1;
        while (!slugAvailable && counter < 100) {
          slug = `${generateSlug(input.name)}-${counter}`;
          slugAvailable = await isSlugAvailable(slug);
          counter++;
        }
        if (!slugAvailable) {
          throw new Error("Unable to generate a unique URL. Please specify a custom slug.");
        }
      }

      const profile = await createAgentProfile({
        slug,
        email: input.email,
        name: input.name,
        phone: input.phone,
        title: input.title || "Licensed Real Estate Agent",
        brokerage: input.brokerage,
        licenseState: input.licenseState,
        serviceAreas: input.serviceAreas || [],
        specialties: input.specialties || [],
        languages: input.languages || ["English"],
        yearsExperience: input.yearsExperience || 0,
        bio: input.bio,
        photoUrl: input.photoUrl,
        colorScheme: input.colorScheme || "gold",
        socialLinks: input.socialLinks || {},
        status: "active",
        tier: "free",
      });

      return {
        success: true,
        slug: profile.slug,
        profile: toPublicProfile(profile),
      };
    }),

  /**
   * Get agent profile by slug — public endpoint for page rendering.
   */
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const agent = await getAgentBySlug(input.slug);
      if (agent) return toPublicProfile(agent);

      // Fallback to demo agent data
      const demo = getDemoAgent(input.slug);
      if (demo) return demo;

      return null;
    }),

  /**
   * Check if a slug is available.
   */
  checkSlug: publicProcedure
    .input(z.object({ slug: z.string().min(2) }))
    .query(async ({ input }) => {
      const available = await isSlugAvailable(input.slug);
      return { available };
    }),

  /**
   * Update agent profile — requires auth (TODO: enforce after OAuth integration).
   */
  updateProfile: publicProcedure
    .input(updateProfileSchema)
    .mutation(async ({ input }) => {
      // TODO: Verify that the authenticated user owns this profile
      const updated = await updateAgentProfile(input.slug, input.data as any);
      if (!updated) {
        throw new Error("Profile not found");
      }
      return { success: true, profile: toPublicProfile(updated) };
    }),

  /**
   * List all active agents — for directory/discovery page.
   */
  listActive: publicProcedure
    .query(async () => {
      const db = await getDb();
      if (!db) return [];

      const agents = await db.select()
        .from(agentProfiles)
        .where(eq(agentProfiles.status, "active"))
        .orderBy(desc(agentProfiles.createdAt));

      return agents.map(toPublicProfile);
    }),
});

// ─── Dashboard Router (agent's private data) ────────────────────────

export const dashboardRouter = router({
  /**
   * Get leads for the current agent.
   */
  getLeads: publicProcedure
    .input(z.object({ agentSlug: z.string() }))  // TODO: derive from auth
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        // Return demo leads for demo agents
        const demo = getDemoAgent(input.agentSlug);
        if (demo) {
          return DEMO_LEADS.filter(l => l.agentSlug === input.agentSlug || input.agentSlug === demo.slug);
        }
        return [];
      }

      return db.select().from(leads)
        .where(eq(leads.agentSlug, input.agentSlug))
        .orderBy(desc(leads.createdAt));
    }),

  /**
   * Update lead status.
   */
  updateLeadStatus: publicProcedure
    .input(z.object({
      leadId: z.number(),
      status: z.enum(["new", "contacted", "qualified", "converted", "lost"]),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.update(leads)
        .set({ status: input.status, updatedAt: new Date() })
        .where(eq(leads.id, input.leadId));

      return { success: true };
    }),

  /**
   * Track a page view — called from client when agent page loads.
   */
  trackPageView: publicProcedure
    .input(z.object({
      agentSlug: z.string(),
      referrer: z.string().optional(),
      utmSource: z.string().optional(),
      utmMedium: z.string().optional(),
      utmCampaign: z.string().optional(),
      device: z.enum(["mobile", "tablet", "desktop"]).optional(),
      visitorId: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: true }; // demo mode — skip

      try {
        await db.insert(pageViews).values({
          agentSlug: input.agentSlug,
          visitorId: input.visitorId || null,
          referrer: input.referrer || null,
          utmSource: input.utmSource || null,
          utmMedium: input.utmMedium || null,
          utmCampaign: input.utmCampaign || null,
          device: input.device || null,
        });
      } catch (e) {
        console.warn("[Analytics] Failed to track page view:", e);
      }

      return { success: true };
    }),

  /**
   * Get analytics overview for an agent.
   */
  getAnalytics: publicProcedure
    .input(z.object({ agentSlug: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        // Return demo analytics for demo agents
        const demo = getDemoAgent(input.agentSlug);
        if (demo) return DEMO_ANALYTICS;
        return { totalLeads: 0, totalConversations: 0, conversionRate: 0, totalPageViews: 0, dailyViews: [], topReferrers: [], deviceBreakdown: [] };
      }

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Core counts
      const [leadResult] = await db.select({ count: sql<number>`count(*)` })
        .from(leads)
        .where(eq(leads.agentSlug, input.agentSlug));

      const [sessionResult] = await db.select({ count: sql<number>`count(*)` })
        .from(chatSessions)
        .where(eq(chatSessions.agentSlug, input.agentSlug));

      const [convertedResult] = await db.select({ count: sql<number>`count(*)` })
        .from(leads)
        .where(and(
          eq(leads.agentSlug, input.agentSlug),
          eq(leads.status, "converted"),
        ));

      // Page views — total
      const [pvResult] = await db.select({ count: sql<number>`count(*)` })
        .from(pageViews)
        .where(eq(pageViews.agentSlug, input.agentSlug));

      // Page views — daily (last 30 days)
      const dailyViews = await db.select({
        date: sql<string>`to_char(${pageViews.viewedAt}, 'YYYY-MM-DD')`,
        count: sql<number>`count(*)`,
      })
        .from(pageViews)
        .where(and(
          eq(pageViews.agentSlug, input.agentSlug),
          gte(pageViews.viewedAt, thirtyDaysAgo),
        ))
        .groupBy(sql`to_char(${pageViews.viewedAt}, 'YYYY-MM-DD')`)
        .orderBy(sql`to_char(${pageViews.viewedAt}, 'YYYY-MM-DD')`);

      // Top referrers
      const topReferrers = await db.select({
        referrer: pageViews.referrer,
        count: sql<number>`count(*)`,
      })
        .from(pageViews)
        .where(and(
          eq(pageViews.agentSlug, input.agentSlug),
          sql`${pageViews.referrer} IS NOT NULL AND ${pageViews.referrer} != ''`,
        ))
        .groupBy(pageViews.referrer)
        .orderBy(sql`count(*) DESC`)
        .limit(10);

      // Device breakdown
      const deviceBreakdown = await db.select({
        device: pageViews.device,
        count: sql<number>`count(*)`,
      })
        .from(pageViews)
        .where(and(
          eq(pageViews.agentSlug, input.agentSlug),
          sql`${pageViews.device} IS NOT NULL`,
        ))
        .groupBy(pageViews.device);

      const totalLeads = Number(leadResult?.count ?? 0);
      const totalConversations = Number(sessionResult?.count ?? 0);
      const converted = Number(convertedResult?.count ?? 0);

      return {
        totalLeads,
        totalConversations,
        conversionRate: totalLeads > 0 ? Math.round((converted / totalLeads) * 100) : 0,
        totalPageViews: Number(pvResult?.count ?? 0),
        dailyViews: dailyViews.map(d => ({ date: String(d.date), count: Number(d.count) })),
        topReferrers: topReferrers.map(r => ({ referrer: String(r.referrer ?? "Direct"), count: Number(r.count) })),
        deviceBreakdown: deviceBreakdown.map(d => ({ device: String(d.device ?? "unknown"), count: Number(d.count) })),
      };
    }),

  /**
   * Get a presigned URL for uploading a photo to R2.
   */
  getUploadUrl: publicProcedure
    .input(z.object({
      agentSlug: z.string(),
      filename: z.string(),
      contentType: z.string().refine(ct => ct.startsWith("image/"), {
        message: "Only image files are allowed",
      }),
    }))
    .mutation(async ({ input }) => {
      const key = generatePhotoKey(input.agentSlug, input.filename);
      const result = await getPresignedUploadUrl(key, input.contentType);

      if (!result) {
        return {
          success: false as const,
          error: "Storage not configured. Set R2 environment variables.",
          uploadUrl: "",
          publicUrl: "",
        };
      }

      return {
        success: true as const,
        uploadUrl: result.uploadUrl,
        publicUrl: result.publicUrl,
      };
    }),
});

