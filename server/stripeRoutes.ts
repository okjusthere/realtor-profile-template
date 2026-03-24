/**
 * Stripe billing routes — single-tier subscription.
 * Following shared-account-isolation skill: metadata.app = "kevvpages"
 *
 * Routes:
 *   POST /api/stripe/create-checkout  — start subscription checkout
 *   POST /api/stripe/webhook          — handle Stripe events
 *   POST /api/stripe/create-portal    — customer self-service portal
 *   GET  /api/stripe/status           — current subscription status
 */
import { Router, type Request, type Response } from "express";
import Stripe from "stripe";
import { eq } from "drizzle-orm";
import { getDb } from "./db";
import { agentProfiles } from "../drizzle/schema";
import { getAuthUser, getDashboardUrl } from "./_core/auth";

// ─── Constants ──────────────────────────────────────────────────────

const STRIPE_APP_ID = "kevvpages";

function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}

function getPriceId(): string {
  return process.env.STRIPE_PRICE_ID || "";
}

// ─── Skill: Webhook Filtering ───────────────────────────────────────

function isProjectCheckoutSession(session: Stripe.Checkout.Session): boolean {
  return session.metadata?.app === STRIPE_APP_ID;
}

function isProjectSubscription(subscription: Stripe.Subscription): boolean {
  if (subscription.metadata?.app === STRIPE_APP_ID) return true;
  // Fallback: check if any line item uses our price
  const priceId = getPriceId();
  if (!priceId) return false;
  return subscription.items.data.some((item) => item.price?.id === priceId);
}

// ─── Subscription Sync ─────────────────────────────────────────────

async function syncSubscription(subscription: Stripe.Subscription) {
  const db = await getDb();
  if (!db) return;

  const customerId = typeof subscription.customer === "string"
    ? subscription.customer
    : subscription.customer?.id;

  if (!customerId) return;

  // Map Stripe status to tier
  const isActive = subscription.status === "active" || subscription.status === "trialing";
  const tier = isActive ? "pro" : "free";

  await db.update(agentProfiles).set({
    stripeSubscriptionId: subscription.id,
    subscriptionStatus: subscription.status,
    currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
    tier,
    updatedAt: new Date(),
  }).where(eq(agentProfiles.stripeCustomerId, customerId));

  console.log(`[Stripe] Synced subscription ${subscription.id} → tier=${tier}, status=${subscription.status}`);
}

// ─── Router ─────────────────────────────────────────────────────────

