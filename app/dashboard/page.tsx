import { getDashboardSummary, getUpcomingExpenses } from "@/lib/data";

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default async function DashboardPage() {
  const summary = getDashboardSummary();
  const upcoming = getUpcomingExpenses(30);

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
