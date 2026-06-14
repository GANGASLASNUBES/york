import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const uploadMedia = mutation({
  args: {
    fileId: v.string(),
    label: v.string(),
    kind: v.union(v.literal("image"), v.literal("audio"), v.literal("doc"), v.literal("other")),
    provenanceId: v.optional(v.id("provenanceObjects")),
    contactId: v.optional(v.id("contacts")),
    siteId: v.optional(v.id("sites")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("media", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const listMediaForProvenance = query({
  args: { provenanceId: v.id("provenanceObjects") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("media")
      .withIndex("by_provenance", (q) => q.eq("provenanceId", args.provenanceId))
      .collect();
  },
});

export const listMediaForContact = query({
  args: { contactId: v.id("contacts") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("media")
      .withIndex("by_contact", (q) => q.eq("contactId", args.contactId))
      .collect();
  },
});

export const listMediaForSite = query({
  args: { siteId: v.id("sites") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("media")
      .withIndex("by_site", (q) => q.eq("siteId", args.siteId))
      .collect();
  },
});

export const deleteMedia = mutation({
  args: { id: v.id("media") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return { success: true };
  },
});

export const updateMediaLabel = mutation({
  args: {
    id: v.id("media"),
    label: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { label: args.label });
    return await ctx.db.get(args.id);
  },
});
