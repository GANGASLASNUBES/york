import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Emotional Geometry Engine
export const recordEmotion = mutation({
  args: {
    userId: v.string(),
    mood: v.string(),
    intensity: v.number(),
    vector: v.array(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("emotionalGeometry", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const listEmotions = query({
  args: { userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.userId) {
      return await ctx.db
        .query("emotionalGeometry")
        .withIndex("by_user", (q) => q.eq("userId", args.userId!))
        .order("desc")
        .take(100);
    }
    return await ctx.db.query("emotionalGeometry").order("desc").take(100);
  },
});

export const computeEmotionVector = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const emotions = await ctx.db
      .query("emotionalGeometry")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .take(50);

    if (emotions.length === 0) return { vector: [0, 0, 0], count: 0 };

    const sum = emotions.reduce(
      (acc, e) => [
        acc[0] + (e.vector[0] ?? 0),
        acc[1] + (e.vector[1] ?? 0),
        acc[2] + (e.vector[2] ?? 0),
      ],
      [0, 0, 0]
    );

    return {
      vector: sum.map((v) => v / emotions.length),
      count: emotions.length,
    };
  },
});

// Routine Automation
export const createAutomation = mutation({
  args: {
    routineId: v.string(),
    label: v.string(),
    trigger: v.union(v.literal("time"), v.literal("location"), v.literal("emotion")),
    params: v.any(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("automatedRoutines", {
      ...args,
      active: true,
      createdAt: Date.now(),
    });
  },
});

export const runAutomation = mutation({
  args: { id: v.id("automatedRoutines") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { lastRunAt: Date.now() });
    return await ctx.db.get(args.id);
  },
});

export const listAutomations = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("automatedRoutines")
      .withIndex("by_active", (q) => q.eq("active", true))
      .collect();
  },
});

