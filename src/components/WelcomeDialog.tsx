import { useEffect } from 'react';
import { useLocale } from '../i18n/useLocale';

interface WelcomeDialogProps {
  message: string;
  onDismiss: () => void;
}

export function WelcomeDialog({ message, onDismiss }: WelcomeDialogProps) {
  const { t } = useLocale();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onDismiss();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onDismiss]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onDismiss();
  };

  return (
    <div className="welcome__backdrop" onClick={handleBackdropClick}>
      <div className="welcome__panel" role="dialog" aria-modal="true" aria-label={t.welcomeDialogAria}>
        <p className="welcome__message">{message}</p>
        <button type="button" className="welcome__dismiss" onClick={onDismiss}>
          {t.welcomeDialogDismiss}
        </button>
      </div>
    </div>
  );
}
