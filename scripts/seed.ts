// Dev seed: fictional sample data only — never real account names or amounts.
// Run with `npm run db:seed` after `npm run db:migrate`. Re-runnable: it
// clears the demo user's rows first.
import { eq } from "drizzle-orm";
import { db, DEMO_USER_ID } from "../lib/db";
import { expenses, investments } from "../lib/schema";

function daysFromNow(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

const SEED_EXPENSES = [
  { name: "Maple Ave rent", amount: "1650.00", category: "Housing", type: "bill", frequency: "monthly", dueDate: daysFromNow(4), paid: false },
  { name: "Demo Visa payment", amount: "720.00", category: "Debt", type: "card", frequency: "monthly", dueDate: daysFromNow(9), paid: false },
  { name: "Demo auto loan", amount: "389.00", category: "Transport", type: "loan", frequency: "monthly", dueDate: daysFromNow(12), paid: true },
  { name: "Demo streaming bundle", amount: "29.00", category: "Entertainment", type: "bill", frequency: "monthly", dueDate: daysFromNow(20), paid: false },
  { name: "Demo gym membership", amount: "55.00", category: "Health", type: "bill", frequency: "monthly", dueDate: daysFromNow(25), paid: false },
] as const;

const SEED_INVESTMENTS = [
  { name: "VTI", assetType: "ETF", quantity: "40", purchasePrice: "240.00", currentPrice: "285.50", purchaseDate: "2024-03-15" },
  { name: "AAPL", assetType: "Stock", quantity: "25", purchasePrice: "175.00", currentPrice: "232.80", purchaseDate: "2023-11-02" },
  { name: "BTC", assetType: "Crypto", quantity: "0.15", purchasePrice: "62000.00", currentPrice: "97500.00", purchaseDate: "2024-06-20" },
] as const;

async function main() {
  const database = db();

  await database.delete(expenses).where(eq(expenses.userId, DEMO_USER_ID));
  await database.delete(investments).where(eq(investments.userId, DEMO_USER_ID));

  await database.insert(expenses).values(
    SEED_EXPENSES.map((e) => ({ ...e, userId: DEMO_USER_ID })),
  );
  await database.insert(investments).values(
    SEED_INVESTMENTS.map((i) => ({ ...i, userId: DEMO_USER_ID })),
  );

  console.log(
    `Seeded ${SEED_EXPENSES.length} expenses and ${SEED_INVESTMENTS.length} investments for ${DEMO_USER_ID}.`,
  );
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
