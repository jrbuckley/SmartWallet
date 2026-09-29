import { getInvestments, getInvestmentTotals } from "@/lib/data";

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default async function InvestmentsPage() {
  const investments = getInvestments();
  const totals = getInvestmentTotals();

  return (
    <div>
      <h1>Investments</h1>

      <div className="dashboard-summary">
        <div className="summary-card">
          <h3>Total value</h3>
          <p className="summary-value">{usd.format(totals.totalValue)}</p>
        </div>
        <div className="summary-card">
          <h3>Total gain / loss</h3>
          <p className={`summary-value ${totals.totalGainLoss >= 0 ? "positive" : "negative"}`}>
            {totals.totalGainLoss >= 0 ? "+" : ""}
            {usd.format(totals.totalGainLoss)}
          </p>
        </div>
      </div>

      <div className="list-card">
        <h2>Holdings</h2>
        <table className="data">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Qty</th>
              <th>Buy price</th>
              <th>Current</th>
              <th>Value</th>
              <th>Gain / loss</th>
            </tr>
          </thead>
          <tbody>
            {investments.map((i) => {
              const value = i.quantity * i.currentPrice;
              const gainLoss = (i.currentPrice - i.purchasePrice) * i.quantity;
              return (
                <tr key={i.id}>
                  <td>{i.name}</td>
                  <td>{i.assetType}</td>
                  <td>{i.quantity}</td>
                  <td>{usd.format(i.purchasePrice)}</td>
                  <td>{usd.format(i.currentPrice)}</td>
                  <td>{usd.format(value)}</td>
                  <td className={gainLoss >= 0 ? "positive" : "negative"}>
                    {gainLoss >= 0 ? "+" : ""}
                    {usd.format(gainLoss)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
