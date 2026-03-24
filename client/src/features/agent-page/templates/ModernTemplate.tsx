import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import FloatingChat from "@/components/FloatingChat";
import { Loader2, Phone, Mail, MapPin, Star, Award, Calendar, ChevronRight } from "lucide-react";
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
 * Modern Template — bright, full-width hero image, clean typography, card-based layout.
 * Target: new-generation agents who want a fresh, approachable look.
 */
export default function ModernTemplate({
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
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      {/* Hero — Full-width image with text overlay */}
      <section className="relative h-[70vh] md:h-[80vh] overflow-hidden">
        <img
          src={agent.photoUrl || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1400&h=900&fit=crop&crop=faces"}
          alt={agent.name}
          className="w-full h-full object-cover"
          style={{ objectPosition: "50% 25%" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 lg:p-16">
          <div className="max-w-4xl">
            <p className="text-blue-300 text-sm font-semibold tracking-wider uppercase mb-2">
              {agent.title || "Real Estate Agent"}
            </p>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-3 leading-tight">
              {agent.name}
            </h1>
            <p className="text-gray-300 text-lg">
              {agent.brokerage && <span>{agent.brokerage} · </span>}
              {serviceAreas.length > 0 && serviceAreas.slice(0, 3).join(", ")}
            </p>
            <div className="flex gap-3 mt-6">
              {agent.phone && (
                <a href={`tel:${agent.phone}`} className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-colors">
                  <Phone className="h-4 w-4" /> Call {firstName}
                </a>
              )}
              <a href="#contact" className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-colors border border-white/30">
                <Mail className="h-4 w-4" /> Send Message
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-6 flex flex-wrap justify-center gap-8 md:gap-16">
          {agent.yearsExperience && (
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{agent.yearsExperience}+</p>
              <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">Years Experience</p>
            </div>
          )}
          {transactions.length > 0 && (
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{transactions.length}</p>
              <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">Transactions</p>
            </div>
          )}
          {serviceAreas.length > 0 && (
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{serviceAreas.length}</p>
              <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">Areas Served</p>
            </div>
          )}
          {specialties.length > 0 && (
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{specialties.length}</p>
              <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">Specialties</p>
            </div>
          )}
        </div>
      </section>

      {/* About */}
      <section id="about" className="max-w-3xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold mb-6">About {firstName}</h2>
        <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-line">
          {agent.bio || `${agent.name} is a dedicated real estate professional committed to helping clients buy and sell with confidence.`}
        </p>

        {specialties.length > 0 && (
          <div className="mt-8">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-3">Specialties</h3>
            <div className="flex flex-wrap gap-2">
              {specialties.map(s => (
                <span key={s} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">{s}</span>
              ))}
            </div>
          </div>
        )}

        {awards.length > 0 && (
          <div className="mt-8">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-3">Awards & Recognition</h3>
            <div className="space-y-2">
              {awards.map(a => (
                <div key={a} className="flex items-center gap-2 text-gray-700">
                  <Award className="h-4 w-4 text-yellow-500" /> {a}
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Transactions */}
      {transactions.length > 0 && (
        <section id="transactions" className="bg-gray-50 py-16">
          <div className="max-w-5xl mx-auto px-6">
            <h2 className="text-2xl font-bold mb-8 text-center">Recent Transactions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {transactions.slice(0, 6).map((tx, i) => (
                <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <p className="font-semibold text-gray-900 mb-1">{tx.address}</p>
                  <p className="text-blue-600 font-bold text-lg">{tx.price}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${tx.type === "Sold" ? "bg-green-50 text-green-700" : tx.type === "Listed" ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-gray-600"}`}>
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
        <section id="testimonials" className="max-w-4xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-bold mb-8 text-center">What Clients Say</h2>
          <div className="space-y-6">
            {testimonials.slice(0, 4).map((t, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="flex gap-1 mb-3">
                  {[...Array(t.rating || 5)].map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 italic leading-relaxed">"{t.text}"</p>
                <p className="mt-3 font-semibold text-sm text-gray-900">— {t.name}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Contact */}
      {showContact && (
        <section className="bg-gray-50 py-16">
          <div className="max-w-xl mx-auto px-6">
            <AgentContact agentSlug={slug} firstName={firstName} />
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="text-center py-8 text-xs text-gray-400">
        <p>© {new Date().getFullYear()} {agent.brokerage || "Kevv AI Inc."}. All Rights Reserved.</p>
        <p className="mt-2">Powered by Kevv AI</p>
      </footer>

      {showChat && !preview && <FloatingChat agentSlug={slug} agentName={firstName} />}
    </div>
  );
}
