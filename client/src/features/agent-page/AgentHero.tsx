import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Twitter, Youtube } from "lucide-react";

const SOCIAL_ICONS: Record<string, React.ReactNode> = {
  facebook: <Facebook className="h-5 w-5" />,
  instagram: <Instagram className="h-5 w-5" />,
  linkedin: <Linkedin className="h-5 w-5" />,
  twitter: <Twitter className="h-5 w-5" />,
  youtube: <Youtube className="h-5 w-5" />,
};

type AgentHeroProps = {
  name: string;
  firstName: string;
  title?: string | null;
  phone?: string | null;
  email?: string | null;
  photoUrl?: string | null;
  serviceAreas: string[];
  socialLinks: Record<string, string>;
};

export function AgentHeroDetails({
  name,
  title,
  phone,
  email,
  serviceAreas,
  socialLinks,
}: AgentHeroProps) {
  return (
    <section className="hidden lg:block animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.45em] text-muted-foreground">
        Personal Brand Site
      </p>

      <h1 className="text-5xl font-heading font-bold uppercase tracking-[0.18em] mb-4 leading-[0.94] xl:text-6xl">
        {name.split(" ").map((part, i) => (
          <span key={i}>
            {part}
            {i < name.split(" ").length - 1 && <br />}
          </span>
        ))}
      </h1>

      <h2 className="text-base text-muted-foreground uppercase tracking-[0.35em] mb-8">
        {title || "Licensed Real Estate Agent"}
      </h2>

      <div className="space-y-3 text-sm font-light tracking-wide mb-8">
        {phone && (
          <div className="flex items-center gap-3 group cursor-pointer">
            <Phone className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
            <a
              href={`tel:${phone.replace(/[^+\d]/g, "")}`}
              className="group-hover:text-primary transition-colors"
            >
              {phone}
            </a>
          </div>
        )}
        {email && (
          <div className="flex items-center gap-3 group cursor-pointer">
            <Mail className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
            <a href={`mailto:${email}`} className="group-hover:text-primary transition-colors">
              {email}
            </a>
          </div>
        )}
        {serviceAreas.length > 0 && (
          <div className="flex items-center gap-3 group cursor-pointer">
            <MapPin className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
            <span className="group-hover:text-primary transition-colors">
              {serviceAreas.slice(0, 3).join(", ")}
            </span>
          </div>
        )}
      </div>

      {Object.keys(socialLinks).length > 0 && (
        <div className="flex gap-4">
          {Object.entries(socialLinks).map(
            ([platform, url]) =>
              url &&
              SOCIAL_ICONS[platform] && (
                <a
                  key={platform}
                  href={url}
                  title={platform}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-10 w-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/10 transition-all duration-300"
                >
                  {SOCIAL_ICONS[platform]}
                </a>
              )
          )}
        </div>
      )}
    </section>
  );
}

export default function AgentHero({
  name,
  title,
  photoUrl,
}: AgentHeroProps) {
  return (
    <div className="w-full lg:w-[47%] h-[50vh] lg:h-screen lg:fixed lg:left-0 top-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-black/20 z-10"></div>
      <img
        src={photoUrl || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1200&h=1600&fit=crop&crop=faces"}
        alt={`${name} - Real Estate Agent`}
        className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105"
        style={{ objectPosition: "50% 20%" }}
      />

      {/* Mobile Overlay */}
      <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/80 to-transparent lg:hidden z-20">
        <h1 className="text-3xl font-heading font-bold text-white uppercase tracking-widest mb-1">
          {name}
        </h1>
        <p className="text-sm text-white/90 uppercase tracking-wider">
          {title || "Real Estate Agent"}
        </p>
      </div>
    </div>
  );
}
