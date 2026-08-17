import { useEffect, useRef, useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { DEFAULT_ACCENT } from '../useAccentColor';
import { isValidHex } from '../color';
import { useLocale } from '../i18n/useLocale';
import { LOCALES } from '../i18n/translations';

const RECOMMENDED_COLORS = [
  DEFAULT_ACCENT, // green (default)
  '#aa3bff', // purple
  '#3b82f6', // blue
  '#14b8a6', // teal
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#ec4899', // pink
];

interface SettingsMenuProps {
  accent: string;
  onChange: (hex: string) => void;
}

export function SettingsMenu({ accent, onChange }: SettingsMenuProps) {
  const [open, setOpen] = useState(false);
  const [hexDraft, setHexDraft] = useState(accent);
  const [syncedAccent, setSyncedAccent] = useState(accent);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const { locale, setLocale, t } = useLocale();

  // Keep the text input in sync when accent changes externally (e.g. swatch/picker click),
  // without reverting it while the user is still typing a partial hex value.
  if (accent !== syncedAccent) {
    setSyncedAccent(accent);
    setHexDraft(accent);
  }

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  const handleHexInput = (value: string) => {
    setHexDraft(value);
    const normalized = value.startsWith('#') ? value : `#${value}`;
    if (isValidHex(normalized)) onChange(normalized);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        className="settings__trigger"
        aria-label={t.settingsAria}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        ⚙
      </button>

      {open && (
        <div className="settings__backdrop" onClick={handleBackdropClick}>
          <div className="settings__panel" ref={panelRef}>
            <button
              type="button"
              className="settings__close"
              aria-label={t.closeAria}
              onClick={() => setOpen(false)}
            >
              ✕
            </button>

            <h3 className="settings__title">{t.languageTitle}</h3>
            <div className="settings__locales">
              {LOCALES.map((l) => (
                <button
                  key={l}
                  type="button"
                  className={`settings__locale${l === locale ? ' settings__locale--selected' : ''}`}
                  onClick={() => setLocale(l)}
                >
                  {t.localeName(l)}
                </button>
              ))}
            </div>

            <h3 className="settings__title settings__title--spaced">{t.accentColorTitle}</h3>

            <div className="settings__swatches">
              {RECOMMENDED_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`settings__swatch${
                    color.toLowerCase() === accent.toLowerCase() ? ' settings__swatch--selected' : ''
                  }`}
                  style={{ background: color }}
                  aria-label={`Use color ${color}`}
                  onClick={() => onChange(color)}
                />
              ))}
            </div>

            <HexColorPicker color={accent} onChange={onChange} className="settings__picker" />

            <input
              type="text"
              className="settings__hex-input"
              value={hexDraft}
              onChange={(e) => handleHexInput(e.target.value)}
              spellCheck={false}
              aria-label={t.hexInputAria}
            />
          </div>
        </div>
      )}
    </>
  );
}
