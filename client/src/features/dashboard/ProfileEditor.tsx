import { trpc } from "@/lib/trpc";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Loader2, X, Upload, Image } from "lucide-react";
import { SPECIALTY_OPTIONS, LANGUAGE_OPTIONS } from "../registration/useRegistration";

export default function ProfileEditor({ agentSlug }: { agentSlug: string }) {
  const { data: profile, isLoading } = trpc.agent.getBySlug.useQuery({ slug: agentSlug });
  const utils = trpc.useUtils();

  const updateMutation = trpc.agent.updateProfile.useMutation({
    onSuccess: () => {
      utils.agent.getBySlug.invalidate({ slug: agentSlug });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  const uploadMutation = trpc.agent.getUploadUrl.useMutation();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    title: "",
    brokerage: "",
    licenseState: "",
    serviceAreas: [] as string[],
    specialties: [] as string[],
    languages: [] as string[],
    yearsExperience: 0,
    bio: "",
    photoUrl: "",
    colorScheme: "",
  });

  const [saved, setSaved] = useState(false);
  const [areaInput, setAreaInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Populate form from profile
  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name || "",
        phone: (profile.phone as string) || "",
        title: (profile.title as string) || "",
        brokerage: (profile.brokerage as string) || "",
        licenseState: (profile.licenseState as string) || "",
        serviceAreas: (profile.serviceAreas as string[]) || [],
        specialties: (profile.specialties as string[]) || [],
        languages: (profile.languages as string[]) || [],
        yearsExperience: (profile.yearsExperience as number) || 0,
        bio: (profile.bio as string) || "",
        photoUrl: (profile.photoUrl as string) || "",
        colorScheme: (profile.colorScheme as string) || "gold",
      });
    }
  }, [profile]);

  const handleSave = () => {
    updateMutation.mutate({
      slug: agentSlug,
      data: {
        name: form.name,
        phone: form.phone || undefined,
        title: form.title || undefined,
        brokerage: form.brokerage || undefined,
        licenseState: form.licenseState || undefined,
        serviceAreas: form.serviceAreas,
        specialties: form.specialties,
        languages: form.languages,
        yearsExperience: form.yearsExperience,
        bio: form.bio || undefined,
        photoUrl: form.photoUrl || undefined,
        colorScheme: form.colorScheme || undefined,
      },
    });
  };

  const handlePhotoUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setUploading(true);

    try {
      // Get presigned URL from server
      const result = await uploadMutation.mutateAsync({
        agentSlug,
        filename: file.name,
        contentType: file.type,
      });

      if (!result.success) {
        // R2 not configured — show URL input instead
        console.warn("[Upload]", result.error);
        setUploading(false);
        return;
      }

      // Upload directly to R2
      await fetch(result.uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      // Update form with public URL
      setForm(prev => ({ ...prev, photoUrl: result.publicUrl }));
      setUploading(false);
    } catch (e) {
      console.error("[Upload] Failed:", e);
      setUploading(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /></div>;
  }

  if (!profile) {
    return (
      <div className="p-8 text-center space-y-3">
        <p className="text-muted-foreground">Profile data is loading from demo mode.</p>
        <p className="text-xs text-muted-foreground">Profile editing will be available when the database is connected.</p>
      </div>
    );
  }

  const addArea = () => {
    const trimmed = areaInput.trim();
    if (trimmed && !form.serviceAreas.includes(trimmed)) {
      setForm({ ...form, serviceAreas: [...form.serviceAreas, trimmed] });
      setAreaInput("");
    }
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold">Edit Profile</h1>
          <p className="text-muted-foreground mt-1">Update your agent page information</p>
        </div>
        <Button onClick={handleSave} disabled={updateMutation.isPending} className="gap-2 font-bold">
          {updateMutation.isPending ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
          ) : saved ? (
            <><CheckCircle2 className="h-4 w-4" /> Saved!</>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>

      {/* Photo Upload */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold border-b pb-2">Profile Photo</h2>
        <div className="flex items-start gap-6">
          {/* Preview */}
          <div className="flex-shrink-0">
            {form.photoUrl ? (
              <img
                src={form.photoUrl}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-2 border-primary/30"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
                <Image className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Upload area */}
          <div className="flex-1 space-y-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handlePhotoUpload(file);
              }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full border-2 border-dashed border-border hover:border-primary/50 rounded-lg p-4 text-center transition-colors cursor-pointer"
            >
              {uploading ? (
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Uploading...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Upload className="h-4 w-4" />
                  <span className="text-sm">Click to upload photo</span>
                </div>
              )}
            </button>

            {/* Or paste URL */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">or paste URL:</span>
              <Input
                value={form.photoUrl}
                onChange={(e) => setForm({ ...form, photoUrl: e.target.value })}
                placeholder="https://..."
                className="text-xs h-8"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Basic Info */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold border-b pb-2">Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Name</label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Phone</label>
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Title</label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Brokerage</label>
            <Input value={form.brokerage} onChange={(e) => setForm({ ...form, brokerage: e.target.value })} />
          </div>
        </div>
      </section>

      {/* Professional */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold border-b pb-2">Professional Details</h2>

        <div>
          <label className="block text-sm font-semibold mb-1">Service Areas</label>
          <div className="flex gap-2 mb-2">
            <Input value={areaInput} onChange={(e) => setAreaInput(e.target.value)}
              placeholder="Add an area" onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addArea(); } }} />
            <Button type="button" variant="outline" onClick={addArea}>Add</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {form.serviceAreas.map((area) => (
              <span key={area} className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                {area}
                <button onClick={() => setForm({ ...form, serviceAreas: form.serviceAreas.filter(a => a !== area) })}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Specialties</label>
          <div className="flex flex-wrap gap-2">
            {SPECIALTY_OPTIONS.map((s) => (
              <button key={s} type="button"
                onClick={() => setForm({ ...form, specialties: form.specialties.includes(s) ? form.specialties.filter(x => x !== s) : [...form.specialties, s] })}
                className={`px-3 py-1 rounded-full text-xs border ${form.specialties.includes(s) ? "bg-primary text-primary-foreground border-primary" : "border-border"}`}
              >{s}</button>
            ))}
          </div>
        </div>

        <div className="max-w-xs">
          <label className="block text-sm font-semibold mb-1">Years of Experience</label>
          <Input type="number" min={0} value={form.yearsExperience || ""} onChange={(e) => setForm({ ...form, yearsExperience: parseInt(e.target.value) || 0 })} />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Bio</label>
          <Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={5} className="resize-none" />
        </div>
      </section>

      {/* Preview Link */}
      <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
        <p className="text-sm">
          <strong>Your page:</strong>{" "}
          <a href={`/agents/${agentSlug}`} target="_blank" className="text-primary hover:underline">
            /agents/{agentSlug}
          </a>
        </p>
      </div>
    </div>
  );
}

