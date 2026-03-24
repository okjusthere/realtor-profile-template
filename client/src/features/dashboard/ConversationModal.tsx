import { X, Sparkles, User, MapPin, DollarSign, Clock, Target, MessageCircle } from "lucide-react";

type ConversationModalProps = {
  lead: {
    name: string;
    email: string;
    phone?: string | null;
    leadScore?: string | null;
    extractedIntent?: string | null;
    extractedBudget?: string | null;
    extractedArea?: string | null;
    extractedTimeline?: string | null;
    conversationSummary?: string | null;
    source?: string | null;
    createdAt?: string | null;
  };
  chatMessages?: Array<{ role: string; content: string }>;
  onClose: () => void;
};

const SCORE_STYLE: Record<string, string> = {
  hot: "bg-red-500/10 text-red-500 border-red-500/20",
  warm: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  cold: "bg-blue-500/10 text-blue-500 border-blue-500/20",
};

export default function ConversationModal({ lead, chatMessages, onClose }: ConversationModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-background border border-border rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-card">
          <div>
            <h2 className="text-lg font-heading font-bold">{lead.name}</h2>
            <p className="text-xs text-muted-foreground">
              {lead.email}{lead.phone ? ` · ${lead.phone}` : ""}
              {lead.createdAt && ` · ${new Date(lead.createdAt).toLocaleDateString()}`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {lead.leadScore && (
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${SCORE_STYLE[lead.leadScore] || ""}`}>
                {lead.leadScore.toUpperCase()}
              </span>
            )}
            <button
              onClick={onClose}
              className="h-8 w-8 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Lead Intelligence */}
          {(lead.extractedIntent || lead.extractedBudget || lead.extractedArea || lead.extractedTimeline) && (
            <div className="px-6 py-4 border-b bg-muted/30">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                AI-Extracted Lead Intel
              </p>
              <div className="grid grid-cols-2 gap-3">
                {lead.extractedIntent && (
                  <div className="flex items-center gap-2 text-sm">
                    <Target className="h-3.5 w-3.5 text-primary" />
                    <span className="text-muted-foreground">Intent:</span>
                    <span className="font-medium capitalize">{lead.extractedIntent}</span>
                  </div>
                )}
                {lead.extractedBudget && (
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-3.5 w-3.5 text-green-500" />
                    <span className="text-muted-foreground">Budget:</span>
                    <span className="font-medium">{lead.extractedBudget}</span>
                  </div>
                )}
                {lead.extractedArea && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-3.5 w-3.5 text-blue-500" />
                    <span className="text-muted-foreground">Area:</span>
                    <span className="font-medium">{lead.extractedArea}</span>
                  </div>
                )}
                {lead.extractedTimeline && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-3.5 w-3.5 text-amber-500" />
                    <span className="text-muted-foreground">Timeline:</span>
                    <span className="font-medium">{lead.extractedTimeline}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* AI Summary */}
          {lead.conversationSummary && (
            <div className="px-6 py-4 border-b">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                AI Conversation Summary
              </p>
              <div className="bg-primary/5 border border-primary/10 rounded-lg p-3">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{lead.conversationSummary}</p>
              </div>
            </div>
          )}

          {/* Chat Transcript */}
          <div className="px-6 py-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              <MessageCircle className="h-3.5 w-3.5 inline mr-1" />
              Chat Transcript
            </p>

            {chatMessages && chatMessages.length > 0 ? (
              <div className="space-y-3">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    {msg.role === "assistant" && (
                      <div className="h-6 w-6 shrink-0 mt-0.5 rounded-full bg-primary/10 flex items-center justify-center">
                        <Sparkles className="h-3 w-3 text-primary" />
                      </div>
                    )}
                    <div className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    }`}>
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                    {msg.role === "user" && (
                      <div className="h-6 w-6 shrink-0 mt-0.5 rounded-full bg-secondary flex items-center justify-center">
                        <User className="h-3 w-3 text-secondary-foreground" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-20" />
                <p className="text-sm">
                  {lead.source === "contact_form"
                    ? "This lead came from the contact form — no chat transcript."
                    : "Chat transcript not available for demo data."}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t bg-card flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Source: <span className="capitalize">{lead.source?.replace("_", " ") || "Unknown"}</span>
          </p>
          <div className="flex gap-2">
            <a
              href={`mailto:${lead.email}?subject=Following up on your inquiry`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-bold hover:opacity-90 transition-opacity"
            >
              Reply via Email
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
