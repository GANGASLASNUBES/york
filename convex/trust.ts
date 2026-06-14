import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const setTrustLevel = mutation({
  args: {
    contactId: v.id("contacts"),
    trustLevel: v.union(v.literal("unknown"), v.literal("known"), v.literal("trusted"), v.literal("critical")),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("trustProfiles")
      .withIndex("by_contact", (q) => q.eq("contactId", args.contactId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { trustLevel: args.trustLevel });
      return await ctx.db.get(existing._id);
    }

    return await ctx.db.insert("trustProfiles", {
      contactId: args.contactId,
      trustLevel: args.trustLevel,
      lastVerifiedAt: Date.now(),
    });
  },
});

export const setPublicKey = mutation({
  args: {
    contactId: v.id("contacts"),
    publicKey: v.string(),
    fingerprint: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("trustProfiles")
      .withIndex("by_contact", (q) => q.eq("contactId", args.contactId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        publicKey: args.publicKey,
        fingerprint: args.fingerprint,
      });
      return await ctx.db.get(existing._id);
    }

    return await ctx.db.insert("trustProfiles", {
      contactId: args.contactId,
      publicKey: args.publicKey,
      fingerprint: args.fingerprint,
      trustLevel: "known",
    });
  },
});

export const getTrustProfile = query({
  args: { contactId: v.id("contacts") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("trustProfiles")
      .withIndex("by_contact", (q) => q.eq("contactId", args.contactId))
      .first();
  },
});

export const listTrustedContacts = query({
  args: {
    trustLevel: v.union(v.literal("unknown"), v.literal("known"), v.literal("trusted"), v.literal("critical")),
  },
  handler: async (ctx, args) => {
    const profiles = await ctx.db
      .query("trustProfiles")
      .withIndex("by_trust_level", (q) => q.eq("trustLevel", args.trustLevel))
      .collect();

    const contacts = await Promise.all(
      profiles.map((p) => ctx.db.get(p.contactId))
    );

    return contacts.filter(Boolean);
  },
});
