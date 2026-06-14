import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// --- Workboard Items ---

export const createWorkboardItem = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    ownerId: v.string(),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();
    if (user?.role !== "admin") throw new Error("Only Kee can create workboard items");

    const id = await ctx.db.insert("workboardItems", {
      title: args.title,
      description: args.description,
      ownerId: args.ownerId,
      status: "todo",
      priority: args.priority,
      lastUpdated: Date.now(),
      createdAt: Date.now(),
    });
    return await ctx.db.get(id);
  },
});

export const updateWorkboardItem = mutation({
  args: {
    itemId: v.id("workboardItems"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    ownerId: v.optional(v.string()),
    status: v.optional(v.union(v.literal("todo"), v.literal("in_progress"), v.literal("done"), v.literal("blocked"))),
    priority: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"))),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const updates: Record<string, unknown> = { lastUpdated: Date.now() };
    if (args.title !== undefined) updates.title = args.title;
    if (args.description !== undefined) updates.description = args.description;
    if (args.ownerId !== undefined) updates.ownerId = args.ownerId;
    if (args.status !== undefined) updates.status = args.status;
    if (args.priority !== undefined) updates.priority = args.priority;

    await ctx.db.patch(args.itemId, updates);
    return await ctx.db.get(args.itemId);
  },
});

export const getWorkboardItems = query(async (ctx) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return [];

  const items = await ctx.db.query("workboardItems").collect();
  return items.sort((a, b) => b.lastUpdated - a.lastUpdated);
});

export const deleteWorkboardItem = mutation({
  args: { itemId: v.id("workboardItems") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();
    if (user?.role !== "admin") throw new Error("Only Kee can delete workboard items");

    await ctx.db.delete(args.itemId);
  },
});

// --- Sync Rituals ---

export const createSyncRitual = mutation({
  args: {
    label: v.string(),
    type: v.union(v.literal("daily_checkin"), v.literal("weekly_review"), v.literal("reminder"), v.literal("cowork_session")),
    timeOfDay: v.optional(v.string()),
    daysOfWeek: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();
    if (user?.role !== "admin") throw new Error("Only Kee can create sync rituals");

    const id = await ctx.db.insert("syncRituals", {
      label: args.label,
      type: args.type,
      timeOfDay: args.timeOfDay,
      daysOfWeek: args.daysOfWeek,
      enabled: true,
      createdBy: identity.email!,
      createdAt: Date.now(),
    });
    return await ctx.db.get(id);
  },
});

export const updateSyncRitual = mutation({
  args: {
    ritualId: v.id("syncRituals"),
    label: v.optional(v.string()),
    timeOfDay: v.optional(v.string()),
    daysOfWeek: v.optional(v.array(v.string())),
    enabled: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const updates: Record<string, unknown> = {};
    if (args.label !== undefined) updates.label = args.label;
    if (args.timeOfDay !== undefined) updates.timeOfDay = args.timeOfDay;
    if (args.daysOfWeek !== undefined) updates.daysOfWeek = args.daysOfWeek;
    if (args.enabled !== undefined) updates.enabled = args.enabled;

    await ctx.db.patch(args.ritualId, updates);
    return await ctx.db.get(args.ritualId);
  },
});

export const getSyncRituals = query(async (ctx) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return [];

  return await ctx.db.query("syncRituals").collect();
});

export const deleteSyncRitual = mutation({
  args: { ritualId: v.id("syncRituals") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();
    if (user?.role !== "admin") throw new Error("Only Kee can delete sync rituals");

    await ctx.db.delete(args.ritualId);
  },
});

// --- Session Mode ---

export const startSession = mutation({
  args: {
    label: v.string(),
    durationMinutes: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const existing = await ctx.db.query("sessionMode").collect();
    const active = existing.find((s) => s.active);
    if (active) {
      await ctx.db.patch(active._id, { active: false });
    }

    const id = await ctx.db.insert("sessionMode", {
      active: true,
      startedBy: identity.email!,
      label: args.label,
      startedAt: Date.now(),
      durationMinutes: args.durationMinutes,
    });
    return await ctx.db.get(id);
  },
});

export const endSession = mutation(async (ctx) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");

  const sessions = await ctx.db.query("sessionMode").collect();
  const active = sessions.find((s) => s.active);
  if (active) {
    await ctx.db.patch(active._id, { active: false });
  }
});

export const getActiveSession = query(async (ctx) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;

  const sessions = await ctx.db.query("sessionMode").collect();
  return sessions.find((s) => s.active) || null;
});
