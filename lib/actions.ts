"use server";

import { revalidatePath } from "next/cache";

export interface ActionResult {
  ok: boolean;
  error?: string;
}

// TODO(week-2): persist via db() from lib/db.ts once Postgres is wired.
// For now this validates input and revalidates the page so the mutation
// plumbing (client form -> server action -> revalidation) is exercised.
export async function createExpense(
  formData: FormData,
): Promise<ActionResult> {
  const name = String(formData.get("name") ?? "").trim();
  const amount = Number(formData.get("amount") ?? NaN);

  if (!name) {
    return { ok: false, error: "Name is required." };
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    return { ok: false, error: "Amount must be a positive number." };
  }

  revalidatePath("/expenses");
  return { ok: true };
}
