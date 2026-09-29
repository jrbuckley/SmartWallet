import { getExpenses } from "@/lib/data";
import { ExpenseForm } from "@/components/expense-form";
import { ExpenseRowActions } from "@/components/expense-row-actions";

// DB-backed: render on each request instead of baking build-time data.
export const dynamic = "force-dynamic";

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default async function ExpensesPage() {
  const expenses = await getExpenses();

  return (
    <div>
      <h1>Expenses</h1>

      <div className="list-card">
        <h2>Add expense</h2>
        <ExpenseForm />
      </div>

      <div className="list-card">
        <h2>All expenses</h2>
        <table className="data">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Type</th>
              <th>Frequency</th>
              <th>Due</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((e) => (
              <tr key={e.id}>
                <td>{e.name}</td>
                <td>{e.category}</td>
                <td>{e.type}</td>
                <td>{e.frequency}</td>
                <td>{e.dueDate ?? "—"}</td>
                <td>{usd.format(e.amount)}</td>
                <td>
                  <span className={`pill ${e.paid ? "pill-paid" : "pill-unpaid"}`}>
                    {e.paid ? "Paid" : "Unpaid"}
                  </span>
                </td>
                <td>
                  <ExpenseRowActions id={e.id} paid={e.paid} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
