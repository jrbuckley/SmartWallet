import { getExpenses, getInvestments } from "@/lib/data";
import { SettingsExport } from "@/components/settings-export";

// DB-backed: render on each request instead of baking build-time data.
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const data = {
    exportedAt: new Date().toISOString(),
    expenses: await getExpenses(),
    investments: await getInvestments(),
  };

  return (
    <div>
      <h1>Settings</h1>

      <div className="list-card">
        <h2>Data backup</h2>
        <p style={{ marginBottom: "1rem" }}>
          Download your expenses and investments as a JSON file. Import and
          restore are still to come — export only for now.
        </p>
        <SettingsExport data={data} />
      </div>
    </div>
  );
}
