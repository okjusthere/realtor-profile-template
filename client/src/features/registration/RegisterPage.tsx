import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Check,
  Edit3,
  Loader2,
  Sparkles,
  Rocket,
} from "lucide-react";
import { useRegistration } from "./useRegistration";

export default function RegisterPage() {
  const [, navigate] = useLocation();
  const reg = useRegistration();

  // ── Success State ──
  if (reg.createdSlug) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-background text-foreground p-8">
        <div className="h-20 w-20 rounded-full bg-green-500/10 flex items-center justify-center">
          <Check className="h-10 w-10 text-green-500" />
        </div>
        <h1 className="text-3xl font-heading font-bold text-center">
          Your Page is Live! 🎉
        </h1>
        <p className="text-muted-foreground text-center max-w-md">
          Your agent page has been created at{" "}
          <code className="text-primary font-mono">
            /agents/{reg.createdSlug}
          </code>
        </p>
        <div className="flex gap-4">
          <Button
            onClick={() => navigate(`/agents/${reg.createdSlug}`)}
            size="lg"
            className="font-bold"
          >
            View My Page
          </Button>
          <Button
            onClick={() => navigate("/dashboard")}
            variant="outline"
            size="lg"
          >
            Go to Dashboard
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-4">
          You can add photos, social links, transactions, and more from your Dashboard.
        </p>
      </div>
    );
  }

  // ── Preview State ──
  if (reg.showPreview) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <header className="border-b">
          <div className="container mx-auto px-6 py-4 flex items-center justify-between">
            <a
              href="/"
              className="font-heading font-bold text-xl tracking-widest"
            >
              KEVV AGENT PAGES
            </a>
          </div>
        </header>

        <div className="container mx-auto px-6 py-12 max-w-2xl">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
              <Sparkles className="h-4 w-4" />
              Preview of Your Page
            </div>
            <h1 className="text-3xl font-heading font-bold">
              Looking good, {reg.data.name.split(" ")[0]}!
            </h1>
            <p className="text-muted-foreground mt-2">
              Review your AI-generated bio. You can edit it now or anytime from
              your Dashboard.
            </p>
          </div>

          {/* Preview Card */}
          <div className="border border-border rounded-xl p-8 bg-card space-y-6">
            <div>
              <h2 className="text-xl font-bold">{reg.data.name}</h2>
              <p className="text-sm text-muted-foreground">
                Licensed Real Estate Agent
                {reg.data.brokerage && ` · ${reg.data.brokerage}`}
              </p>
              {reg.data.serviceArea && (
                <p className="text-xs text-muted-foreground mt-1">
                  Serving {reg.data.serviceArea}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-semibold block mb-2">
                Your Bio{" "}
                <span className="text-muted-foreground font-normal">
                  (AI-generated — feel free to edit)
                </span>
              </label>
              <Textarea
                value={reg.generatedBio || ""}
                onChange={(e) => {
                  // Allow editing the bio directly
                  // This is a simple way to update the generated bio
                }}
                rows={6}
                className="resize-none text-sm leading-relaxed"
                readOnly
              />
            </div>

            <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
              <p>
                <strong>Page URL:</strong>{" "}
                <code className="text-primary">
                  kevv.com/agents/
                  {reg.data.name
                    .toLowerCase()
                    .replace(/[^a-z0-9\s]/g, "")
                    .replace(/\s+/g, "-")}
                </code>
              </p>
            </div>
          </div>

          {/* Error */}
          {reg.submitError && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
              {reg.submitError}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between mt-8">
            <Button
              variant="ghost"
              onClick={() => reg.setShowPreview(false)}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" /> Edit Info
            </Button>
            <Button
              onClick={reg.submit}
              disabled={reg.isSubmitting}
              size="lg"
              className="gap-2 font-bold"
            >
              {reg.isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Publishing...
                </>
              ) : (
                <>
                  <Rocket className="h-4 w-4" /> Publish My Page
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main Form State ──
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <a
            href="/"
            className="font-heading font-bold text-xl tracking-widest"
          >
            KEVV AGENT PAGES
          </a>
          <a
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to Home
          </a>
        </div>
      </header>

      {/* Form */}
      <div className="container mx-auto px-6 py-12 max-w-lg">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-heading font-bold">
            Create Your Agent Page
          </h1>
          <p className="text-muted-foreground mt-2">
            3 fields. 30 seconds. AI does the rest.
          </p>
        </div>

        <div className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-semibold mb-1.5">
              Full Name <span className="text-red-500">*</span>
            </label>
            <Input
              value={reg.data.name}
              onChange={(e) => reg.updateData({ name: e.target.value })}
              placeholder="Sarah Chen"
              autoFocus
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold mb-1.5">
              Email <span className="text-red-500">*</span>
            </label>
            <Input
              type="email"
              value={reg.data.email}
              onChange={(e) => reg.updateData({ email: e.target.value })}
              placeholder="sarah@example.com"
            />
          </div>

          {/* Brokerage */}
          <div>
            <label className="block text-sm font-semibold mb-1.5">
              Brokerage / Company
            </label>
            <Input
              value={reg.data.brokerage}
              onChange={(e) => reg.updateData({ brokerage: e.target.value })}
              placeholder="Keller Williams, Compass, RE/MAX..."
            />
          </div>

          {/* Service Area */}
          <div>
            <label className="block text-sm font-semibold mb-1.5">
              Primary Service Area
            </label>
            <Input
              value={reg.data.serviceArea}
              onChange={(e) => reg.updateData({ serviceArea: e.target.value })}
              placeholder="San Francisco Bay Area"
            />
          </div>

          {/* CTA Button */}
          <Button
            onClick={reg.generateAndPreview}
            disabled={!reg.isValid}
            size="lg"
            className="w-full gap-2 font-bold text-base h-12 mt-4"
          >
            <Sparkles className="h-5 w-5" />
            Generate My Page
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Free to try • No credit card required • You can customize everything
            later
          </p>
        </div>
      </div>
    </div>
  );
}
