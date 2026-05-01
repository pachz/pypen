import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,
  profiles: defineTable({
    userId: v.id("users"),
    username: v.string(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_username", ["username"]),
  pens: defineTable({
    userId: v.id("users"),
    title: v.string(),
    html: v.string(),
    css: v.string(),
    js: v.string(),
    cdnUrls: v.array(v.string()),
    isPublic: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_updated", ["userId", "updatedAt"])
    .index("by_public_updated", ["isPublic", "updatedAt"]),
});
