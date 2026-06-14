import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ===== PRODUCTS =====
export const listProducts = query({
  args: { type: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let q = ctx.db.query("revenueProducts");
    if (args.type) {
      q = q.withIndex("by_type", (qb) => qb.eq("type", args.type!));
    }
    return await q.collect();
  },
});

export const getProduct = query({
  args: { id: v.id("revenueProducts") },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.id);
    if (!product) return null;
    if (product.mediaId) {
      const media = await ctx.db.get(product.mediaId);
      return { ...product, media };
    }
    return product;
  },
});

export const createProduct = mutation({
  args: {
    label: v.string(),
    type: v.union(v.literal("digital"), v.literal("service"), v.literal("physical"), v.literal("subscription")),
    price: v.number(),
    currency: v.string(),
    description: v.string(),
    mediaId: v.optional(v.id("media")),
    shopifyProductId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("revenueProducts", {
      ...args,
      active: true,
      createdAt: Date.now(),
    });
  },
});

// ===== AFFILIATES =====
export const listAffiliates = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("revenueAffiliates")
      .withIndex("by_active", (q) => q.eq("active", true))
      .collect();
  },
});

export const createAffiliate = mutation({
  args: {
    label: v.string(),
    description: v.string(),
    affiliateUrl: v.string(),
    commissionRate: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("revenueAffiliates", {
      ...args,
      active: true,
      createdAt: Date.now(),
    });
  },
});

// ===== BOOKINGS =====
export const listBookings = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("revenueBookings")
      .withIndex("by_active", (q) => q.eq("active", true))
      .collect();
  },
});

export const createBooking = mutation({
  args: {
    label: v.string(),
    description: v.string(),
    durationMinutes: v.number(),
    price: v.number(),
    bookingUrl: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("revenueBookings", {
      ...args,
      active: true,
      createdAt: Date.now(),
    });
  },
});

// ===== DIGITAL DOWNLOADS =====
export const listDigitalDownloads = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("revenueDigitalDownloads")
      .withIndex("by_active", (q) => q.eq("active", true))
      .collect();
  },
});

export const createDigitalDownload = mutation({
  args: {
    label: v.string(),
    description: v.string(),
    fileId: v.string(),
    price: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("revenueDigitalDownloads", {
      ...args,
      active: true,
      createdAt: Date.now(),
    });
  },
});
