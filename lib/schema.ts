import {
  boolean,
  date,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

// Week 2: generate migrations from this schema and run them in CI.
// userId is a placeholder until auth lands (week 3) and defines the users table.

export const expenseTypeEnum = pgEnum("expense_type", [
  "bill",
  "loan",
  "card",
  "other",
]);

export const expenses = pgTable("expenses", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  category: text("category").notNull(),
  type: expenseTypeEnum("type").notNull(),
  frequency: text("frequency").notNull().default("once"),
  dueDate: date("due_date"),
  paid: boolean("paid").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const investments = pgTable("investments", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  assetType: text("asset_type").notNull(),
  quantity: numeric("quantity", { precision: 18, scale: 8 }).notNull(),
  purchasePrice: numeric("purchase_price", { precision: 14, scale: 2 }).notNull(),
  currentPrice: numeric("current_price", { precision: 14, scale: 2 }).notNull(),
  purchaseDate: date("purchase_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const priceHistory = pgTable("price_history", {
  id: uuid("id").defaultRandom().primaryKey(),
  investmentId: uuid("investment_id")
    .notNull()
    .references(() => investments.id, { onDelete: "cascade" }),
  price: numeric("price", { precision: 14, scale: 2 }).notNull(),
  recordedAt: timestamp("recorded_at").defaultNow().notNull(),
});
