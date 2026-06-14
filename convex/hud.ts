import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const registerHudSession = mutation({
  args: {
    deviceId: v.string(),
    userId: v.id("users"),
    mode: v.union(v.literal("contacts"), v.literal("sites"), v.literal("provenance"), v.literal("rituals")),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("hudSessions")
      .withIndex("by_device", (q) => q.eq("deviceId", args.deviceId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        lastSeenAt: Date.now(),
        mode: args.mode,
      });
      return await ctx.db.get(existing._id);
    }

    return await ctx.db.insert("hudSessions", {
      deviceId: args.deviceId,
      userId: args.userId,
      mode: args.mode,
      lastSeenAt: Date.now(),
    });
  },
});

export const updateHudSessionMode = mutation({
  args: {
    deviceId: v.string(),
    mode: v.union(v.literal("contacts"), v.literal("sites"), v.literal("provenance"), v.literal("rituals")),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("hudSessions")
      .withIndex("by_device", (q) => q.eq("deviceId", args.deviceId))
      .first();

    if (!session) throw new Error("HUD session not found");

    await ctx.db.patch(session._id, {
      mode: args.mode,
      lastSeenAt: Date.now(),
    });

    return await ctx.db.get(session._id);
  },
});

export const getHudContactsView = query({
  args: { deviceId: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("hudSessions")
      .withIndex("by_device", (q) => q.eq("deviceId", args.deviceId))
      .first();

    if (!session) return [];

    const contacts = await ctx.db.query("contacts").collect();

    return contacts.map((c) => ({
      id: c._id,
      displayName: c.displayName,
      type: c.type,
      importanceLevel: c.importanceLevel,
      tags: c.tags,
    }));
  },
});

export const getHudSitesView = query({
  args: { deviceId: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("hudSessions")
      .withIndex("by_device", (q) => q.eq("deviceId", args.deviceId))
      .first();

    if (!session) return [];

    const sites = await ctx.db.query("sites").collect();

    return sites.map((s) => ({
      id: s._id,
      label: s.label,
      code: s.code,
      type: s.type,
      active: s.active,
    }));
  },
});

export const getHudProvenanceView = query({
  args: { deviceId: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("hudSessions")
      .withIndex("by_device", (q) => q.eq("deviceId", args.deviceId))
      .first();

    if (!session) return [];

    const provenance = await ctx.db.query("provenanceObjects").collect();

    return provenance.map((p) => ({
      id: p._id,
      label: p.label,
      type: p.type,
      description: p.description.substring(0, 50),
    }));
  },
});

export const getHudRitualsView = query({
  args: { deviceId: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("hudSessions")
      .withIndex("by_device", (q) => q.eq("deviceId", args.deviceId))
      .first();

    if (!session) return [];

    const rituals = await ctx.db.query("rituals").collect();

    return rituals.map((r) => ({
      id: r._id,
      label: r.label,
      scope: r.scope,
      steps: r.steps.length,
    }));
  },
});

export const getActiveHudSessions = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("hudSessions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

// Domain-aware HUD endpoints
export const getHudDataBySite = query({
  args: { siteCode: v.string() },
  handler: async (ctx, args) => {
    const siteCode = args.siteCode;

    if (siteCode === "LEXI_SITE") {
      const routines = await ctx.db.query("rituals").collect();
      const downloads = await ctx.db.query("revenueDigitalDownloads").collect();
      const affiliates = await ctx.db.query("revenueAffiliates").collect();

      return {
        siteCode,
        type: "beauty",
        data: {
          routines: routines.map((r) => ({
            id: r._id,
            label: r.label,
            description: r.description,
            scope: r.scope,
          })),
          downloads: downloads.map((d) => ({
            id: d._id,
            label: d.label,
            price: d.price,
          })),
          affiliateLinks: affiliates.map((a) => ({
            id: a._id,
            label: a.label,
            url: a.affiliateUrl,
          })),
        },
        timestamp: Date.now(),
      };
    }

    if (siteCode === "GEAR_SITE") {
      const products = await ctx.db
        .query("revenueProducts")
        .withIndex("by_type", (q) => q.eq("type", "physical"))
        .collect();

      return {
        siteCode,
        type: "hardware",
        data: {
          products: products.map((p) => ({
            id: p._id,
            label: p.label,
            price: p.price,
            type: p.type,
          })),
        },
        timestamp: Date.now(),
      };
    }

    // Default: BIPS_SITE
    const contacts = await ctx.db.query("contacts").collect();
    const sites = await ctx.db.query("sites").collect();
    const provenance = await ctx.db.query("provenanceObjects").collect();

    return {
      siteCode: "BIPS_SITE",
      type: "network",
      data: {
        contacts: contacts.map((c) => ({
          id: c._id,
          displayName: c.displayName,
          type: c.type,
          importance: c.importanceLevel,
        })),
        sites: sites.map((s) => ({
          id: s._id,
          label: s.label,
          code: s.code,
          type: s.type,
        })),
        provenance: provenance.map((p) => ({
          id: p._id,
          label: p.label,
          type: p.type,
        })),
      },
      timestamp: Date.now(),
    };
  },
});
