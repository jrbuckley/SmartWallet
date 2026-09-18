"use client";

import { useState } from "next";
import { createExpense } from "@/lib/actions";

export function ExpenseForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    const result = await createExpense(formData);
    setPending(false);
    if (!result.ok) {
      setError(result.error);
    }
  }

  return (
    <form action={onSubmit}>
      <div className="form-grid">
        <div className="field">
          <label htmlFor="name">Name</label>
          <input id="name" name="name" required placeholder="Rent" />
        </div>
        <div className="field">
          <label htmlFor="amount">Amount</label>
          <input
            id="amount"
            name="amount"
            type="number"
            min="0"
            step="0.01"
            required
            placeholder="1500.00"
          />
        </div>
        <div className="field">
          <label htmlFor="category">Category</label>
          <input id="category" name="category" placeholder="Housing" />
        </div>
        <div className="field">
          <label htmlFor="type">Type</label>
          <select id="type" name="type" defaultValue="bill">
            <option value="bill">Bill</option>
            <option value="loan">Loan</option>
            <option value="card">Credit card</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="frequency">Frequency</label>
          <select id="frequency" name="frequency" defaultValue="monthly">
            <option value="once">Once</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
        <div>
          <button type="submit" className="primary" disabled={pending}>
            {pending ? "Adding…" : "Add expense"}
          </button>
        </div>
      </div>
      {error && <p className="form-error">{error}</p>}
    </form>
  );
}
