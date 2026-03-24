import { trpc } from "@/lib/trpc";
import { BarChart3, MessageCircle, TrendingUp, Users, UserCog } from "lucide-react";
import { useLocation } from "wouter";

export default function DashboardPage({ agentSlug }: { agentSlug: string }) {
  const { data: analytics, isLoading } = trpc.dashboard.getAnalytics.useQuery({ agentSlug });
  const { data: leads } = trpc.dashboard.getLeads.useQuery({ agentSlug });
  const { data: profile } = trpc.agent.getBySlug.useQuery({ slug: agentSlug });
  const [, navigate] = useLocation();

  const recentLeads = leads?.slice(0, 5) ?? [];

  // Calculate profile completeness
  const completenessChecks = profile ? [
    !!profile.name,
    !!profile.bio,
    !!profile.photoUrl,
    !!(profile.serviceAreas as string[])?.length,
    !!(profile.testimonials as any[])?.length,
    !!(profile.transactions as any[])?.length,
    !!Object.keys((profile.socialLinks as Record<string, string>) || {}).length,
  ] : [];
  const completeness = completenessChecks.length > 0
    ? Math.round((completenessChecks.filter(Boolean).length / completenessChecks.length) * 100)
    : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-heading font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your agent page performance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Leads"
          value={analytics?.totalLeads ?? 0}
          icon={<Users className="h-5 w-5" />}
          description="All-time leads captured"
          loading={isLoading}
        />
        <StatCard
          title="Conversations"
          value={analytics?.totalConversations ?? 0}
          icon={<MessageCircle className="h-5 w-5" />}
          description="AI chat sessions"
          loading={isLoading}
        />
        <StatCard
          title="Conversion Rate"
          value={`${analytics?.conversionRate ?? 0}%`}
          icon={<TrendingUp className="h-5 w-5" />}
          description="Leads → Converted"
          loading={isLoading}
        />
      </div>

      {/* Profile Completeness */}
      {completeness < 100 && (
        <div className="border border-border rounded-lg p-6 bg-card">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <UserCog className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">Profile Completeness</span>
            </div>
            <span className="text-sm font-bold text-primary">{completeness}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${completeness}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Add a photo, transactions, testimonials, and social links to boost your profile.{" "}
            <button onClick={() => navigate("/dashboard/profile")} className="text-primary hover:underline font-medium">
              Complete Profile →
            </button>
          </p>
        </div>
      )}

      {/* Recent Leads */}
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b bg-card">
          <h2 className="font-heading font-bold">Recent Leads</h2>
        </div>
        {recentLeads.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <BarChart3 className="h-8 w-8 mx-auto mb-3 opacity-30" />
            <p>No leads yet. Share your agent page to start capturing leads!</p>
            <p className="text-sm mt-2">
              Your page: <code className="text-primary">/agents/{agentSlug}</code>
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left py-3 px-4 font-semibold">Name</th>
                <th className="text-left py-3 px-4 font-semibold">Email</th>
                <th className="text-left py-3 px-4 font-semibold">Score</th>
                <th className="text-left py-3 px-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentLeads.map((lead: any) => (
                <tr key={lead.id} className="border-b hover:bg-card/50 transition-colors">
                  <td className="py-3 px-4 font-medium">{lead.name}</td>
                  <td className="py-3 px-4 text-muted-foreground">{lead.email}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                      lead.leadScore === "hot" ? "bg-red-500/10 text-red-500" :
                      lead.leadScore === "warm" ? "bg-amber-500/10 text-amber-500" :
                      "bg-blue-500/10 text-blue-500"
                    }`}>
                      {lead.leadScore?.toUpperCase() ?? "—"}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-xs capitalize text-muted-foreground">{lead.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function StatCard({
  title, value, icon, description, loading
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  description: string;
  loading?: boolean;
}) {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
      </div>
      <p className={`text-3xl font-heading font-bold ${loading ? "animate-pulse text-muted-foreground" : ""}`}>
        {loading ? "—" : value}
      </p>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
    </div>
  );
}