// HUD Telemetry
export const recordTelemetry = mutation({
  args: {
    deviceId: v.string(),
    userId: v.string(),
    event: v.string(),
    payload: v.any(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("hudTelemetry", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const listTelemetry = query({
  args: { deviceId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.deviceId) {
      return await ctx.db
        .query("hudTelemetry")
        .withIndex("by_device", (q) => q.eq("deviceId", args.deviceId!))
        .order("desc")
        .take(100);
    }
    return await ctx.db.query("hudTelemetry").order("desc").take(100);
  },
});

export const getHUDFeed = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const telemetry = await ctx.db
      .query("hudTelemetry")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(20);

    const emotions = await ctx.db
      .query("emotionalGeometry")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(5);

    return { telemetry, emotions };
  },
});

// Contact Graph Edges
export const connectContacts = mutation({
  args: {
    fromContactId: v.id("contacts"),
    toContactId: v.id("contacts"),
    weight: v.number(),
    kind: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("contactEdges", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const computeGraphClusters = query({
  handler: async (ctx) => {
    const edges = await ctx.db.query("contactEdges").collect();
    const nodes = new Map<string, Set<string>>();

    for (const edge of edges) {
      const from = edge.fromContactId as unknown as string;
      const to = edge.toContactId as unknown as string;
      if (!nodes.has(from)) nodes.set(from, new Set());
      if (!nodes.has(to)) nodes.set(to, new Set());
      nodes.get(from)!.add(to);
      nodes.get(to)!.add(from);
    }

    return {
      nodeCount: nodes.size,
      edgeCount: edges.length,
      clusters: Array.from(nodes.entries()).map(([id, connections]) => ({
        contactId: id,
        degree: connections.size,
      })),
    };
  },
});

// Site Clustering
export const clusterSites = mutation({
  args: {},
  handler: async (ctx) => {
    const sites = await ctx.db.query("sites").collect();
    const existing = await ctx.db.query("siteClusters").collect();

    for (const old of existing) {
      await ctx.db.delete(old._id);
    }

    const clusters: Record<string, typeof sites> = {};
    for (const site of sites) {
      if (site.latitude === undefined || site.longitude === undefined) continue;
      const key = `${Math.round(site.latitude * 10) / 10},${Math.round(site.longitude * 10) / 10}`;
      if (!clusters[key]) clusters[key] = [];
      clusters[key].push(site);
    }

    let count = 0;
    for (const [key, clusterSites] of Object.entries(clusters)) {
      const [lat, lng] = key.split(",").map(Number);
      for (const site of clusterSites) {
        await ctx.db.insert("siteClusters", {
          clusterId: key,
          siteId: site._id,
          centroid: { lat, lng },
          createdAt: Date.now(),
        });
        count++;
      }
    }

    return { clusters: Object.keys(clusters).length, sites: count };
  },
});

export const listClusters = query({
  handler: async (ctx) => {
    return await ctx.db.query("siteClusters").collect();
  },
});

// Gear Builder
export const createGearBuild = mutation({
  args: {
    userId: v.optional(v.string()),
    label: v.string(),
    components: v.array(
      v.object({
        category: v.string(),
        name: v.string(),
        price: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const totalPrice = args.components.reduce((sum, c) => sum + c.price, 0);
    return await ctx.db.insert("gearBuilds", {
      ...args,
      totalPrice,
      createdAt: Date.now(),
    });
  },
});

export const listGearBuilds = query({
  handler: async (ctx) => {
    return await ctx.db.query("gearBuilds").order("desc").take(50);
  },
});

// Lexi AI Routine Generator (deterministic template-based)
export const generateRoutine = mutation({
  args: {
    skinType: v.string(),
    budget: v.number(),
    timeMinutes: v.number(),
  },
  handler: async (ctx, args) => {
    const stepCount = Math.max(3, Math.min(8, Math.floor(args.timeMinutes / 2)));
    const pricePerProduct = args.budget / Math.max(3, stepCount);

    const baseSteps: Record<string, string[]> = {
      dry: [
        "Cleanse with a cream-based hydrating cleanser",
        "Apply hyaluronic acid serum on damp skin",
        "Pat in a rich ceramide moisturizer",
        "Seal with facial oil (3-5 drops)",
        "Apply SPF 30+ (AM only)",
        "Use gentle exfoliant 2x week",
        "Weekly hydrating mask",
        "Eye cream morning and night",
      ],
      oily: [
        "Cleanse with salicylic acid wash",
        "Tone with witch hazel or BHA toner",
        "Apply niacinamide serum",
        "Use oil-free gel moisturizer",
        "Mattifying SPF 30+ (AM only)",
        "Use clay mask 1-2x week",
        "Spot-treat with benzoyl peroxide as needed",
        "Weekly chemical exfoliant",
      ],
      combination: [
        "Double cleanse: oil + gentle foaming",
        "Balance with hydrating toner",
        "Apply vitamin C serum (AM)",
        "Layer lightweight moisturizer",
        "Apply SPF 30+ (AM)",
        "Retinol (PM, 3x week)",
        "Spot treat T-zone with BHA",
        "Weekly multi-mask (clay + hydrating)",
      ],
      sensitive: [
        "Rinse with lukewarm water",
        "Cleanse with fragrance-free gentle cleanser",
        "Apply centella or panthenol serum",
        "Moisturize with barrier-repair cream",
        "Mineral SPF 30+ (AM only)",
        "Avoid exfoliants; use enzymes if needed",
        "Weekly oat-based calming mask",
        "Patch-test all new products 48h",
      ],
    };

    const selectedSteps = (baseSteps[args.skinType.toLowerCase()] || baseSteps.combination).slice(0, stepCount);

    const routine = {
      title: `AI Routine: ${args.skinType} skin, ${args.timeMinutes}min`,
      description: `Personalized ${stepCount}-step routine for ${args.skinType} skin within $${args.budget} budget.`,
      steps: selectedSteps.map((text, i) => ({ step: i + 1, text })),
      products: selectedSteps.map((s, i) => ({
        name: `Recommended product ${i + 1}`,
        link: `https://example.com/product/${i + 1}`,
      })),
      category: "skincare",
      price: 0,
      subscriberOnly: false,
      active: false,
      estimatedCost: Math.round(pricePerProduct * stepCount),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const id = await ctx.db.insert("beautyRoutines", {
      title: routine.title,
      description: routine.description,
      steps: routine.steps,
      products: routine.products,
      category: routine.category,
      price: routine.price,
      subscriberOnly: routine.subscriberOnly,
      active: routine.active,
      createdAt: routine.createdAt,
      updatedAt: routine.updatedAt,
    });

    return { id, ...routine };
  },
});

// Cross-Domain Analytics
export const crossDomainAnalytics = query({
  handler: async (ctx) => {
    const events = await ctx.db.query("analyticsEvents").collect();

    const byDomain: Record<string, { views: number; purchases: number; clicks: number; downloads: number }> = {};

    for (const event of events) {
      const code = event.siteCode;
      if (!byDomain[code]) {
        byDomain[code] = { views: 0, purchases: 0, clicks: 0, downloads: 0 };
      }
      if (event.type === "page_view") byDomain[code].views++;
      if (event.type === "purchase") byDomain[code].purchases++;
      if (event.type === "click") byDomain[code].clicks++;
      if (event.type === "download") byDomain[code].downloads++;
    }

    return byDomain;
  },
});