export function createStripeRouter(): Router {
  const router = Router();

  /**
   * POST /api/stripe/create-checkout — Create a Checkout Session
   * Requires auth. Tags with metadata.app per skill.
   */
  router.post("/api/stripe/create-checkout", async (req: Request, res: Response) => {
    const stripe = getStripe();
    if (!stripe) {
      return res.status(503).json({ error: "Stripe is not configured" });
    }

    const user = await getAuthUser(req);
    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const priceId = getPriceId();
    if (!priceId) {
      return res.status(503).json({ error: "No price configured" });
    }

    try {
      const db = await getDb();
      if (!db) return res.status(503).json({ error: "Database unavailable" });

      // Find agent
      const [agent] = await db.select().from(agentProfiles)
        .where(eq(agentProfiles.id, user.id)).limit(1);

      if (!agent) return res.status(404).json({ error: "Agent not found" });

      // Reuse or create Stripe Customer
      let customerId = agent.stripeCustomerId;

      if (!customerId) {
        const customer = await stripe.customers.create({
          email: agent.email,
          name: agent.name,
          metadata: { app: STRIPE_APP_ID, agentId: String(agent.id), slug: agent.slug },
        });
        customerId = customer.id;

        await db.update(agentProfiles).set({
          stripeCustomerId: customerId,
          updatedAt: new Date(),
        }).where(eq(agentProfiles.id, agent.id));
      }

      const dashboardUrl = getDashboardUrl();

      // Create Checkout Session (per skill: tag metadata.app)
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        customer: customerId,
        client_reference_id: String(agent.id),
        line_items: [{ price: priceId, quantity: 1 }],
        metadata: {
          app: STRIPE_APP_ID,
          agentId: String(agent.id),
        },
        subscription_data: {
          metadata: {
            app: STRIPE_APP_ID,
            agentId: String(agent.id),
          },
        },
        success_url: `${dashboardUrl}/dashboard/billing?success=true`,
        cancel_url: `${dashboardUrl}/dashboard/billing?canceled=true`,
      });

      return res.json({ url: session.url });
    } catch (err) {
      console.error("[Stripe] Checkout creation failed:", err);
      return res.status(500).json({ error: "Failed to create checkout session" });
    }
  });

  /**
   * POST /api/stripe/webhook — Handle Stripe events
   * Per skill: ignore foreign events, return 200.
   * NOTE: This route needs express.raw() body, mounted BEFORE json parser.
   */
  router.post("/api/stripe/webhook", async (req: Request, res: Response) => {
    const stripe = getStripe();
    if (!stripe) return res.status(503).json({ error: "Stripe not configured" });

    const sig = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!sig || !webhookSecret) {
      return res.status(400).json({ error: "Missing signature or webhook secret" });
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig as string, webhookSecret);
    } catch (err) {
      console.error("[Stripe] Webhook signature verification failed:", err);
      return res.status(400).json({ error: "Invalid signature" });
    }

    // Route events
    try {
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object as Stripe.Checkout.Session;
          // Per skill: filter by app metadata
          if (!isProjectCheckoutSession(session)) {
            console.log(`[Stripe] Ignoring foreign checkout session ${session.id}`);
            return res.json({ received: true, ignored: true });
          }

          // If subscription checkout, the subscription was just created
          if (session.subscription) {
            const subId = typeof session.subscription === "string"
              ? session.subscription
              : session.subscription.id;
            const subscription = await stripe.subscriptions.retrieve(subId);
            await syncSubscription(subscription);
          }
          break;
        }

        case "customer.subscription.updated":
        case "customer.subscription.deleted": {
          const subscription = event.data.object as Stripe.Subscription;
          if (!isProjectSubscription(subscription)) {
            console.log(`[Stripe] Ignoring foreign subscription ${subscription.id}`);
            return res.json({ received: true, ignored: true });
          }
          await syncSubscription(subscription);
          break;
        }

        default:
          // Per skill: return 200 for unhandled events
          console.log(`[Stripe] Unhandled event type: ${event.type}`);
      }
    } catch (err) {
      console.error(`[Stripe] Error processing ${event.type}:`, err);
      return res.status(500).json({ error: "Webhook processing failed" });
    }

    return res.json({ received: true });
  });

  /**
   * POST /api/stripe/create-portal — Customer self-service portal
   */
  router.post("/api/stripe/create-portal", async (req: Request, res: Response) => {
    const stripe = getStripe();
    if (!stripe) return res.status(503).json({ error: "Stripe not configured" });

    const user = await getAuthUser(req);
    if (!user) return res.status(401).json({ error: "Authentication required" });

    try {
      const db = await getDb();
      if (!db) return res.status(503).json({ error: "Database unavailable" });

      const [agent] = await db.select().from(agentProfiles)
        .where(eq(agentProfiles.id, user.id)).limit(1);

      if (!agent?.stripeCustomerId) {
        return res.status(400).json({ error: "No active subscription — nothing to manage" });
      }

      const dashboardUrl = getDashboardUrl();
      const session = await stripe.billingPortal.sessions.create({
        customer: agent.stripeCustomerId,
        return_url: `${dashboardUrl}/dashboard/billing`,
      });

      return res.json({ url: session.url });
    } catch (err) {
      console.error("[Stripe] Portal creation failed:", err);
      return res.status(500).json({ error: "Failed to create portal session" });
    }
  });

  /**
   * GET /api/stripe/status — Current subscription status
   */
  router.get("/api/stripe/status", async (req: Request, res: Response) => {
    const user = await getAuthUser(req);
    if (!user) return res.status(401).json({ error: "Authentication required" });

    try {
      const db = await getDb();
      if (!db) return res.status(503).json({ error: "Database unavailable" });

      const [agent] = await db.select({
        tier: agentProfiles.tier,
        subscriptionStatus: agentProfiles.subscriptionStatus,
        currentPeriodEnd: agentProfiles.currentPeriodEnd,
        stripeCustomerId: agentProfiles.stripeCustomerId,
      }).from(agentProfiles)
        .where(eq(agentProfiles.id, user.id)).limit(1);

      if (!agent) return res.status(404).json({ error: "Agent not found" });

      return res.json({
        tier: agent.tier || "free",
        subscriptionStatus: agent.subscriptionStatus,
        currentPeriodEnd: agent.currentPeriodEnd?.toISOString() || null,
        hasSubscription: !!agent.stripeCustomerId,
      });
    } catch (err) {
      console.error("[Stripe] Status check failed:", err);
      return res.status(500).json({ error: "Failed to check status" });
    }
  });

  return router;
}
