import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Check, CreditCard, ExternalLink, Sparkles, Zap, Shield, Star, ArrowRight } from "lucide-react";

interface BillingStatus {
  tier: string;
  subscriptionStatus: string | null;
  currentPeriodEnd: string | null;
  hasSubscription: boolean;
}

export default function BillingPage() {
  const { isAuthenticated } = useAuth();
  const [status, setStatus] = useState<BillingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    fetch("/api/stripe/status", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setStatus(data))
      .catch(() => setStatus(null))
      .finally(() => setLoading(false));
  }, []);

  const isPro = status?.tier === "pro" || status?.tier === "premium";
  const isActive = status?.subscriptionStatus === "active" || status?.subscriptionStatus === "trialing";

  async function handleUpgrade() {
    setCheckoutLoading(true);
    try {
      const res = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Checkout failed:", err);
    } finally {
      setCheckoutLoading(false);
    }
  }

  async function handleManage() {
    try {
      const res = await fetch("/api/stripe/create-portal", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Portal failed:", err);
    }
  }

  const successParam = new URLSearchParams(window.location.search).get("success");
  const canceledParam = new URLSearchParams(window.location.search).get("canceled");

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin h-8 w-8 rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-heading font-bold">Billing</h1>
        <p className="text-muted-foreground mt-1">Manage your subscription</p>
      </div>

      {/* Success / Canceled banners */}
      {successParam && (
        <div className="px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-sm text-emerald-700">
          🎉 Subscription activated! Your page is now powered by AI.
        </div>
      )}
      {canceledParam && (
        <div className="px-4 py-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-sm text-amber-700">
          Checkout was canceled. No charges were made.
        </div>
      )}

      {/* Current plan status */}
      {isPro && isActive && (
        <div className="border rounded-2xl p-6 bg-card space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Star className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold">Pro Plan</p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleManage} className="gap-2">
              <ExternalLink className="h-4 w-4" />
              Manage Subscription
            </Button>
          </div>
          {status?.currentPeriodEnd && (
            <p className="text-sm text-muted-foreground">
              Next billing date: <strong>{new Date(status.currentPeriodEnd).toLocaleDateString()}</strong>
            </p>
          )}
        </div>
      )}

      {/* Pricing comparison */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Free tier */}
        <div className="border rounded-2xl p-6 bg-card space-y-5">
          <div>
            <h3 className="text-lg font-semibold">Free</h3>
            <p className="text-muted-foreground text-sm mt-1">Get started at no cost</p>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold">$0</span>
            <span className="text-muted-foreground">/mo</span>
          </div>
          <ul className="space-y-3 text-sm">
            {[
              "Agent profile page",
              "1 template (Classic)",
              "Contact form",
              "Basic SEO",
            ].map((f) => (
              <li key={f} className="flex items-start gap-2">
                <Check className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
          {!isPro && (
            <Button variant="outline" disabled className="w-full">
              Current Plan
            </Button>
          )}
        </div>

        {/* Pro tier */}
        <div className="border-2 border-primary rounded-2xl p-6 bg-card space-y-5 relative">
          <div className="absolute -top-3 left-6 px-3 py-0.5 bg-primary text-primary-foreground text-xs font-bold rounded-full">
            RECOMMENDED
          </div>
          <div>
            <h3 className="text-lg font-semibold">Pro</h3>
            <p className="text-muted-foreground text-sm mt-1">Everything you need to convert leads</p>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold">$9</span>
            <span className="text-muted-foreground">/mo</span>
          </div>
          <ul className="space-y-3 text-sm">
            {[
              "Everything in Free",
              "All 7 premium templates",
              "AI chatbot for visitors",
              "Unlimited lead capture",
              "Conversation history",
              "Advanced SEO + OG cards",
              "Custom branding",
              "Priority support",
            ].map((f) => (
              <li key={f} className="flex items-start gap-2">
                <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
          {isPro && isActive ? (
            <Button variant="outline" disabled className="w-full">
              Current Plan
            </Button>
          ) : (
            <Button
              onClick={handleUpgrade}
              disabled={checkoutLoading || !isAuthenticated}
              className="w-full gap-2"
            >
              {checkoutLoading ? (
                <>
                  <div className="animate-spin h-4 w-4 rounded-full border-2 border-white border-t-transparent" />
                  Redirecting…
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  Upgrade to Pro
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          )}
          {!isAuthenticated && (
            <p className="text-xs text-muted-foreground text-center">
              Sign in to upgrade
            </p>
          )}
        </div>
      </div>

      {/* Trust section */}
      <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground pt-4">
        <div className="flex items-center gap-1.5">
          <Shield className="h-3.5 w-3.5" />
          Secure checkout via Stripe
        </div>
        <div className="flex items-center gap-1.5">
          <CreditCard className="h-3.5 w-3.5" />
          Cancel anytime
        </div>
      </div>
    </div>
  );
}
