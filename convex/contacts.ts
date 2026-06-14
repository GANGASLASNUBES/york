import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const createContact = mutation({
  args: {
    displayName: v.string(),
    type: v.union(v.literal("person"), v.literal("org"), v.literal("device"), v.literal("site")),
    importanceLevel: v.number(),
    tags: v.array(v.string()),
    shortNote: v.string(),
    longNote: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("contacts", {
      ...args,
      avatarSeed: Math.random().toString(36).substring(7),
      createdAt: Date.now(),
    });
  },
});

export const updateContact = mutation({
  args: {
    id: v.id("contacts"),
    displayName: v.optional(v.string()),
    importanceLevel: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
    shortNote: v.optional(v.string()),
    longNote: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
    return await ctx.db.get(id);
  },
});

export const deleteContact = mutation({
  args: { id: v.id("contacts") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return { success: true };
  },
});

export const listContacts = query({
  args: {
    type: v.optional(v.union(v.literal("person"), v.literal("org"), v.literal("device"), v.literal("site"))),
  },
  handler: async (ctx, args) => {
    if (args.type) {
      return await ctx.db
        .query("contacts")
        .withIndex("by_type", (q) => q.eq("type", args.type!))
        .collect();
    }
    return await ctx.db.query("contacts").collect();
  },
});

export const getContactDetails = query({
  args: { id: v.id("contacts") },
  handler: async (ctx, args) => {
    const contact = await ctx.db.get(args.id);
    if (!contact) return null;

    const channels = await ctx.db
      .query("channels")
      .withIndex("by_contact", (q) => q.eq("contactId", args.id))
      .collect();

    const trustProfile = await ctx.db
      .query("trustProfiles")
      .withIndex("by_contact", (q) => q.eq("contactId", args.id))
      .first();

    const siteLinks = await ctx.db
      .query("siteLinks")
      .withIndex("by_contact", (q) => q.eq("contactId", args.id))
      .collect();

    return {
      ...contact,
      channels,
      trustProfile,
      siteLinks,
    };
  },
});

export const searchContacts = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    const lower = args.query.toLowerCase();
    const contacts = await ctx.db.query("contacts").collect();
    return contacts.filter((c) =>
      c.displayName.toLowerCase().includes(lower) ||
      c.tags.some((t) => t.toLowerCase().includes(lower))
    );
  },
});
