"use node";

import { getAuthUserId } from "@convex-dev/auth/server";
import { fetchPen } from "codepen-fetcher";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";
import { action } from "./_generated/server";

const MAX_CDN_URLS = 20;

/**
 * Extract CodePen pen hash from a URL or accept a bare pen id
 * (e.g. `https://codepen.io/chriscoyier/pen/gfdDu` → `gfdDu`).
 */
function parseCodePenPenId(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) {
    return null;
  }
  if (
    /^[a-zA-Z0-9_-]{5,12}$/.test(trimmed) &&
    !trimmed.includes("/") &&
    !trimmed.includes(".")
  ) {
    return trimmed;
  }
  try {
    const href = trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
    const u = new URL(href);
    if (!u.hostname.endsWith("codepen.io")) {
      return null;
    }
    const pen = u.pathname.match(/\/pen\/([a-zA-Z0-9_-]+)/);
    if (pen) {
      return pen[1];
    }
    const other = u.pathname.match(
      /\/(?:full|details|embed|pres|debug)\/([a-zA-Z0-9_-]+)/,
    );
    if (other) {
      return other[1];
    }
  } catch {
    return null;
  }
  return null;
}

function mergeCdnUrls(styles: string[], scripts: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of [...styles, ...scripts]) {
    const u = raw.trim();
    if (!u || seen.has(u)) {
      continue;
    }
    try {
      if (new URL(u).protocol !== "https:") {
        continue;
      }
    } catch {
      continue;
    }
    seen.add(u);
    out.push(u);
    if (out.length >= MAX_CDN_URLS) {
      break;
    }
  }
  return out;
}

export const importFromCodePen = action({
  args: { urlOrId: v.string() },
  handler: async (
    ctx,
    args,
  ): Promise<{ penId: Id<"pens">; warnings: string[] }> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("You must be signed in to import a pen.");
    }
    const shortId = parseCodePenPenId(args.urlOrId);
    if (!shortId) {
      throw new Error(
        "Could not read a CodePen id. Paste a full link (e.g. codepen.io/user/pen/abcXyZ) or the pen’s short id.",
      );
    }
    const pen = await fetchPen(shortId);
    if (!pen) {
      throw new Error(
        "That CodePen was not found, or it is not accessible. Public pens can be imported.",
      );
    }

    const warnings: string[] = [];
    if (pen.config.cssPreProcessor && pen.config.cssPreProcessor !== "none") {
      warnings.push(
        `This pen’s CSS is written for “${pen.config.cssPreProcessor}”, not plain CSS. You may need to convert it or paste compiled CSS from CodePen.`,
      );
    }
    if (pen.config.jsPreProcessor && pen.config.jsPreProcessor !== "none") {
      warnings.push(
        `This pen’s JavaScript is written for “${pen.config.jsPreProcessor}”, not plain JS. You may need to convert it or paste compiled JS from CodePen.`,
      );
    }

    const cdnUrls = mergeCdnUrls(
      pen.config.styles ?? [],
      pen.config.scripts ?? [],
    );

    const newPenId = await ctx.runMutation(
      internal.pens.createPenFromCodePenImport,
      {
        userId,
        title: pen.title || "Imported from CodePen",
        html: pen.config.html ?? "",
        css: pen.config.css ?? "",
        js: pen.config.js ?? "",
        cdnUrls,
        headSnippet: pen.config.head ?? "",
        htmlClass: "",
      },
    );

    return { penId: newPenId, warnings };
  },
});
