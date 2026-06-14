import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const createRitual = mutation({
  args: {
    title: v.string(),
    body: v.string(),
    scope: v.union(v.literal("triad"), v.literal("personal")),
    assignedTo: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();

    if (user?.role !== "admin") throw new Error("Only admins can create rituals");

    const ritualId = await ctx.db.insert("rituals", {
      title: args.title,
      body: args.body,
      scope: args.scope,
      createdBy: identity.email!,
      assignedTo: args.assignedTo,
      createdAt: Date.now(),
    });

    return await ctx.db.get(ritualId);
  },
});

export const getRituals = query(async (ctx) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return [];

  const user = await ctx.db
    .query("users")
    .withIndex("by_email", (q) => q.eq("email", identity.email!))
    .first();

  if (!user) return [];

  const allRituals = await ctx.db.query("rituals").collect();

  return allRituals.filter((r) => {
    if (r.scope === "triad") return true;
    if (r.createdBy === identity.email!) return true;
    if (r.assignedTo?.includes(identity.email!)) return true;
    return false;
  });
});

export const updateRitual = mutation({
  args: {
    ritualId: v.id("rituals"),
    title: v.optional(v.string()),
    body: v.optional(v.string()),
    assignedTo: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const ritual = await ctx.db.get(args.ritualId);
    if (!ritual || ritual.createdBy !== identity.email!) throw new Error("Unauthorized");

    const updates: any = {};
    if (args.title !== undefined) updates.title = args.title;
    if (args.body !== undefined) updates.body = args.body;
    if (args.assignedTo !== undefined) updates.assignedTo = args.assignedTo;

    await ctx.db.patch(args.ritualId, updates);
    return await ctx.db.get(args.ritualId);
  },
});

export const deleteRitual = mutation({
  args: { ritualId: v.id("rituals") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const ritual = await ctx.db.get(args.ritualId);
    if (!ritual || ritual.createdBy !== identity.email!) throw new Error("Unauthorized");

    await ctx.db.delete(args.ritualId);
  },
});

// Enhanced BIPS v2.1 ritual functions
export const createBipsRitual = mutation({
  args: {
    label: v.string(),
    description: v.string(),
    scope: v.union(v.literal("triad"), v.literal("site"), v.literal("contact")),
    siteId: v.optional(v.id("sites")),
    contactId: v.optional(v.id("contacts")),
    steps: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("rituals", {
      label: args.label,
      description: args.description,
      scope: args.scope,
      siteId: args.siteId,
      contactId: args.contactId,
      steps: args.steps,
      createdAt: Date.now(),
    });
  },
});

export const listRitualsForSite = query({
  args: { siteId: v.id("sites") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("rituals")
      .withIndex("by_site", (q) => q.eq("siteId", args.siteId))
      .collect();
  },
});

export const listRitualsForContact = query({
  args: { contactId: v.id("contacts") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("rituals")
      .withIndex("by_contact", (q) => q.eq("contactId", args.contactId))
      .collect();
  },
});

export const listTriadRituals = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("rituals")
      .withIndex("by_scope", (q) => q.eq("scope", "triad"))
      .collect();
  },
});

export const getRitualDetails = query({
  args: { id: v.id("rituals") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});
