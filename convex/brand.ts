import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Brand Profiles
export const getBrandProfile = query({
  args: { siteCode: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("brandProfiles")
      .withIndex("by_site_code", (q) => q.eq("siteCode", args.siteCode))
      .first();
  },
});

export const listBrandProfiles = query({
  handler: async (ctx) => {
    return await ctx.db.query("brandProfiles").collect();
  },
});

export const createBrandProfile = mutation({
  args: {
    siteCode: v.string(),
    primaryColor: v.string(),
    secondaryColor: v.string(),
    accentColor: v.string(),
    backgroundColor: v.string(),
    textColor: v.string(),
    fontFamily: v.string(),
    tone: v.string(),
    logoMediaId: v.optional(v.id("media")),
    iconSet: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("brandProfiles", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const updateBrandProfile = mutation({
  args: {
    siteCode: v.string(),
    primaryColor: v.optional(v.string()),
    secondaryColor: v.optional(v.string()),
    accentColor: v.optional(v.string()),
    backgroundColor: v.optional(v.string()),
    textColor: v.optional(v.string()),
    fontFamily: v.optional(v.string()),
    tone: v.optional(v.string()),
    logoMediaId: v.optional(v.id("media")),
    iconSet: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { siteCode, ...updates } = args;
    const existing = await ctx.db
      .query("brandProfiles")
      .withIndex("by_site_code", (q) => q.eq("siteCode", siteCode))
      .first();

    if (!existing) throw new Error("Brand profile not found");

    await ctx.db.patch(existing._id, updates);
    return await ctx.db.get(existing._id);
  },
});

// Art Assets
export const listArtAssets = query({
  args: { usage: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let q = ctx.db.query("artAssets");

    if (args.usage) {
      q = q.withIndex("by_usage", (qb) => qb.eq("usage", args.usage!));
    }

    return await q.collect();
  },
});

export const getArtAsset = query({
  args: { id: v.id("artAssets") },
  handler: async (ctx, args) => {
    const asset = await ctx.db.get(args.id);
    if (!asset) return null;

    const media = await ctx.db.get(asset.mediaId);
    return { ...asset, media };
  },
});

export const createArtAsset = mutation({
  args: {
    label: v.string(),
    mediaId: v.id("media"),
    usage: v.union(v.literal("lexi_brand"), v.literal("gear_brand"), v.literal("bips_brand"), v.literal("shared")),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("artAssets", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const updateArtAsset = mutation({
  args: {
    id: v.id("artAssets"),
    label: v.optional(v.string()),
    usage: v.optional(v.union(v.literal("lexi_brand"), v.literal("gear_brand"), v.literal("bips_brand"), v.literal("shared"))),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
    return await ctx.db.get(id);
  },
});

// Shopify Links
export const listShopifyLinks = query({
  args: { siteCode: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let q = ctx.db.query("shopifyLinks");

    if (args.siteCode) {
      q = q.withIndex("by_site_code", (qb) => qb.eq("siteCode", args.siteCode!));
    }

    return await q.collect();
  },
});

export const createShopifyLink = mutation({
  args: {
    shopifyProductId: v.string(),
    label: v.string(),
    siteCode: v.string(),
    primaryUrl: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("shopifyLinks", {
      ...args,
      active: true,
      createdAt: Date.now(),
    });
  },
});

export const updateShopifyLink = mutation({
  args: {
    id: v.id("shopifyLinks"),
    label: v.optional(v.string()),
    primaryUrl: v.optional(v.string()),
    active: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
    return await ctx.db.get(id);
  },
});
