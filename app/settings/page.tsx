import { getExpenses, getInvestments } from "@/lib/data";
import { SettingsExport } from "@/components/settings-export";

export default async function SettingsPage() {
  const data = {
    exportedAt: new Date().toISOString(),
    expenses: getExpenses(),
    investments: getInvestments(),
  };

  return (
    <div>
      <h1>Settings</h1>

      <div className="list-card">
        <h2>Data backup</h2>
        <p style={{ marginBottom: "1rem" }}>
          Download your expenses and investments as a JSON file. Import and
          restore arrive with the Postgres wiring — export only for now.
        </p>
        <SettingsExport data={data} />
      </div>
    </div>
  );
}
