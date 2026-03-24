import { useState, useCallback } from "react";
import { trpc } from "@/lib/trpc";

export type RegistrationData = {
  name: string;
  email: string;
  brokerage: string;
  serviceArea: string; // single text input, kept simple
};

export const INITIAL_DATA: RegistrationData = {
  name: "",
  email: "",
  brokerage: "",
  serviceArea: "",
};

/** Generate a URL slug from agent name */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60);
}

/** Generate an AI-style bio from basic info (client-side draft — no API call) */
export function generateBio(data: RegistrationData): string {
  const name = data.name.trim() || "the agent";
  const brokerage = data.brokerage.trim();
  const area = data.serviceArea.trim();

  const parts: string[] = [];

  if (brokerage && area) {
    parts.push(
      `${name} is a dedicated real estate professional with ${brokerage}, specializing in the ${area} market.`
    );
  } else if (brokerage) {
    parts.push(
      `${name} is a dedicated real estate professional with ${brokerage}, committed to delivering exceptional service to every client.`
    );
  } else if (area) {
    parts.push(
      `${name} is a dedicated real estate professional specializing in the ${area} market.`
    );
  } else {
    parts.push(
      `${name} is a dedicated real estate professional committed to helping clients navigate the home buying and selling process.`
    );
  }

  parts.push(
    "With a deep understanding of local market trends and a client-first approach, " +
    `${name.split(" ")[0]} works tirelessly to ensure the best outcomes for buyers and sellers alike.`
  );

  parts.push(
    "Whether you're searching for your dream home or looking to maximize the value of your property, " +
    `${name.split(" ")[0]} is here to guide you every step of the way.`
  );

  return parts.join(" ");
}

export function useRegistration() {
  const [data, setData] = useState<RegistrationData>(INITIAL_DATA);
  const [generatedBio, setGeneratedBio] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const registerMutation = trpc.agent.register.useMutation();

  const updateData = useCallback((partial: Partial<RegistrationData>) => {
    setData((prev) => ({ ...prev, ...partial }));
  }, []);

  const isValid =
    data.name.trim().length >= 1 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email);

  const generateAndPreview = useCallback(() => {
    const bio = generateBio(data);
    setGeneratedBio(bio);
    setShowPreview(true);
  }, [data]);

  const submit = useCallback(async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const slug = generateSlug(data.name);
      const bio = generatedBio || generateBio(data);

      const result = await registerMutation.mutateAsync({
        name: data.name,
        email: data.email,
        brokerage: data.brokerage || undefined,
        serviceAreas: data.serviceArea ? [data.serviceArea] : undefined,
        bio,
        slug: slug || undefined,
        colorScheme: "gold",
      });

      setCreatedSlug(result.slug);

      // Persist for dashboard access
      try {
        localStorage.setItem("kevv-agent-slug", result.slug);
        localStorage.setItem("kevv-agent-email", data.email);
      } catch {}

      return result;
    } catch (error) {
      const msg =
        error instanceof Error
          ? error.message
          : "Registration failed. Please try again.";
      setSubmitError(msg);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [data, generatedBio, registerMutation]);

  return {
    data,
    updateData,
    isValid,
    generatedBio,
    showPreview,
    setShowPreview,
    generateAndPreview,
    submit,
    isSubmitting,
    submitError,
    createdSlug,
  };
}

// Keep these exports for ProfileEditor compatibility
export const SPECIALTY_OPTIONS = [
  "Residential Sales",
  "Luxury Homes",
  "First-time Buyers",
  "Investment Properties",
  "Commercial",
  "New Construction",
  "Property Staging",
  "Relocation",
  "Short Sales & Foreclosures",
  "Land & Lots",
];

export const LANGUAGE_OPTIONS = [
  "English", "Spanish", "Mandarin", "Cantonese",
  "Vietnamese", "Korean", "Japanese", "French",
  "Portuguese", "Hindi", "Arabic", "Russian",
];
