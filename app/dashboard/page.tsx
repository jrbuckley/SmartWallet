import {
  getDashboardSummary,
  getExpenses,
  getInvestments,
  getUpcomingExpenses,
} from "@/lib/data";

// DB-backed: render on each request instead of baking build-time data.
export const dynamic = "force-dynamic";

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default async function DashboardPage() {
  const expenses = await getExpenses();
  const investments = await getInvestments();
  const summary = getDashboardSummary(expenses, investments);
  const upcoming = getUpcomingExpenses(expenses, 30);

  return (
    <div className="dashboard-container">
      <h1>Dashboard</h1>

      <div className="dashboard-summary">
        <div className="summary-card">
          <h3>Monthly expenses</h3>
          <p className="summary-value">{usd.format(summary.monthlyExpenses)}</p>
        </div>
        <div className="summary-card">
          <h3>Investments value</h3>
          <p className="summary-value">{usd.format(summary.investmentsValue)}</p>
        </div>
        <div className="summary-card">
          <h3>Unpaid bills</h3>
          <p className="summary-value">{summary.unpaidCount}</p>
        </div>
      </div>

      <div className="list-card">
        <h2>Due in the next 30 days</h2>
        {upcoming.length === 0 ? (
          <p>Nothing due — you&apos;re all caught up.</p>
        ) : (
          <table className="data">
            <thead>
              <tr>
                <th>Name</th>
                <th>Due</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {upcoming.map((e) => (
                <tr key={e.id}>
                  <td>{e.name}</td>
                  <td>{e.dueDate}</td>
                  <td>{usd.format(e.amount)}</td>
                  <td>
                    <span className={`pill ${e.paid ? "pill-paid" : "pill-unpaid"}`}>
                      {e.paid ? "Paid" : "Unpaid"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
