import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const products = sqliteTable("products", {
  id: text("id").primaryKey(),
  parentProductId: text("parent_product_id").notNull(),
  parentProductName: text("parent_product_name").notNull(),
  slug: text("slug").notNull(),
  name: text("name").notNull(),
  variantName: text("variant_name"),
  description: text("description"),
  category: text("category").notNull().default("Lashes"),
  price: integer("price").notNull(), // stored in cents
  compareAtPrice: integer("compare_at_price"),
  inventory: integer("inventory").notNull().default(0),
  imageUrl: text("image_url"),
  isFeatured: integer("is_featured", { mode: "boolean" }).notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
}, (table) => ({
  slugIdx: uniqueIndex("products_slug_idx").on(table.slug),
}));

export const orders = sqliteTable("orders", {
  id: text("id").primaryKey(),
  status: text("status").notNull().default("pending"), // pending, paid, shipped, fulfilled
  fulfillmentStatus: text("fulfillment_status").notNull().default("unfulfilled"),
  subtotal: integer("subtotal").notNull(),
  total: integer("total").notNull(), // stored in cents
  customerEmail: text("customer_email").notNull(),
  customerName: text("customer_name"),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const orderItems = sqliteTable("order_items", {
  id: text("id").primaryKey(),
  orderId: text("order_id").notNull().references(() => orders.id),
  productId: text("product_id").notNull().references(() => products.id),
  quantity: integer("quantity").notNull(),
  price: integer("price").notNull(), // price at the time of purchase
});
