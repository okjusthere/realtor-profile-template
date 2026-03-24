/**
 * Login page — adapted from Openhouse's LoginAuthHub.
 * Passwordless Google OAuth sign-in for agents.
 */
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth, loginWithGoogle } from "../../hooks/useAuth";

const errorMessages: Record<string, string> = {
  google_denied: "Google sign-in was cancelled or denied.",
  missing_code: "No authorization code received from Google.",
  token_exchange_failed: "Could not verify your Google account. Please try again.",
  userinfo_failed: "Could not retrieve your Google profile. Please try again.",
  no_email: "Your Google account has no email address associated.",
  provision_failed: "Could not create your agent profile. Please try again.",
  server_error: "An unexpected server error occurred. Please try again.",
};

function GoogleGlyph() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

export default function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Parse error from URL
  const urlParams = new URLSearchParams(window.location.search);
  const errorCode = urlParams.get("error");

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isLoading, isAuthenticated, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Ambient gradient blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-18rem] h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-amber-500/10 blur-[110px]" />
        <div className="absolute right-[-10rem] top-[16rem] h-[24rem] w-[24rem] rounded-full bg-blue-400/8 blur-[100px]" />
        <div className="absolute left-[-8rem] top-[26rem] h-[20rem] w-[20rem] rounded-full bg-amber-400/8 blur-[90px]" />
      </div>

      <div className="mx-auto grid min-h-screen w-full max-w-7xl items-center gap-8 px-5 py-8 md:px-8 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Left: Marketing copy (desktop only) */}
        <section className="hidden lg:block">
          <span className="inline-block border border-amber-500/30 bg-amber-500/10 text-amber-700 text-xs font-medium px-3 py-1 rounded-full">
            Secure agent sign-in
          </span>
          <h1
            className="mt-6 max-w-2xl text-5xl font-semibold leading-tight tracking-tight"
            style={{ fontFamily: '"Playfair Display", "Georgia", serif' }}
          >
            Your personal real estate brand,{" "}
            <span className="text-amber-600">powered by AI</span>.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Sign in with your Google account to access your agent dashboard.
            Manage your profile, track leads, and let AI work for you — all
            from one place.
          </p>

          <div className="mt-8 grid max-w-2xl gap-3">
            {[
              {
                title: "No passwords needed",
                body: "Sign in with Google. No password database, no recovery emails. Your identity stays with your provider.",
                icon: "🔒",
              },
              {
                title: "AI-powered lead capture",
                body: "Your personal AI chatbot qualifies visitors 24/7, capturing budget, timeline, and contact info automatically.",
                icon: "🤖",
              },
              {
                title: "Professional templates",
                body: "Choose from 7 premium templates for your agent page — Luxury, Modern, Bold, Elegant, Minimal, Urban, or Classic.",
                icon: "✨",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-border/70 bg-card/65 p-5 shadow-sm backdrop-blur"
              >
                <div className="flex items-start gap-4">
                  <div className="text-2xl">{item.icon}</div>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">{item.title}</h2>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Right: Sign-in card */}
        <div className="w-full lg:max-w-xl lg:justify-self-end">
          <div className="rounded-2xl border border-border/60 bg-card/90 shadow-2xl shadow-amber-900/5 backdrop-blur-xl p-8">
            {/* Header */}
            <div className="text-center space-y-3 border-b border-border/60 pb-6">
              <div className="text-2xl font-bold tracking-tight" style={{ fontFamily: '"Playfair Display", "Georgia", serif' }}>
                KEVV AI
              </div>
              <h2
                className="text-3xl tracking-tight font-semibold"
                style={{ fontFamily: '"Playfair Display", "Georgia", serif' }}
              >
                Sign in to your dashboard
              </h2>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Use your Google account to sign in. We create your agent profile automatically on first sign-in.
              </p>
            </div>

            <div className="space-y-5 pt-6">
              {/* Error banner */}
              {errorCode && (
                <div className="rounded-xl border border-red-300/50 bg-red-50 text-red-900 px-4 py-3 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">⚠</span>
                    <div>
                      <p className="font-semibold">Sign-in failed</p>
                      <p className="mt-1 opacity-90">
                        {errorMessages[errorCode] || "An unknown error occurred."}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Trust badge */}
              {!errorCode && (
                <div className="rounded-xl border border-emerald-300/50 bg-emerald-50 text-emerald-900 px-4 py-3 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-emerald-600 mt-0.5">✓</span>
                    <div>
                      <p className="font-semibold">Passwordless sign-in</p>
                      <p className="mt-1 opacity-85">
                        Authentication is delegated to Google. No password is stored.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Google Sign-In Button */}
              <button
                type="button"
                onClick={() => {
                  setIsRedirecting(true);
                  loginWithGoogle();
                }}
                disabled={isRedirecting}
                className="group w-full flex items-center justify-between rounded-xl border border-border/70 bg-background/65 p-4 text-left shadow-sm transition hover:border-blue-300 hover:bg-blue-50/40 disabled:cursor-not-allowed disabled:opacity-55"
              >
                <div>
                  <div className="flex items-center gap-2 text-base font-semibold text-foreground">
                    <GoogleGlyph />
                    Continue with Google
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Gmail, Google Workspace, or any Google account
                  </p>
                </div>
                <div className="shrink-0">
                  {isRedirecting ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                  ) : (
                    <span className="text-muted-foreground text-xl">→</span>
                  )}
                </div>
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-muted-foreground/60">
                <span className="h-px flex-1 bg-border/70" />
                or
                <span className="h-px flex-1 bg-border/70" />
              </div>

              {/* Demo mode link */}
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="w-full rounded-xl border border-border/50 bg-muted/30 p-4 text-center text-sm text-muted-foreground hover:bg-muted/50 transition"
              >
                <span className="font-medium text-foreground">Try the demo dashboard</span>
                <br />
                <span className="text-xs">Preview with sample agent data — no sign-in required</span>
              </button>

              {/* Footer links */}
              <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground pt-2">
                <a className="hover:text-foreground" href="/">← Back to home</a>
                <a className="hover:text-foreground" href="/privacy">Privacy</a>
                <a className="hover:text-foreground" href="/terms">Terms</a>
              </div>
            </div>
          </div>

          {/* Domain info (small text) */}
          <p className="mt-4 text-center text-xs text-muted-foreground/50">
            Agent pages: <code className="text-muted-foreground">pages.kevv.ai/agents/xxx</code> ·
            Dashboard: <code className="text-muted-foreground">page.kevv.ai</code>
          </p>
        </div>
      </div>
    </div>
  );
}
