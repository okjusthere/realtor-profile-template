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
 * Minimal Template — 2026 editorial, whitespace-heavy, magazine-style.
 * Inspired by: Kinfolk, Cereal magazine, luxury brand lookbooks.
 */
export default function MinimalTemplate({
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
    <div className="min-h-screen bg-[#fafaf8] text-[#1a1a1a] font-sans">
      {/* Minimal Header */}
      <header className="px-6 md:px-12 py-6 flex justify-between items-center max-w-6xl mx-auto">
        <span className="text-xs tracking-[0.4em] uppercase text-gray-400 font-light">
          {agent.brokerage || "Real Estate"}
        </span>
        <a href="#contact" className="text-xs tracking-[0.3em] uppercase text-gray-400 hover:text-gray-900 transition-colors font-light">
          Contact
        </a>
      </header>

      {/* Hero — Large photo with minimal text */}
      <section className="max-w-5xl mx-auto px-6 md:px-12 pb-20 md:pb-32">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-end">
          {/* Photo — takes up most of the space */}
          <div className="md:col-span-7 aspect-[3/4] md:aspect-[4/5] rounded-sm overflow-hidden">
            <img
              src={agent.photoUrl || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=900&h=1200&fit=crop&crop=faces"}
              alt={agent.name}
              className="w-full h-full object-cover grayscale-[20%] hover:grayscale-0 transition-all duration-700"
              style={{ objectPosition: "50% 20%" }}
            />
          </div>
          {/* Text — minimal, to the side */}
          <div className="md:col-span-5 pb-4">
            <h1 className="text-4xl md:text-5xl font-light tracking-tight leading-[1.1] mb-6">
              {agent.name}
            </h1>
            <div className="w-8 h-px bg-gray-300 mb-6" />
            <p className="text-sm text-gray-500 leading-relaxed mb-6 font-light">
              {agent.bio?.slice(0, 200) || `${agent.title || "Real Estate Agent"}. Guiding clients through every step with care and precision.`}
            </p>
            {serviceAreas.length > 0 && (
              <p className="text-xs text-gray-400 tracking-wider mb-8">
                {serviceAreas.slice(0, 3).join(" · ")}
              </p>
            )}
            <div className="space-y-3">
              {agent.phone && (
                <a href={`tel:${agent.phone}`} className="flex items-center gap-3 text-sm text-gray-600 hover:text-gray-900 transition-colors group">
                  <Phone className="h-3.5 w-3.5 text-gray-400 group-hover:text-gray-700" /> {agent.phone}
                </a>
              )}
              {agent.email && (
                <a href={`mailto:${agent.email}`} className="flex items-center gap-3 text-sm text-gray-600 hover:text-gray-900 transition-colors group">
                  <Mail className="h-3.5 w-3.5 text-gray-400 group-hover:text-gray-700" /> {agent.email}
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* About — editorial layout */}
      <section id="about" className="max-w-3xl mx-auto px-6 md:px-12 pb-20 md:pb-28">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <p className="text-xs tracking-[0.3em] uppercase text-gray-400 font-light">About</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-gray-600 leading-[1.8] font-light whitespace-pre-line">
              {agent.bio || `${agent.name} is a dedicated real estate professional with an eye for detail and a passion for connecting people with their ideal homes.`}
            </p>

            {specialties.length > 0 && (
              <div className="mt-10 pt-8 border-t border-gray-200">
                <p className="text-xs tracking-[0.3em] uppercase text-gray-400 font-light mb-4">Focus Areas</p>
                <div className="flex flex-wrap gap-x-6 gap-y-2">
                  {specialties.map(s => (
                    <span key={s} className="text-sm text-gray-600 font-light">{s}</span>
                  ))}
                </div>
              </div>
            )}

            {awards.length > 0 && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <p className="text-xs tracking-[0.3em] uppercase text-gray-400 font-light mb-4">Recognition</p>
                <div className="space-y-2">
                  {awards.map(a => (
                    <p key={a} className="text-sm text-gray-600 font-light">{a}</p>
                  ))}
                </div>
              </div>
            )}

            {agent.yearsExperience && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <p className="text-xs tracking-[0.3em] uppercase text-gray-400 font-light mb-2">Experience</p>
                <p className="text-2xl font-light text-gray-900">{agent.yearsExperience} years</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Transactions — minimal table */}
      {transactions.length > 0 && (
        <section id="transactions" className="max-w-3xl mx-auto px-6 md:px-12 pb-20 md:pb-28">
          <p className="text-xs tracking-[0.3em] uppercase text-gray-400 font-light mb-8">Selected Work</p>
          <div className="space-y-0">
            {transactions.slice(0, 8).map((tx, i) => (
              <div key={i} className="flex items-center justify-between py-4 border-b border-gray-100 group hover:border-gray-300 transition-colors">
                <div>
                  <p className="text-sm text-gray-900 font-normal">{tx.address}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{tx.city}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-900 font-medium">{tx.price}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{tx.type || "Closed"}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Testimonials — quote style */}
      {testimonials.length > 0 && (
        <section id="testimonials" className="max-w-3xl mx-auto px-6 md:px-12 pb-20 md:pb-28">
          <p className="text-xs tracking-[0.3em] uppercase text-gray-400 font-light mb-8">Kind Words</p>
          <div className="space-y-12">
            {testimonials.slice(0, 3).map((t, i) => (
              <div key={i}>
                <blockquote className="text-xl md:text-2xl font-light text-gray-800 leading-relaxed italic">
                  "{t.text}"
                </blockquote>
                <p className="mt-4 text-xs tracking-[0.2em] uppercase text-gray-400 font-light">— {t.name}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Contact */}
      {showContact && (
        <section className="max-w-xl mx-auto px-6 md:px-12 pb-20">
          <AgentContact agentSlug={slug} firstName={firstName} />
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-gray-200 text-center py-10">
        <p className="text-xs tracking-[0.3em] uppercase text-gray-300 font-light">
          © {new Date().getFullYear()} {agent.brokerage || "Kevv AI Inc."}
        </p>
        <p className="mt-2 text-xs text-gray-300 tracking-wider font-light">Powered by Kevv AI</p>
      </footer>

      {showChat && !preview && <FloatingChat agentSlug={slug} agentName={firstName} />}
    </div>
  );
}
