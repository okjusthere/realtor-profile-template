/**
 * Auth hook for client-side session management.
 * Calls GET /auth/me to check JWT cookie session.
 */
import { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from "react";

export interface AuthUser {
  id: number;
  slug: string;
  email: string;
  name: string;
  tier: "free" | "pro" | "premium";
  photoUrl: string | null;
}

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within <AuthProvider>");
  }
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch("/auth/me", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user || null);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("[Auth] Session check failed:", err);
      setUser(null);
      setError("Failed to check authentication status");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch("/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      setUser(null);
      window.location.href = "/";
    } catch (err) {
      console.error("[Auth] Logout failed:", err);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        error,
        refresh,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────

export function loginWithGoogle(returnTo: string = "/dashboard") {
  window.location.href = `/auth/google?returnTo=${encodeURIComponent(returnTo)}`;
}
