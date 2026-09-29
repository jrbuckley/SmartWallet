"use client";

import { useState } from "react";
import { deleteExpense, toggleExpensePaid } from "@/lib/actions";

export function ExpenseRowActions({
  id,
  paid,
}: {
  id: string;
  paid: boolean;
}) {
  const [pending, setPending] = useState(false);

  async function run(fn: () => Promise<{ ok: boolean; error?: string }>) {
    setPending(true);
    try {
      await fn();
    } finally {
      setPending(false);
    }
  }

  return (
    <div style={{ display: "flex", gap: "0.5rem" }}>
      <button
        type="button"
        className="btn-secondary"
        disabled={pending}
        onClick={() => run(() => toggleExpensePaid(id, !paid))}
      >
        {paid ? "Mark unpaid" : "Mark paid"}
      </button>
      <button
        type="button"
        className="btn-secondary"
        disabled={pending}
        onClick={() => {
          if (window.confirm("Delete this expense?")) {
            run(() => deleteExpense(id));
          }
        }}
      >
        Delete
      </button>
    </div>
  );
}
