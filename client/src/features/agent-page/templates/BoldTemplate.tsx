import FloatingChat from "@/components/FloatingChat";
import { Phone, Mail, MapPin, Star, Award, ArrowUpRight, ChevronDown } from "lucide-react";
import AgentContact from "../AgentContact";
import { useAgentSEO } from "../AgentSEO";
import type { AgentProfileData } from "../AgentPage";
import type { Transaction } from "../AgentTransactions";
import type { Testimonial } from "../AgentTestimonials";

type TemplateProps = {
  profile: AgentProfileData;
  slug: string;
  showChat?: boolean;
  showContact?: boolean;
  preview?: boolean;
};

/**
 * Bold Template — 2026 gradient hero, vibrant colors, big type, motion-forward.
 * Inspired by: Stripe, Linear, Vercel marketing pages.
 */
export default function BoldTemplate({
  profile: agent,
  slug,
  showChat = true,
  showContact = true,
  preview = false,
}: TemplateProps) {
  useAgentSEO(preview ? null : agent);

  const serviceAreas = (agent.serviceAreas ?? []) as string[];
  const specialties = (agent.specialties ?? []) as string[];
  const transactions = (agent.transactions ?? []) as Transaction[];
  const testimonials = (agent.testimonials ?? []) as Testimonial[];
  const awards = (agent.awards ?? []) as string[];
  const firstName = agent.name.split(" ")[0];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans overflow-x-hidden">
      {/* Gradient Hero */}
      <section className="relative min-h-[100svh] flex flex-col justify-end pb-12 px-6 md:px-12 lg:px-20 overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0" style={{
            background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(120,119,198,0.35) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 20%, rgba(255,100,100,0.2) 0%, transparent 50%), radial-gradient(ellipse 50% 40% at 20% 80%, rgba(100,200,255,0.15) 0%, transparent 50%)"
          }} />
        </div>
        {/* Agent photo as accent */}
        <div className="absolute top-8 right-6 md:top-12 md:right-12 lg:right-20 z-10">
          <div className="w-20 h-20 md:w-32 md:h-32 lg:w-44 lg:h-44 rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl shadow-purple-500/20">
            <img
              src={agent.photoUrl || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=faces"}
              alt={agent.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="relative z-10 max-w-3xl">
          <p className="text-sm md:text-base font-medium text-purple-300 mb-4 tracking-wider uppercase">
            {agent.brokerage || "Real Estate"} · {serviceAreas.slice(0, 2).join(" & ")}
          </p>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-[0.9] tracking-tight mb-6">
            {agent.name.split(" ").map((word, i) => (
              <span key={i} className="block">{word}</span>
            ))}
          </h1>
          <p className="text-lg md:text-xl text-white/60 max-w-xl mb-8 leading-relaxed">
            {agent.bio?.slice(0, 160) || `${agent.title || "Real Estate Agent"} dedicated to finding your perfect home.`}
          </p>
          <div className="flex flex-wrap gap-3">
            {agent.phone && (
              <a href={`tel:${agent.phone}`} className="group inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-bold text-sm hover:bg-purple-100 transition-all">
                <Phone className="h-4 w-4" /> Call Now
                <ArrowUpRight className="h-3.5 w-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />
              </a>
            )}
            <a href="#contact" className="inline-flex items-center gap-2 border border-white/20 hover:border-white/40 px-6 py-3 rounded-full font-bold text-sm text-white/80 hover:text-white transition-all backdrop-blur-sm">
              <Mail className="h-4 w-4" /> Get in Touch
            </a>
          </div>
        </div>

        <a href="#about" className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 text-white/30 hover:text-white/60 transition-colors animate-bounce">
          <ChevronDown className="h-6 w-6" />
        </a>
      </section>

      {/* Stats Band */}
      <section className="border-t border-white/10 bg-white/[0.02] backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {agent.yearsExperience && (
            <div>
              <p className="text-4xl md:text-5xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">{agent.yearsExperience}+</p>
              <p className="text-xs text-white/40 uppercase tracking-widest mt-2 font-medium">Years</p>
            </div>
          )}
          {transactions.length > 0 && (
            <div>
              <p className="text-4xl md:text-5xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">{transactions.length}</p>
              <p className="text-xs text-white/40 uppercase tracking-widest mt-2 font-medium">Deals Closed</p>
            </div>
          )}
          {serviceAreas.length > 0 && (
            <div>
              <p className="text-4xl md:text-5xl font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">{serviceAreas.length}</p>
              <p className="text-xs text-white/40 uppercase tracking-widest mt-2 font-medium">Markets</p>
            </div>
          )}
          {testimonials.length > 0 && (
            <div>
              <p className="text-4xl md:text-5xl font-black bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">{testimonials.length}</p>
              <p className="text-xs text-white/40 uppercase tracking-widest mt-2 font-medium">Happy Clients</p>
            </div>
          )}
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="max-w-4xl mx-auto px-6 py-20 md:py-28">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-purple-400 mb-4">About</p>
        <h2 className="text-3xl md:text-4xl font-black mb-8 leading-tight">
          Meet {firstName}.<br />
          <span className="text-white/40">{agent.title || "Your Next Real Estate Partner"}</span>
        </h2>
        <p className="text-white/60 text-lg leading-relaxed whitespace-pre-line">
          {agent.bio || `${agent.name} brings dedication and expertise to every real estate transaction.`}
        </p>

        {specialties.length > 0 && (
          <div className="mt-10 flex flex-wrap gap-2">
            {specialties.map(s => (
              <span key={s} className="px-4 py-2 rounded-full border border-white/10 text-white/50 text-sm font-medium hover:border-purple-400/50 hover:text-purple-300 transition-colors">{s}</span>
            ))}
          </div>
        )}

        {awards.length > 0 && (
          <div className="mt-10 space-y-3">
            {awards.map(a => (
              <div key={a} className="flex items-center gap-3 text-white/50 text-sm">
                <Award className="h-4 w-4 text-yellow-400/80 flex-shrink-0" /> {a}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Transactions */}
      {transactions.length > 0 && (
        <section id="transactions" className="border-t border-white/10 py-20 md:py-28">
          <div className="max-w-6xl mx-auto px-6">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-blue-400 mb-4">Portfolio</p>
            <h2 className="text-3xl md:text-4xl font-black mb-10">Recent Deals</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {transactions.slice(0, 9).map((tx, i) => (
                <div key={i} className="group bg-white/[0.03] border border-white/10 rounded-2xl p-5 hover:bg-white/[0.06] hover:border-purple-500/30 transition-all duration-300">
                  <p className="font-bold text-white mb-1">{tx.address}</p>
                  <p className="text-xs text-white/40">{tx.city}</p>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                    <span className="text-lg font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">{tx.price}</span>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/10 text-white/50">
                      {tx.type || "Closed"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section id="testimonials" className="border-t border-white/10 py-20 md:py-28">
          <div className="max-w-4xl mx-auto px-6">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-pink-400 mb-4">Testimonials</p>
            <h2 className="text-3xl md:text-4xl font-black mb-10">Client Love</h2>
            <div className="space-y-6">
              {testimonials.slice(0, 5).map((t, i) => (
                <div key={i} className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 md:p-8 hover:border-pink-500/20 transition-all duration-300">
                  <div className="flex gap-1 mb-4">
                    {[...Array(t.rating || 5)].map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-white/70 text-lg italic leading-relaxed">"{t.text}"</p>
                  <p className="mt-4 text-sm font-bold text-white/40 uppercase tracking-wider">— {t.name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact */}
      {showContact && (
        <section className="border-t border-white/10 py-20 md:py-28 bg-white/[0.02]">
          <div className="max-w-xl mx-auto px-6">
            <AgentContact agentSlug={slug} firstName={firstName} />
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-white/10 text-center py-8 text-xs text-white/20">
        <p>© {new Date().getFullYear()} {agent.brokerage || "Kevv AI Inc."} · All Rights Reserved</p>
        <p className="mt-2">Powered by Kevv AI</p>
      </footer>

      {showChat && !preview && <FloatingChat agentSlug={slug} agentName={firstName} />}
    </div>
  );
}
