import FloatingChat from "@/components/FloatingChat";
import { Phone, Mail, MapPin, Star, Award, Zap, ArrowUpRight } from "lucide-react";
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
 * Urban Template — 2026 dark mode, neon accents, edgy, motion-rich.
 * Inspired by: gaming sites, cyberpunk aesthetics, high-energy branding.
 */
export default function UrbanTemplate({
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
    <div className="min-h-screen bg-[#0c0c14] text-white font-sans overflow-x-hidden">
      {/* Glow effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] bg-fuchsia-500/8 rounded-full blur-[100px]" />
      </div>

      {/* Nav */}
      <header className="relative z-20 px-6 py-5 flex justify-between items-center max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-cyan-400" />
          <span className="text-sm font-bold tracking-wider uppercase">{firstName}</span>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-xs tracking-widest uppercase text-gray-500">
          <a href="#about" className="hover:text-cyan-400 transition-colors">About</a>
          <a href="#transactions" className="hover:text-cyan-400 transition-colors">Deals</a>
          <a href="#testimonials" className="hover:text-cyan-400 transition-colors">Reviews</a>
          <a href="#contact" className="bg-cyan-500 text-black px-4 py-1.5 rounded-sm font-bold hover:bg-cyan-400 transition-colors">
            Contact
          </a>
        </nav>
        <a href="#contact" className="md:hidden bg-cyan-500 text-black px-4 py-1.5 rounded-sm text-xs font-bold">
          Contact
        </a>
      </header>

      {/* Hero */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-12 md:pt-20 pb-20 md:pb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">
          {/* Text */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs tracking-widest uppercase text-cyan-400/80 font-medium">
                {agent.title || "Real Estate Agent"}
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-[0.95] tracking-tight mb-6">
              {agent.name.split(" ").map((word, i) => (
                <span key={i} className={`block ${i > 0 ? "text-transparent bg-gradient-to-r from-cyan-400 to-fuchsia-400 bg-clip-text" : ""}`}>
                  {word}
                </span>
              ))}
            </h1>
            <p className="text-gray-400 text-lg leading-relaxed mb-6 max-w-md">
              {agent.bio?.slice(0, 150) || "Bringing energy and expertise to every deal."}
            </p>
            {serviceAreas.length > 0 && (
              <p className="text-xs text-gray-600 tracking-wider uppercase mb-8 flex items-center gap-1.5">
                <MapPin className="h-3 w-3" /> {serviceAreas.slice(0, 3).join(" · ")}
              </p>
            )}
            <div className="flex flex-wrap gap-3">
              {agent.phone && (
                <a href={`tel:${agent.phone}`} className="group inline-flex items-center gap-2 bg-cyan-500 text-black px-6 py-3 rounded-sm font-bold text-sm hover:bg-cyan-400 transition-all">
                  <Phone className="h-4 w-4" /> Call
                  <ArrowUpRight className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100" />
                </a>
              )}
              <a href="#contact" className="inline-flex items-center gap-2 border border-gray-700 hover:border-cyan-500/50 px-6 py-3 rounded-sm font-bold text-sm text-gray-300 hover:text-cyan-400 transition-all">
                <Mail className="h-4 w-4" /> Message
              </a>
            </div>
          </div>
          {/* Photo */}
          <div className="relative">
            <div className="aspect-[3/4] rounded-sm overflow-hidden border border-gray-800">
              <img
                src={agent.photoUrl || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=1100&fit=crop&crop=faces"}
                alt={agent.name}
                className="w-full h-full object-cover"
                style={{ objectPosition: "50% 20%" }}
              />
              {/* Neon border overlay */}
              <div className="absolute inset-0 border border-cyan-400/20 rounded-sm pointer-events-none" />
              <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-[#0c0c14] to-transparent" />
            </div>
            {/* Stats overlay on photo */}
            <div className="absolute bottom-4 left-4 right-4 grid grid-cols-2 gap-2">
              {agent.yearsExperience && (
                <div className="bg-black/70 backdrop-blur-sm border border-gray-800 rounded-sm p-3 text-center">
                  <p className="text-lg font-black text-cyan-400">{agent.yearsExperience}+</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">Years</p>
                </div>
              )}
              {transactions.length > 0 && (
                <div className="bg-black/70 backdrop-blur-sm border border-gray-800 rounded-sm p-3 text-center">
                  <p className="text-lg font-black text-fuchsia-400">{transactions.length}</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">Deals</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="relative z-10 border-t border-gray-800/50 py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-px bg-cyan-500" />
            <span className="text-xs tracking-widest uppercase text-cyan-400/80 font-medium">About</span>
          </div>
          <p className="text-gray-400 text-lg leading-relaxed whitespace-pre-line max-w-2xl">
            {agent.bio || `${agent.name} delivers results with intensity and precision in every market.`}
          </p>

          {specialties.length > 0 && (
            <div className="mt-10 flex flex-wrap gap-2">
              {specialties.map(s => (
                <span key={s} className="px-4 py-2 rounded-sm border border-gray-800 text-gray-400 text-sm font-medium hover:border-cyan-500/40 hover:text-cyan-400 transition-colors cursor-default">{s}</span>
              ))}
            </div>
          )}

          {awards.length > 0 && (
            <div className="mt-8 space-y-2">
              {awards.map(a => (
                <div key={a} className="flex items-center gap-2 text-gray-500 text-sm">
                  <Award className="h-4 w-4 text-fuchsia-400/60 flex-shrink-0" /> {a}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Transactions */}
      {transactions.length > 0 && (
        <section id="transactions" className="relative z-10 border-t border-gray-800/50 py-20 md:py-28">
          <div className="max-w-5xl mx-auto px-6">
            <div className="flex items-center gap-2 mb-8">
              <div className="w-8 h-px bg-fuchsia-500" />
              <span className="text-xs tracking-widest uppercase text-fuchsia-400/80 font-medium">Deal Flow</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {transactions.slice(0, 9).map((tx, i) => (
                <div key={i} className="bg-white/[0.02] border border-gray-800 rounded-sm p-4 hover:border-cyan-500/30 transition-all group">
                  <p className="font-bold text-sm text-white group-hover:text-cyan-400 transition-colors">{tx.address}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{tx.city}</p>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-800/50">
                    <span className="text-sm font-black text-cyan-400">{tx.price}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-600 px-2 py-0.5 border border-gray-800 rounded-sm">
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
        <section id="testimonials" className="relative z-10 border-t border-gray-800/50 py-20 md:py-28">
          <div className="max-w-4xl mx-auto px-6">
            <div className="flex items-center gap-2 mb-8">
              <div className="w-8 h-px bg-yellow-500" />
              <span className="text-xs tracking-widest uppercase text-yellow-400/80 font-medium">Social Proof</span>
            </div>
            <div className="space-y-4">
              {testimonials.slice(0, 4).map((t, i) => (
                <div key={i} className="bg-white/[0.02] border border-gray-800 rounded-sm p-6 hover:border-fuchsia-500/20 transition-all">
                  <div className="flex gap-0.5 mb-3">
                    {[...Array(t.rating || 5)].map((_, j) => (
                      <Star key={j} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-400 italic leading-relaxed">"{t.text}"</p>
                  <p className="mt-3 text-xs font-bold text-gray-600 uppercase tracking-wider">— {t.name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact */}
      {showContact && (
        <section className="relative z-10 border-t border-gray-800/50 py-20 md:py-28">
          <div className="max-w-xl mx-auto px-6">
            <AgentContact agentSlug={slug} firstName={firstName} />
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-800/50 text-center py-8 text-xs text-gray-700">
        <p>© {new Date().getFullYear()} {agent.brokerage || "Kevv AI Inc."} · All Rights Reserved</p>
        <p className="mt-2 text-gray-800">Powered by Kevv AI</p>
      </footer>

      {showChat && !preview && <FloatingChat agentSlug={slug} agentName={firstName} />}
    </div>
  );
}
