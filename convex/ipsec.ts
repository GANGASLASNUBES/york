import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const createIpsecProfile = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    allowedAlgorithms: v.array(v.string()),
    minKeyLength: v.number(),
    allowedChannels: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("ipsecProfiles", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const listIpsecProfiles = query({
  handler: async (ctx) => {
    return await ctx.db.query("ipsecProfiles").collect();
  },
});

export const getIpsecProfile = query({
  args: { id: v.id("ipsecProfiles") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const assignIpsecProfileToContact = mutation({
  args: {
    contactId: v.id("contacts"),
    ipsecProfileId: v.id("ipsecProfiles"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("trustProfiles")
      .withIndex("by_contact", (q) => q.eq("contactId", args.contactId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        ipsecProfileId: args.ipsecProfileId,
      });
      return await ctx.db.get(existing._id);
    }

    return await ctx.db.insert("trustProfiles", {
      contactId: args.contactId,
      ipsecProfileId: args.ipsecProfileId,
      trustLevel: "known",
    });
  },
});
