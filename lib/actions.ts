"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db, DEMO_USER_ID } from "./db";
import { expenses } from "./schema";
import type { ExpenseType, Frequency } from "./data";

export interface ActionResult {
  ok: boolean;
  error?: string;
}

const EXPENSE_TYPES: ExpenseType[] = ["bill", "loan", "card", "other"];
const FREQUENCIES: Frequency[] = ["once", "weekly", "monthly", "yearly"];

function revalidateExpensePages() {
  revalidatePath("/expenses");
  revalidatePath("/dashboard");
  revalidatePath("/insights");
}

export async function createExpense(
  formData: FormData,
): Promise<ActionResult> {
  const name = String(formData.get("name") ?? "").trim();
  const amount = Number(formData.get("amount") ?? NaN);
  const category = String(formData.get("category") ?? "").trim() || "Uncategorized";
  const type = String(formData.get("type") ?? "bill");
  const frequency = String(formData.get("frequency") ?? "monthly");
  const dueDateRaw = String(formData.get("dueDate") ?? "").trim();

  if (!name) {
    return { ok: false, error: "Name is required." };
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    return { ok: false, error: "Amount must be a positive number." };
  }
  if (!(EXPENSE_TYPES as string[]).includes(type)) {
    return { ok: false, error: "Invalid expense type." };
  }
  if (!(FREQUENCIES as string[]).includes(frequency)) {
    return { ok: false, error: "Invalid frequency." };
  }
  let dueDate: string | null = null;
  if (dueDateRaw) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dueDateRaw)) {
      return { ok: false, error: "Due date must be YYYY-MM-DD." };
    }
    dueDate = dueDateRaw;
  }

  try {
    await db()
      .insert(expenses)
      .values({
        userId: DEMO_USER_ID,
        name,
        amount: amount.toFixed(2),
        category,
        type: type as ExpenseType,
        frequency,
        dueDate,
        paid: false,
      });
  } catch (err) {
    console.error("createExpense failed:", err);
    return { ok: false, error: "Could not save the expense. Try again." };
  }

  revalidateExpensePages();
  return { ok: true };
}

export async function toggleExpensePaid(
  id: string,
  paid: boolean,
): Promise<ActionResult> {
  try {
    await db()
      .update(expenses)
      .set({ paid })
      .where(and(eq(expenses.id, id), eq(expenses.userId, DEMO_USER_ID)));
  } catch (err) {
    console.error("toggleExpensePaid failed:", err);
    return { ok: false, error: "Could not update the expense. Try again." };
  }

  revalidateExpensePages();
  return { ok: true };
}

export async function deleteExpense(id: string): Promise<ActionResult> {
  try {
    await db()
      .delete(expenses)
      .where(and(eq(expenses.id, id), eq(expenses.userId, DEMO_USER_ID)));
  } catch (err) {
    console.error("deleteExpense failed:", err);
    return { ok: false, error: "Could not delete the expense. Try again." };
  }

  revalidateExpensePages();
  return { ok: true };
}
