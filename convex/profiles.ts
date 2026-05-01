import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

function slugFromEmail(email: string): string {
  const local = email.split("@")[0] ?? "user";
  const slug = local
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const base = (slug || "user").slice(0, 30);
  return base;
}

function randomSuffix(): string {
  return Math.random().toString(36).slice(2, 8);
}

export const ensureMyProfile = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    if (existing) {
      return { profileId: existing._id, username: existing.username };
    }

    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User record not found");
    }

    const email =
      typeof user.email === "string" && user.email.length > 0
        ? user.email
        : `user-${userId}`;
    const base = slugFromEmail(email);
    let candidate = base;
    for (let attempt = 0; attempt < 20; attempt++) {
      const taken = await ctx.db
        .query("profiles")
        .withIndex("by_username", (q) => q.eq("username", candidate))
        .unique();
      if (!taken) {
        break;
      }
      candidate = `${base}-${randomSuffix()}`;
    }

    const now = Date.now();
    const profileId = await ctx.db.insert("profiles", {
      userId,
      username: candidate,
      createdAt: now,
    });
    return { profileId, username: candidate };
  },
});

export const getMyProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }
    return await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
  },
});

export const getProfileByUserId = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();
  },
});

export const getMyUserId = query({
  args: {},
  handler: async (ctx) => {
    return (await getAuthUserId(ctx)) ?? null;
  },
});
