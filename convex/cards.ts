import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const createCard = mutation({
  args: {
    label: v.string(),
    emoji: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    assignedTo: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();

    if (user?.role !== "admin") throw new Error("Only admins can create cards");

    const cardId = await ctx.db.insert("emotionalCards", {
      label: args.label,
      emoji: args.emoji,
      imageUrl: args.imageUrl,
      createdBy: identity.email!,
      assignedTo: args.assignedTo,
      isActive: true,
      createdAt: Date.now(),
    });

    return await ctx.db.get(cardId);
  },
});

export const getCardsForUser = query({
  args: { userEmail: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const targetEmail = args.userEmail || identity.email!;

    const allCards = await ctx.db.query("emotionalCards").collect();
    return allCards.filter((card) =>
      card.isActive &&
      (card.createdBy === identity.email! ||
        card.assignedTo.includes(targetEmail))
    );
  },
});

export const getAdminCards = query(async (ctx) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return [];

  const user = await ctx.db
    .query("users")
    .withIndex("by_email", (q) => q.eq("email", identity.email!))
    .first();

  if (user?.role !== "admin") return [];

  return await ctx.db
    .query("emotionalCards")
    .withIndex("by_creator", (q) => q.eq("createdBy", identity.email!))
    .collect();
});

export const updateCard = mutation({
  args: {
    cardId: v.id("emotionalCards"),
    label: v.optional(v.string()),
    emoji: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    assignedTo: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const card = await ctx.db.get(args.cardId);
    if (!card || card.createdBy !== identity.email!) throw new Error("Unauthorized");

    const updates: any = {};
    if (args.label !== undefined) updates.label = args.label;
    if (args.emoji !== undefined) updates.emoji = args.emoji;
    if (args.imageUrl !== undefined) updates.imageUrl = args.imageUrl;
    if (args.assignedTo !== undefined) updates.assignedTo = args.assignedTo;

    await ctx.db.patch(args.cardId, updates);
    return await ctx.db.get(args.cardId);
  },
});

export const deleteCard = mutation({
  args: { cardId: v.id("emotionalCards") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const card = await ctx.db.get(args.cardId);
    if (!card || card.createdBy !== identity.email!) throw new Error("Unauthorized");

    await ctx.db.patch(args.cardId, { isActive: false });
  },
});

export const triggerCardEvent = mutation({
  args: {
    cardId: v.id("emotionalCards"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const card = await ctx.db.get(args.cardId);
    if (!card) throw new Error("Card not found");

    const eventId = await ctx.db.insert("cardEvents", {
      cardId: args.cardId,
      triggeredBy: identity.email!,
      cardLabel: card.label,
      timestamp: Date.now(),
    });

    return await ctx.db.get(eventId);
  },
});

export const getCardEvents = query({
  args: { cardId: v.optional(v.id("emotionalCards")) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    if (args.cardId) {
      const events = await ctx.db
        .query("cardEvents")
        .withIndex("by_card", (q) => q.eq("cardId", args.cardId))
        .collect();
      return events.sort((a, b) => b.timestamp - a.timestamp).slice(0, 50);
    }

    const events = await ctx.db
      .query("cardEvents")
      .withIndex("by_user", (q) => q.eq("triggeredBy", identity.email!))
      .collect();
    return events.sort((a, b) => b.timestamp - a.timestamp).slice(0, 100);
  },
});
