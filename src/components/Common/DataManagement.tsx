import { useState } from 'react';
import { useFinancial } from '../../contexts/FinancialContext';
import { exportDataAsJSON, importDataFromJSON } from '../../utils/fileStorage';
import ConfirmationModal from './ConfirmationModal';
import Alert from './Alert';
import './DataManagement.css';

export default function DataManagement() {
  const { user, expenses, income, debts, investments, setDataFromFile } = useFinancial();
  const [isLoading, setIsLoading] = useState(false);
  const [confirmImport, setConfirmImport] = useState(false);
  const [alert, setAlert] = useState<{ isOpen: boolean; message: string; type: 'success' | 'error' | 'info' | 'warning' }>({
    isOpen: false,
    message: '',
    type: 'info',
  });

  const handleExportJSON = () => {
    try {
      const json = exportDataAsJSON({
        user,
        expenses,
        income,
        debts,
        investments,
      });
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `smartwallet-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setAlert({ isOpen: true, message: 'Data exported as JSON!', type: 'success' });
    } catch (error) {
      console.error('Error exporting JSON:', error);
      setAlert({ isOpen: true, message: 'Failed to export data.', type: 'error' });
    }
  };

  const handleImportJSON = () => {
    setConfirmImport(true);
  };

  const confirmImportAction = async () => {
    setConfirmImport(false);

    setIsLoading(true);
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            const json = event.target?.result as string;
            const data = importDataFromJSON(json);
            if (data) {
              await setDataFromFile(data);
              setAlert({ isOpen: true, message: 'Data imported successfully!', type: 'success' });
            } else {
              setAlert({ isOpen: true, message: 'Invalid JSON file format.', type: 'error' });
            }
          } catch (error) {
            console.error('Error importing JSON:', error);
            setAlert({ isOpen: true, message: 'Failed to import data. Please check the file format.', type: 'error' });
          } finally {
            setIsLoading(false);
          }
        };
        reader.readAsText(file);
      } else {
        setIsLoading(false);
      }
    };
    input.click();
  };

  return (
    <div className="data-management">
      <h2>Data Management</h2>
      
      <ConfirmationModal
        isOpen={confirmImport}
        title="Import Data"
        message="Importing data will replace your current data in Supabase. Are you sure?"
        confirmText="Import"
        cancelText="Cancel"
        variant="warning"
        onConfirm={confirmImportAction}
        onCancel={() => setConfirmImport(false)}
      />

      <Alert
        isOpen={alert.isOpen}
        message={alert.message}
        type={alert.type}
        onClose={() => setAlert({ ...alert, isOpen: false })}
      />
      <p className="description">
        Export and import your financial data as JSON backups. Your data is automatically saved to Supabase.
      </p>

      <div className="data-actions">
        <div className="action-card">
          <h3>📤 Export JSON</h3>
          <p>Download your data as a JSON file for backup. Your data is automatically saved to Supabase, but this provides an additional backup.</p>
          <button
            className="btn-primary"
            onClick={handleExportJSON}
            disabled={isLoading}
          >
            Export JSON
          </button>
        </div>

        <div className="action-card">
          <h3>📥 Import JSON</h3>
          <p>Import data from a previously exported JSON file. This will replace your current data in Supabase.</p>
          <button
            className="btn-secondary"
            onClick={handleImportJSON}
            disabled={isLoading}
          >
            {isLoading ? 'Importing...' : 'Import JSON'}
          </button>
        </div>
      </div>

      <div className="info-box">
        <h4>💡 Storage Information</h4>
        <ul>
          <li><strong>Primary Storage:</strong> All data is automatically saved to your Supabase database</li>
          <li><strong>Persistence:</strong> Your data persists across devices and browser sessions</li>
          <li><strong>Backup:</strong> Regularly export your data as JSON for additional backup</li>
          <li><strong>Import:</strong> Use Import JSON to restore from a backup or migrate data</li>
        </ul>
      </div>
    </div>
  );
}
