import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import FloatingChat from "@/components/FloatingChat";
import { Phone, Mail, MapPin, Star, Award, Home, Calendar, ArrowRight } from "lucide-react";
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
 * Classic Template — traditional, professional, top-down layout.
 * Target: established agents who want a trustworthy, timeless feel.
 */
export default function ClassicTemplate({
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
    <div className="min-h-screen bg-stone-50 text-stone-900 font-serif">
      {/* Classic Header */}
      <header className="bg-stone-900 text-white py-3">
        <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
          <span className="text-sm tracking-widest uppercase font-sans">
            {agent.brokerage || "Kevv AI"}
          </span>
          <div className="hidden md:flex items-center gap-6 text-xs tracking-wider uppercase font-sans">
            <a href="#about" className="hover:text-amber-400 transition-colors">About</a>
            <a href="#transactions" className="hover:text-amber-400 transition-colors">Portfolio</a>
            <a href="#testimonials" className="hover:text-amber-400 transition-colors">Reviews</a>
            <a href="#contact" className="hover:text-amber-400 transition-colors">Contact</a>
          </div>
        </div>
      </header>

      {/* Hero — Centered photo + name */}
      <section className="bg-stone-900 text-white pb-16 pt-12">
        <div className="max-w-4xl mx-auto px-6 flex flex-col md:flex-row items-center gap-8">
          <div className="w-48 h-48 md:w-56 md:h-56 rounded-full overflow-hidden border-4 border-amber-500/40 shadow-2xl flex-shrink-0">
            <img
              src={agent.photoUrl || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=faces"}
              alt={agent.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-bold mb-2">{agent.name}</h1>
            <p className="text-amber-400 text-lg font-sans tracking-wide">
              {agent.title || "Licensed Real Estate Agent"}
            </p>
            {serviceAreas.length > 0 && (
              <p className="text-stone-400 text-sm mt-2 font-sans flex items-center justify-center md:justify-start gap-1">
                <MapPin className="h-3.5 w-3.5" /> {serviceAreas.slice(0, 3).join(" · ")}
              </p>
            )}
            <div className="flex gap-3 mt-5 justify-center md:justify-start">
              {agent.phone && (
                <a href={`tel:${agent.phone}`} className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 rounded-md text-sm font-sans font-semibold transition-colors">
                  <Phone className="h-4 w-4" /> {agent.phone}
                </a>
              )}
              {agent.email && (
                <a href={`mailto:${agent.email}`} className="inline-flex items-center gap-2 border border-stone-600 hover:border-amber-500 text-white px-5 py-2.5 rounded-md text-sm font-sans transition-colors">
                  <Mail className="h-4 w-4" /> Email
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Experience Stats */}
      <section className="bg-white border-y border-stone-200 py-8">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {agent.yearsExperience && (
            <div>
              <p className="text-3xl font-bold text-stone-900">{agent.yearsExperience}+</p>
              <p className="text-xs text-stone-500 uppercase tracking-wider font-sans mt-1">Years in Business</p>
            </div>
          )}
          {transactions.length > 0 && (
            <div>
              <p className="text-3xl font-bold text-stone-900">{transactions.length}</p>
              <p className="text-xs text-stone-500 uppercase tracking-wider font-sans mt-1">Properties Sold</p>
            </div>
          )}
          {serviceAreas.length > 0 && (
            <div>
              <p className="text-3xl font-bold text-stone-900">{serviceAreas.length}</p>
              <p className="text-xs text-stone-500 uppercase tracking-wider font-sans mt-1">Service Areas</p>
            </div>
          )}
          {testimonials.length > 0 && (
            <div>
              <p className="text-3xl font-bold text-stone-900">{testimonials.length}</p>
              <p className="text-xs text-stone-500 uppercase tracking-wider font-sans mt-1">Happy Clients</p>
            </div>
          )}
        </div>
      </section>

      {/* About */}
      <section id="about" className="max-w-3xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold mb-1 text-center">About {firstName}</h2>
        <div className="w-12 h-0.5 bg-amber-500 mx-auto mt-3 mb-8" />
        <p className="text-stone-700 leading-relaxed text-lg text-center whitespace-pre-line">
          {agent.bio || `${agent.name} brings dedication, expertise, and a client-first approach to every real estate transaction.`}
        </p>

        {specialties.length > 0 && (
          <div className="mt-10 text-center">
            <h3 className="text-xs font-sans font-semibold uppercase tracking-widest text-stone-400 mb-4">Areas of Expertise</h3>
            <div className="flex flex-wrap gap-2 justify-center">
              {specialties.map(s => (
                <span key={s} className="border border-stone-300 text-stone-700 px-4 py-1.5 rounded-md text-sm font-sans">{s}</span>
              ))}
            </div>
          </div>
        )}

        {awards.length > 0 && (
          <div className="mt-10 text-center">
            <h3 className="text-xs font-sans font-semibold uppercase tracking-widest text-stone-400 mb-4">Awards & Recognition</h3>
            <div className="space-y-2">
              {awards.map(a => (
                <div key={a} className="flex items-center justify-center gap-2 text-stone-700 font-sans text-sm">
                  <Award className="h-4 w-4 text-amber-500" /> {a}
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Transactions */}
      {transactions.length > 0 && (
        <section id="transactions" className="bg-white py-16 border-t border-stone-200">
          <div className="max-w-5xl mx-auto px-6">
            <h2 className="text-3xl font-bold mb-1 text-center">Transaction Portfolio</h2>
            <div className="w-12 h-0.5 bg-amber-500 mx-auto mt-3 mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {transactions.slice(0, 8).map((tx, i) => (
                <div key={i} className="flex items-center justify-between border border-stone-200 rounded-lg p-4 hover:border-amber-400 transition-colors">
                  <div>
                    <p className="font-semibold text-stone-900 font-sans text-sm">{tx.address}</p>
                    <p className="text-xs text-stone-500 mt-0.5">
                      {tx.type || "Closed"}{tx.city && ` · ${tx.city}`}
                    </p>
                  </div>
                  <p className="font-bold text-stone-900 font-sans">{tx.price}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section id="testimonials" className="py-16">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-3xl font-bold mb-1 text-center">Client Testimonials</h2>
            <div className="w-12 h-0.5 bg-amber-500 mx-auto mt-3 mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {testimonials.slice(0, 4).map((t, i) => (
                <div key={i} className="bg-white border border-stone-200 rounded-lg p-6 shadow-sm">
                  <div className="flex gap-0.5 mb-3">
                    {[...Array(t.rating || 5)].map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-stone-700 italic leading-relaxed text-sm">"{t.text}"</p>
                  <p className="mt-4 font-bold text-xs text-stone-900 font-sans uppercase tracking-wider">— {t.name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact */}
      {showContact && (
        <section className="bg-white border-t border-stone-200 py-16">
          <div className="max-w-xl mx-auto px-6">
            <AgentContact agentSlug={slug} firstName={firstName} />
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-stone-900 text-white text-center py-8 text-xs font-sans">
        <p>© {new Date().getFullYear()} {agent.brokerage || "Kevv AI Inc."}. All Rights Reserved.</p>
        <p className="mt-2 text-stone-500">Powered by Kevv AI</p>
      </footer>

      {showChat && !preview && <FloatingChat agentSlug={slug} agentName={firstName} />}
    </div>
  );
}
