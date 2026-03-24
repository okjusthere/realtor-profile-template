import { useState } from "react";
import { useLocation, Route, Switch } from "wouter";
import { Button } from "@/components/ui/button";
import { BarChart3, ExternalLink, LayoutDashboard, LogOut, PanelLeft, Sparkles, User, Users } from "lucide-react";
import DashboardPage from "./DashboardPage";
import LeadsPage from "./LeadsPage";
import ProfileEditor from "./ProfileEditor";

const MENU_ITEMS = [
  { icon: LayoutDashboard, label: "Overview", path: "/dashboard" },
  { icon: Users, label: "Leads", path: "/dashboard/leads" },
  { icon: User, label: "Profile", path: "/dashboard/profile" },
];

const DEMO_SLUGS = ["sarah-chen", "michael-brooks"];

export default function DashboardShell() {
  const [location, navigate] = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  // Synchronous init — no useEffect flash
  const [agentSlug, setAgentSlug] = useState<string | null>(
    () => localStorage.getItem("kevv-agent-slug")
  );

  const isDemo = agentSlug ? DEMO_SLUGS.includes(agentSlug) : false;

  // No agent slug — show selector
  if (!agentSlug) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-8 bg-background text-foreground p-8">
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-heading font-bold">Agent Dashboard</h1>
          <p className="text-muted-foreground max-w-md">
            Create your own agent page or explore the demo dashboard to see how the platform works.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button onClick={() => navigate("/register")} size="lg" className="font-bold gap-2">
            <Sparkles className="h-4 w-4" />
            Create Agent Page
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="font-bold gap-2"
            onClick={() => {
              localStorage.setItem("kevv-agent-slug", "sarah-chen");
              setAgentSlug("sarah-chen");
            }}
          >
            <BarChart3 className="h-4 w-4" />
            Try Demo Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* Sidebar */}
      <aside className={`${collapsed ? "w-16" : "w-64"} border-r bg-card transition-all duration-300 flex flex-col`}>
        {/* Header */}
        <div className="h-16 flex items-center px-4 border-b">
          <button onClick={() => setCollapsed(!collapsed)} className="h-8 w-8 flex items-center justify-center hover:bg-accent rounded-lg">
            <PanelLeft className="h-4 w-4" />
          </button>
          {!collapsed && (
            <span className="ml-3 font-heading font-bold text-sm tracking-widest">KEVV</span>
          )}
        </div>

        {/* Demo Banner */}
        {isDemo && !collapsed && (
          <div className="mx-2 mt-2 px-3 py-2 bg-primary/10 border border-primary/20 rounded-lg">
            <p className="text-xs font-medium text-primary">Demo Mode</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Viewing sample data</p>
          </div>
        )}

        {/* Menu */}
        <nav className="flex-1 p-2 space-y-1 mt-1">
          {MENU_ITEMS.map((item) => {
            const isActive = location === item.path || (item.path !== "/dashboard" && location.startsWith(item.path));
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <item.icon className={`h-4 w-4 shrink-0 ${isActive ? "text-primary" : ""}`} />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-2 border-t space-y-1">
          <a
            href={`/agents/${agentSlug}`}
            target="_blank"
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-all"
          >
            <ExternalLink className="h-4 w-4 shrink-0" />
            {!collapsed && <span>View My Page</span>}
          </a>
          <button
            onClick={() => {
              localStorage.removeItem("kevv-agent-slug");
              localStorage.removeItem("kevv-agent-email");
              setAgentSlug(null);
              navigate("/");
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-all"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        <Switch>
          <Route path="/dashboard" component={() => <DashboardPage agentSlug={agentSlug} />} />
          <Route path="/dashboard/leads" component={() => <LeadsPage agentSlug={agentSlug} />} />
          <Route path="/dashboard/profile" component={() => <ProfileEditor agentSlug={agentSlug} />} />
        </Switch>
      </main>
    </div>
  );
}
