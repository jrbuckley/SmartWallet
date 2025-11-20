import { useState } from 'react';
import { useFinancial } from '../../contexts/FinancialContext';
import { saveDataToFile, loadDataFromFile, exportDataAsJSON, importDataFromJSON } from '../../utils/fileStorage';
import './DataManagement.css';

export default function DataManagement() {
  const { user, expenses, investments, setDataFromFile } = useFinancial();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSaveToFile = async () => {
    setIsLoading(true);
    try {
      const success = await saveDataToFile({
        user,
        expenses,
        investments,
      });
      if (success) {
        showMessage('success', 'Data saved to file successfully!');
      } else {
        showMessage('error', 'Failed to save data. Please try again.');
      }
    } catch (error) {
      console.error('Error saving file:', error);
      showMessage('error', 'An error occurred while saving the file.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadFromFile = async () => {
    if (!confirm('Loading data from a file will replace your current data. Are you sure?')) {
      return;
    }

    setIsLoading(true);
    try {
      const data = await loadDataFromFile();
      if (data) {
        setDataFromFile(data);
        showMessage('success', 'Data loaded from file successfully!');
      } else {
        showMessage('error', 'Failed to load data or file was cancelled.');
      }
    } catch (error) {
      console.error('Error loading file:', error);
      showMessage('error', 'An error occurred while loading the file.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportJSON = () => {
    try {
      const json = exportDataAsJSON({
        user,
        expenses,
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
      showMessage('success', 'Data exported as JSON!');
    } catch (error) {
      console.error('Error exporting JSON:', error);
      showMessage('error', 'Failed to export data.');
    }
  };

  const handleImportJSON = () => {
    if (!confirm('Importing data will replace your current data. Are you sure?')) {
      return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const json = event.target?.result as string;
            const data = importDataFromJSON(json);
            if (data) {
              setDataFromFile(data);
              showMessage('success', 'Data imported successfully!');
            } else {
              showMessage('error', 'Invalid JSON file format.');
            }
          } catch (error) {
            console.error('Error importing JSON:', error);
            showMessage('error', 'Failed to import data. Please check the file format.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <div className="data-management">
      <h2>Data Management</h2>
      <p className="description">
        Manage your financial data. Save to files for long-term storage and backup.
      </p>

      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="data-actions">
        <div className="action-card">
          <h3>💾 Save to File</h3>
          <p>Save your data to a local file using the File System Access API (modern browsers) or download as JSON.</p>
          <button
            className="btn-primary"
            onClick={handleSaveToFile}
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save to File'}
          </button>
        </div>

        <div className="action-card">
          <h3>📂 Load from File</h3>
          <p>Load your data from a previously saved file. This will replace your current data.</p>
          <button
            className="btn-secondary"
            onClick={handleLoadFromFile}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Load from File'}
          </button>
        </div>

        <div className="action-card">
          <h3>📤 Export JSON</h3>
          <p>Download your data as a JSON file for backup or manual storage.</p>
          <button
            className="btn-secondary"
            onClick={handleExportJSON}
            disabled={isLoading}
          >
            Export JSON
          </button>
        </div>

        <div className="action-card">
          <h3>📥 Import JSON</h3>
          <p>Import data from a previously exported JSON file. This will replace your current data.</p>
          <button
            className="btn-secondary"
            onClick={handleImportJSON}
            disabled={isLoading}
          >
            Import JSON
          </button>
        </div>
      </div>

      <div className="info-box">
        <h4>💡 Storage Information</h4>
        <ul>
          <li><strong>Current Storage:</strong> Data is stored in browser localStorage for quick access</li>
          <li><strong>File Storage:</strong> Use "Save to File" to save data to a local file that persists even if browser data is cleared</li>
          <li><strong>Backup:</strong> Regularly export your data as JSON for additional backup</li>
          <li><strong>File Location:</strong> When using File System Access API, you can choose where to save the file</li>
        </ul>
      </div>
    </div>
  );
}

