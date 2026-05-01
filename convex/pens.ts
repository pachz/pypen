import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const MAX_CONTENT = 400_000;
const MAX_TITLE = 200;
const MAX_CDN_URLS = 20;
const MAX_URL_LENGTH = 2048;
const MAX_HEAD_SNIPPET = 100_000;
const MAX_HTML_CLASS = 500;

function assertPenContent(html: string, css: string, js: string) {
  if (html.length > MAX_CONTENT || css.length > MAX_CONTENT || js.length > MAX_CONTENT) {
    throw new Error("Pen content is too large");
  }
}

function assertCdnUrls(urls: string[]) {
  if (urls.length > MAX_CDN_URLS) {
    throw new Error("Too many CDN URLs");
  }
  for (const url of urls) {
    if (url.length > MAX_URL_LENGTH) {
      throw new Error("CDN URL is too long");
    }
    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      throw new Error("Invalid CDN URL");
    }
    if (parsed.protocol !== "https:") {
      throw new Error("CDN URLs must use https");
    }
  }
}

export const listPublicPens = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = Math.min(Math.max(args.limit ?? 24, 1), 48);
    const pens = await ctx.db
      .query("pens")
      .withIndex("by_public_updated", (q) => q.eq("isPublic", true))
      .order("desc")
      .take(limit);

    const result = [];
    for (const pen of pens) {
      const profile = await ctx.db
        .query("profiles")
        .withIndex("by_user", (q) => q.eq("userId", pen.userId))
        .unique();
      result.push({
        _id: pen._id,
        title: pen.title,
        updatedAt: pen.updatedAt,
        authorUsername: profile?.username ?? "unknown",
      });
    }
    return result;
  },
});

export const listMyPens = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }
    const limit = Math.min(Math.max(args.limit ?? 48, 1), 100);
    return await ctx.db
      .query("pens")
      .withIndex("by_user_updated", (q) => q.eq("userId", userId))
      .order("desc")
      .take(limit);
  },
});

export const getPen = query({
  args: { penId: v.id("pens") },
  handler: async (ctx, args) => {
    const pen = await ctx.db.get(args.penId);
    if (!pen) {
      return null;
    }
    const userId = await getAuthUserId(ctx);
    if (!pen.isPublic && pen.userId !== userId) {
      return null;
    }
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", pen.userId))
      .unique();
    return {
      ...pen,
      authorUsername: profile?.username ?? "unknown",
    };
  },
});

export const createPen = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    const now = Date.now();
    return await ctx.db.insert("pens", {
      userId,
      title: "Untitled Pen",
      html: "",
      css: "",
      js: "",
      cdnUrls: [],
      headSnippet: "",
      htmlClass: "",
      isPublic: true,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updatePen = mutation({
  args: {
    penId: v.id("pens"),
    title: v.optional(v.string()),
    html: v.optional(v.string()),
    css: v.optional(v.string()),
    js: v.optional(v.string()),
    cdnUrls: v.optional(v.array(v.string())),
    headSnippet: v.optional(v.string()),
    htmlClass: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    const pen = await ctx.db.get(args.penId);
    if (!pen || pen.userId !== userId) {
      throw new Error("Pen not found or access denied");
    }

    const rawTitle = args.title ?? pen.title;
    const trimmed = rawTitle.trim();
    const title =
      trimmed.length > 0 ? trimmed.slice(0, MAX_TITLE) : "Untitled Pen";

    const html = args.html ?? pen.html;
    const css = args.css ?? pen.css;
    const js = args.js ?? pen.js;
    assertPenContent(html, css, js);

    const cdnUrls = args.cdnUrls ?? pen.cdnUrls;
    assertCdnUrls(cdnUrls);

    const headSnippet = args.headSnippet ?? pen.headSnippet ?? "";
    if (headSnippet.length > MAX_HEAD_SNIPPET) {
      throw new Error("Head snippet is too large");
    }

    const htmlClass = args.htmlClass ?? pen.htmlClass ?? "";
    if (htmlClass.length > MAX_HTML_CLASS) {
      throw new Error("HTML class string is too long");
    }

    const isPublic = args.isPublic ?? pen.isPublic;

    await ctx.db.patch(args.penId, {
      title,
      html,
      css,
      js,
      cdnUrls,
      headSnippet,
      htmlClass,
      isPublic,
      updatedAt: Date.now(),
    });
    return args.penId;
  },
});

export const deletePen = mutation({
  args: { penId: v.id("pens") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    const pen = await ctx.db.get(args.penId);
    if (!pen || pen.userId !== userId) {
      throw new Error("Pen not found or access denied");
    }
    await ctx.db.delete(args.penId);
  },
});
