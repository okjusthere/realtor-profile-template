import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, ExternalLink, Globe, MapPin, MessageSquare, Palette, Sparkles, Star } from "lucide-react";
import { useLocation } from "wouter";
import { DEMO_AGENTS } from "@/data/demoAgents";

const FEATURES = [
  {
    icon: <Sparkles className="h-6 w-6" />,
    title: "AI Chat Assistant",
    description: "Your personal AI assistant that answers visitor questions 24/7, captures leads, and qualifies prospects automatically.",
  },
  {
    icon: <BarChart3 className="h-6 w-6" />,
    title: "Lead Dashboard",
    description: "Track every lead in real-time. See who visited, what they asked, and their intent — all from one dashboard.",
  },
  {
    icon: <Palette className="h-6 w-6" />,
    title: "Professional Pages",
    description: "Beautiful, mobile-responsive agent pages with your branding, testimonials, transactions, and contact forms.",
  },
  {
    icon: <MessageSquare className="h-6 w-6" />,
    title: "Smart Notifications",
    description: "Get notified instantly when leads come in. AI summarizes the conversation so you know exactly what to say.",
  },
];

export default function LandingPage() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="border-b">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <span className="font-heading font-bold text-xl tracking-widest">KEVV AGENT PAGES</span>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
              Dashboard
            </Button>
            <Button size="sm" onClick={() => navigate("/register")} className="font-bold">
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-6 text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-8">
            <Sparkles className="h-4 w-4" />
            AI-Powered Agent Pages
          </div>
          <h1 className="text-5xl md:text-7xl font-heading font-bold tracking-tight leading-tight mb-6">
            Your Personal Page,{" "}
            <span className="text-primary">Powered by AI</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Create a stunning real estate agent page in minutes. AI chat captures leads 24/7 while you focus on closing deals.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              onClick={() => navigate("/register")}
              size="lg"
              className="text-lg px-10 py-7 font-bold uppercase tracking-wider gap-2"
            >
              Create Your Page <ArrowRight className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate(`/agents/${DEMO_AGENTS[0].slug}`)}
              className="text-lg px-10 py-7"
            >
              See Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Agents */}
      <section className="py-20 border-t">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6">
              <Star className="h-4 w-4" />
              Live Examples
            </div>
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              See It In Action
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Explore real agent pages built with Kevv. Click to see the full experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {DEMO_AGENTS.map((agent) => {
              const areas = (agent.serviceAreas ?? []) as string[];
              const specialties = (agent.specialties ?? []) as string[];
              const languages = (agent.languages ?? []) as string[];

              return (
                <div
                  key={agent.slug}
                  onClick={() => navigate(`/agents/${agent.slug}`)}
                  className="group relative overflow-hidden rounded-2xl border border-border bg-card/50 backdrop-blur-sm cursor-pointer transition-all duration-500 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1"
                >
                  {/* Agent Photo */}
                  <div className="relative h-72 overflow-hidden">
                    <img
                      src={agent.photoUrl || ""}
                      alt={agent.name}
                      className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Overlay Info */}
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h3 className="text-2xl font-heading font-bold text-white uppercase tracking-wider mb-1">
                        {agent.name}
                      </h3>
                      <p className="text-white/80 text-sm uppercase tracking-wider">
                        {agent.title}
                      </p>
                    </div>

                    {/* Tier Badge */}
                    {agent.tier === "pro" && (
                      <div className="absolute top-4 right-4 px-3 py-1 bg-primary/90 text-primary-foreground text-xs font-bold uppercase tracking-wider rounded-full backdrop-blur-sm">
                        Pro
                      </div>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="p-6 space-y-4">
                    {/* Brokerage */}
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      {agent.brokerage}
                    </p>

                    {/* Service Areas */}
                    {areas.length > 0 && (
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <p className="text-sm text-muted-foreground">
                          {areas.slice(0, 3).join(", ")}
                          {areas.length > 3 && ` +${areas.length - 3} more`}
                        </p>
                      </div>
                    )}

                    {/* Languages */}
                    {languages.length > 1 && (
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-primary shrink-0" />
                        <p className="text-sm text-muted-foreground">
                          {languages.join(", ")}
                        </p>
                      </div>
                    )}

                    {/* Specialties as tags */}
                    <div className="flex flex-wrap gap-2">
                      {specialties.slice(0, 3).map((s) => (
                        <span
                          key={s}
                          className="px-3 py-1 text-xs rounded-full bg-primary/10 text-primary font-medium"
                        >
                          {s}
                        </span>
                      ))}
                    </div>

                    {/* CTA */}
                    <div className="flex items-center gap-2 text-sm font-bold text-primary uppercase tracking-wider pt-2 group-hover:gap-3 transition-all duration-300">
                      View Profile <ExternalLink className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 border-t">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-heading font-bold text-center mb-4">
            Everything You Need
          </h2>
          <p className="text-center text-muted-foreground mb-16 max-w-lg mx-auto">
            Professional tools that work for you around the clock.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {FEATURES.map((feature, i) => (
              <div
                key={i}
                className="p-6 bg-card border border-border rounded-xl hover:border-primary/30 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t">
        <div className="container mx-auto px-6 text-center max-w-2xl">
          <h2 className="text-4xl font-heading font-bold mb-4">Ready to Stand Out?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join real estate agents who are using AI to capture more leads and close more deals.
          </p>
          <Button
            onClick={() => navigate("/register")}
            size="lg"
            className="text-lg px-10 py-7 font-bold uppercase tracking-wider"
          >
            Get Started Free
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Kevv AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
