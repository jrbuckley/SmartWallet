"use client";

export function SettingsExport({ data }: { data: unknown }) {
  function onExport() {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `smartwallet-backup-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <button type="button" className="primary" onClick={onExport}>
      Export as JSON
    </button>
  );
}
