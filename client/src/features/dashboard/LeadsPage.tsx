import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { ChevronDown, DollarSign, Eye, Mail, MapPin, Phone, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import ConversationModal from "./ConversationModal";
import { DEMO_CONVERSATIONS } from "@/data/demoAgents";

const STATUS_OPTIONS = ["new", "contacted", "qualified", "converted", "lost"] as const;

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-500/10 text-blue-500",
  contacted: "bg-amber-500/10 text-amber-500",
  qualified: "bg-purple-500/10 text-purple-500",
  converted: "bg-green-500/10 text-green-500",
  lost: "bg-red-500/10 text-red-500",
};

export default function LeadsPage({ agentSlug }: { agentSlug: string }) {
  const [search, setSearch] = useState("");
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const utils = trpc.useUtils();
  const { data: leads = [], isLoading } = trpc.dashboard.getLeads.useQuery({ agentSlug });
  const updateStatus = trpc.dashboard.updateLeadStatus.useMutation({
    onSuccess: () => utils.dashboard.getLeads.invalidate({ agentSlug }),
  });

  const filteredLeads = leads.filter((lead: any) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      lead.name?.toLowerCase().includes(q) ||
      lead.email?.toLowerCase().includes(q) ||
      lead.extractedArea?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold">Leads</h1>
          <p className="text-muted-foreground mt-1">{leads.length} total leads</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search leads..."
          className="pl-10"
        />
      </div>

      {/* Leads Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground animate-pulse">Loading leads...</div>
        ) : filteredLeads.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            {search ? "No leads match your search." : "No leads yet."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left py-3 px-4 font-semibold">Name</th>
                  <th className="text-left py-3 px-4 font-semibold">Contact</th>
                  <th className="text-left py-3 px-4 font-semibold">Score</th>
                  <th className="text-left py-3 px-4 font-semibold">Details</th>
                  <th className="text-left py-3 px-4 font-semibold">Status</th>
                  <th className="text-left py-3 px-4 font-semibold">Date</th>
                  <th className="text-left py-3 px-4 font-semibold"></th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead: any) => (
                  <tr key={lead.id} className="border-b hover:bg-card/50 transition-colors">
                    <td className="py-3 px-4 font-medium">{lead.name}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <a href={`mailto:${lead.email}`} className="hover:text-primary">
                          <Mail className="h-4 w-4" />
                        </a>
                        {lead.phone && (
                          <a href={`tel:${lead.phone}`} className="hover:text-primary">
                            <Phone className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                        lead.leadScore === "hot" ? "bg-red-500/10 text-red-500" :
                        lead.leadScore === "warm" ? "bg-amber-500/10 text-amber-500" :
                        "bg-blue-500/10 text-blue-500"
                      }`}>
                        {lead.leadScore?.toUpperCase() ?? "—"}
                      </span>
                    </td>
                    {/* Intent + Budget + Area as compact badges */}
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {lead.extractedIntent && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-primary/5 text-xs text-primary font-medium capitalize">
                            {lead.extractedIntent}
                          </span>
                        )}
                        {lead.extractedBudget && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-green-500/5 text-xs text-green-600 font-medium">
                            <DollarSign className="h-3 w-3" />
                            {lead.extractedBudget}
                          </span>
                        )}
                        {lead.extractedArea && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-500/5 text-xs text-blue-600 font-medium">
                            <MapPin className="h-3 w-3" />
                            {lead.extractedArea}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={lead.status}
                        onChange={(e) => updateStatus.mutate({
                          leadId: lead.id,
                          status: e.target.value as any,
                        })}
                        className={`text-xs capitalize font-medium rounded-full px-2 py-0.5 border-0 cursor-pointer ${STATUS_COLORS[lead.status] || ""}`}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-4 text-xs text-muted-foreground whitespace-nowrap">
                      {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => setSelectedLead(lead)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Conversation Modal */}
      {selectedLead && (
        <ConversationModal
          lead={selectedLead}
          chatMessages={selectedLead.sessionId ? DEMO_CONVERSATIONS[selectedLead.sessionId] : undefined}
          onClose={() => setSelectedLead(null)}
        />
      )}
    </div>
  );
}
