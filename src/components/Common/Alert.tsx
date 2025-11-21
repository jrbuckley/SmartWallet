import { useEffect } from 'react';
import './Alert.css';

interface AlertProps {
  isOpen: boolean;
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  onClose: () => void;
  duration?: number;
}

export default function Alert({
  isOpen,
  message,
  type = 'info',
  onClose,
  duration = 4000,
}: AlertProps) {
  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  if (!isOpen) return null;

  return (
    <div className={`alert alert-${type}`}>
      <div className="alert-content">
        <span className="alert-message">{message}</span>
        <button className="alert-close" onClick={onClose}>×</button>
      </div>
    </div>
  );
}

