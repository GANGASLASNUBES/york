import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const updatePresence = mutation({
  args: {
    status: v.union(v.literal("online"), v.literal("away"), v.literal("offline")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("presence")
      .withIndex("by_user", (q) => q.eq("userId", identity.email!))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        status: args.status,
        lastSeen: Date.now(),
      });
      return await ctx.db.get(existing._id);
    }

    const presenceId = await ctx.db.insert("presence", {
      userId: identity.email!,
      status: args.status,
      lastSeen: Date.now(),
    });

    return await ctx.db.get(presenceId);
  },
});

export const getPresence = query({
  args: { userEmail: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("presence")
      .withIndex("by_user", (q) => q.eq("userId", args.userEmail))
      .first();
  },
});

export const getAllPresence = query(async (ctx) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return [];

  return await ctx.db.query("presence").collect();
});
