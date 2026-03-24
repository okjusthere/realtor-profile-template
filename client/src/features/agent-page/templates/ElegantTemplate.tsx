import FloatingChat from "@/components/FloatingChat";
import { Phone, Mail, MapPin, Star, Award, ArrowRight } from "lucide-react";
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
 * Elegant Template — 2026 glassmorphism, soft gradients, frosted cards, premium feel.
 * Inspired by: Apple, Notion, Arc Browser design language.
 */
export default function ElegantTemplate({
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
    <div className="min-h-screen font-sans" style={{
      background: "linear-gradient(135deg, #fef9f0 0%, #f0f4ff 30%, #fdf2f8 60%, #f0fdf4 100%)"
    }}>
      {/* Floating Nav */}
      <header className="sticky top-0 z-50 px-4 pt-4">
        <div className="max-w-5xl mx-auto bg-white/70 backdrop-blur-xl rounded-2xl border border-gray-200/60 shadow-lg shadow-gray-200/20 px-5 py-3 flex justify-between items-center">
          <span className="text-sm font-bold text-gray-900 tracking-tight">
            {agent.name.split(" ")[0]}
            <span className="text-gray-400 font-normal"> · {agent.title || "Agent"}</span>
          </span>
          <nav className="hidden md:flex items-center gap-5 text-sm text-gray-500">
            <a href="#about" className="hover:text-gray-900 transition-colors">About</a>
            <a href="#transactions" className="hover:text-gray-900 transition-colors">Work</a>
            <a href="#testimonials" className="hover:text-gray-900 transition-colors">Reviews</a>
            <a href="#contact" className="inline-flex items-center gap-1.5 bg-gray-900 text-white px-4 py-1.5 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors">
              Contact <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </nav>
          {/* Mobile CTA */}
          <a href="#contact" className="md:hidden bg-gray-900 text-white px-4 py-1.5 rounded-full text-sm font-medium">
            Contact
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-4 pt-12 pb-16 md:pt-20 md:pb-24">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
          {/* Photo */}
          <div className="relative">
            <div className="w-40 h-40 md:w-56 md:h-56 rounded-3xl overflow-hidden shadow-2xl shadow-purple-200/40 ring-1 ring-black/5">
              <img
                src={agent.photoUrl || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&h=500&fit=crop&crop=faces"}
                alt={agent.name}
                className="w-full h-full object-cover"
              />
            </div>
            {/* Decorative dots */}
            <div className="absolute -bottom-3 -right-3 w-8 h-8 rounded-xl bg-gradient-to-br from-purple-400 to-pink-400 opacity-60" />
            <div className="absolute -top-2 -left-2 w-5 h-5 rounded-lg bg-gradient-to-br from-blue-400 to-cyan-400 opacity-40" />
          </div>
          {/* Text */}
          <div className="text-center md:text-left flex-1">
            <p className="text-sm font-medium text-purple-600/80 mb-2">
              {agent.brokerage || "Real Estate Professional"}
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.1] mb-4 tracking-tight">
              {agent.name}
            </h1>
            <p className="text-gray-500 text-lg max-w-lg leading-relaxed mb-6">
              {agent.bio?.slice(0, 180) || `${agent.title || "Agent"} helping you navigate real estate with care and expertise.`}
            </p>
            {serviceAreas.length > 0 && (
              <div className="flex items-center justify-center md:justify-start gap-1.5 text-sm text-gray-400 mb-6">
                <MapPin className="h-3.5 w-3.5" />
                {serviceAreas.slice(0, 3).join(" · ")}
              </div>
            )}
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              {agent.phone && (
                <a href={`tel:${agent.phone}`} className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-2xl font-semibold text-sm hover:bg-gray-800 transition-all shadow-lg shadow-gray-900/10">
                  <Phone className="h-4 w-4" /> {agent.phone}
                </a>
              )}
              {agent.email && (
                <a href={`mailto:${agent.email}`} className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm text-gray-700 px-6 py-3 rounded-2xl font-semibold text-sm hover:bg-white transition-all border border-gray-200 shadow-sm">
                  <Mail className="h-4 w-4" /> Email
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats — frosted cards */}
      {(agent.yearsExperience || transactions.length > 0) && (
        <section className="max-w-5xl mx-auto px-4 pb-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {agent.yearsExperience && (
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 border border-white/80 shadow-sm text-center">
                <p className="text-3xl font-bold text-gray-900">{agent.yearsExperience}+</p>
                <p className="text-xs text-gray-500 mt-1 font-medium">Years Experience</p>
              </div>
            )}
            {transactions.length > 0 && (
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 border border-white/80 shadow-sm text-center">
                <p className="text-3xl font-bold text-gray-900">{transactions.length}</p>
                <p className="text-xs text-gray-500 mt-1 font-medium">Deals Done</p>
              </div>
            )}
            {serviceAreas.length > 0 && (
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 border border-white/80 shadow-sm text-center">
                <p className="text-3xl font-bold text-gray-900">{serviceAreas.length}</p>
                <p className="text-xs text-gray-500 mt-1 font-medium">Service Areas</p>
              </div>
            )}
            {testimonials.length > 0 && (
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 border border-white/80 shadow-sm text-center">
                <p className="text-3xl font-bold text-gray-900">{testimonials.length}</p>
                <p className="text-xs text-gray-500 mt-1 font-medium">Reviews</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* About — full bio */}
      <section id="about" className="max-w-3xl mx-auto px-4 pb-20">
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-white/80 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">About {firstName}</h2>
          <p className="text-gray-600 leading-relaxed text-lg whitespace-pre-line">
            {agent.bio || `${agent.name} is a dedicated real estate professional committed to excellence.`}
          </p>

          {specialties.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Specialties</h3>
              <div className="flex flex-wrap gap-2">
                {specialties.map(s => (
                  <span key={s} className="bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 px-3.5 py-1.5 rounded-xl text-sm font-medium border border-purple-100">{s}</span>
                ))}
              </div>
            </div>
          )}

          {awards.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Awards</h3>
              <div className="space-y-2">
                {awards.map(a => (
                  <div key={a} className="flex items-center gap-2 text-gray-600 text-sm">
                    <Award className="h-4 w-4 text-amber-500 flex-shrink-0" /> {a}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Transactions */}
      {transactions.length > 0 && (
        <section id="transactions" className="max-w-5xl mx-auto px-4 pb-20">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Transactions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {transactions.slice(0, 8).map((tx, i) => (
              <div key={i} className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-white/80 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{tx.address}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{tx.city} · {tx.type || "Closed"}</p>
                </div>
                <p className="font-bold text-gray-900">{tx.price}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section id="testimonials" className="max-w-4xl mx-auto px-4 pb-20">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">What Clients Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {testimonials.slice(0, 4).map((t, i) => (
              <div key={i} className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/80 shadow-sm">
                <div className="flex gap-0.5 mb-3">
                  {[...Array(t.rating || 5)].map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-600 italic leading-relaxed text-sm">"{t.text}"</p>
                <p className="mt-4 font-bold text-sm text-gray-900">— {t.name}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Contact */}
      {showContact && (
        <section className="max-w-xl mx-auto px-4 pb-20">
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-white/80 shadow-sm">
            <AgentContact agentSlug={slug} firstName={firstName} />
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="text-center py-8 text-xs text-gray-400">
        <p>© {new Date().getFullYear()} {agent.brokerage || "Kevv AI Inc."} · All Rights Reserved</p>
        <p className="mt-2 text-gray-300">Powered by Kevv AI</p>
      </footer>

      {showChat && !preview && <FloatingChat agentSlug={slug} agentName={firstName} />}
    </div>
  );
}
