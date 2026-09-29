import { buildInsights } from "@/lib/insights";
import { getExpenses, getInvestments } from "@/lib/data";

export default async function InsightsPage() {
  const insights = buildInsights(getExpenses(), getInvestments());

  return (
    <div>
      <h1>Savings opportunities</h1>
      <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
        Rule-based insights for now — Phase 3 replaces this engine with a real
        LLM-backed analysis.
      </p>

      {insights.map((insight) => (
        <div className="list-card" key={insight.id}>
          <span className={`pill pill-${insight.priority}`}>
            {insight.priority} priority
          </span>{" "}
          <span style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
            {insight.category}
          </span>
          <h2 style={{ marginBottom: "0.5rem" }}>{insight.title}</h2>
          <p style={{ margin: 0 }}>{insight.description}</p>
        </div>
      ))}
    </div>
  );
}
