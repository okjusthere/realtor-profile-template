/**
 * Property search service.
 * 
 * Priority: MLS/Zillow API → Tavily web search fallback.
 * To enable real MLS search:
 * 1. Sign up for RapidAPI Zillow API ($0.006/request)
 * 2. Set ZILLOW_API_KEY in env
 */

import { ENV } from "./_core/env";

export type PropertyListing = {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  type: string;
  status: string;
  imageUrl?: string;
  listingUrl?: string;
};

export type MarketStats = {
  area: string;
  medianPrice: number;
  avgDaysOnMarket: number;
  activeListings: number;
  priceChangeYoY: number;
};

export type PropertySearchParams = {
  city?: string;
  state?: string;
  zipCode?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  propertyType?: string;
  limit?: number;
};

/**
 * Search properties — uses Zillow API if configured, else falls back to Tavily web search.
 */
export async function searchProperties(
  params: PropertySearchParams
): Promise<PropertyListing[]> {
  // TODO: Uncomment when Zillow API is configured
  // if (process.env.ZILLOW_API_KEY) { ... real MLS search ... }
  
  console.log(`[PropertyService] Search for ${params.city || "unknown"} — no MLS API, using Tavily fallback`);
  return [];
}

/**
 * Tavily-powered fallback: search the web for listings when no MLS API is available.
 * Returns a human-readable string (not structured PropertyListing[]) for the AI.
 */
export async function searchPropertiesViaTavily(
  params: PropertySearchParams
): Promise<string> {
  if (!ENV.tavilyApiKey) {
    return "Property search is not available. Suggest the visitor contact the agent directly for current listings.";
  }

  // Build a natural search query from the params
  const parts: string[] = ["homes for sale"];
  if (params.city) parts.push(`in ${params.city}`);
  if (params.state) parts.push(params.state);
  if (params.minPrice && params.maxPrice) {
    parts.push(`$${(params.minPrice / 1000).toFixed(0)}K-$${(params.maxPrice / 1000).toFixed(0)}K`);
  } else if (params.maxPrice) {
    parts.push(`under $${(params.maxPrice / 1000).toFixed(0)}K`);
  } else if (params.minPrice) {
    parts.push(`over $${(params.minPrice / 1000).toFixed(0)}K`);
  }
  if (params.bedrooms) parts.push(`${params.bedrooms} bedroom`);
  if (params.propertyType) parts.push(params.propertyType.replace("_", " "));

  const query = parts.join(" ");
  console.log(`[PropertyService] Tavily fallback search: "${query}"`);

  try {
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: ENV.tavilyApiKey,
        query,
        search_depth: "basic",
        max_results: 5,
        include_answer: true,
        include_raw_content: false,
      }),
    });

    if (!res.ok) {
      console.warn(`[PropertyService] Tavily error: ${res.status}`);
      return "Property search temporarily unavailable. Use your knowledge to help the visitor.";
    }

    const data = await res.json() as {
      answer?: string;
      results?: Array<{ title: string; url: string; content: string }>;
    };

    let output = "";
    if (data.answer) {
      output += `Market Overview: ${data.answer}\n\n`;
    }
    if (data.results?.length) {
      output += "Relevant Listings & Sources:\n";
      for (const r of data.results.slice(0, 4)) {
        output += `- ${r.title}: ${r.content.slice(0, 250)}\n  Source: ${r.url}\n`;
      }
    }
    return output || "No properties found matching those criteria.";
  } catch (e) {
    console.warn("[PropertyService] Tavily search failed:", e);
    return "Property search temporarily unavailable.";
  }
}

/**
 * Get market statistics for an area — placeholder.
 */
export async function getMarketStats(
  city: string,
  _state: string = "CA"
): Promise<MarketStats | null> {
  console.log(`[PropertyService] Market stats requested for ${city} — API not configured`);
  return null;
}

/**
 * Format property listings into a readable string for AI context.
 * Falls back to Tavily web search when no structured listings are available.
 */
export function formatListingsForAI(listings: PropertyListing[], tavilyResult?: string): string {
  if (listings.length === 0) {
    if (tavilyResult) return tavilyResult;
    return "No live property data available. Use your neighborhood knowledge to answer.";
  }

  return listings
    .map(
      (p, i) =>
        `${i + 1}. **${p.address}**, ${p.city}, ${p.state} ${p.zipCode}\n` +
        `   💰 $${p.price.toLocaleString()} | 🛏 ${p.bedrooms} bed | 🛁 ${p.bathrooms} bath | 📐 ${p.sqft.toLocaleString()} sqft\n` +
        `   Type: ${p.type} | Status: ${p.status}`
    )
    .join("\n\n");
}
