import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { AgentProfile } from "../../drizzle/schema";
import { getAuthUser, type AuthUser } from "./auth";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: AuthUser | null;
};

/**
 * Create tRPC context for each request.
 * Reads JWT from cookie to populate ctx.user.
 * Auth is optional — public-facing agent pages don't require login.
 */
export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  const user = await getAuthUser(opts.req);
  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
