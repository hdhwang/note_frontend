import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

export type TableDensity = 'small' | 'middle' | 'large';
export type ThemeMode = 'light' | 'dark';

export interface AppSettings {
  tableDensity: TableDensity;
  themeMode: ThemeMode;
  layoutColor: string;
  siderWidth: number;
  collapsed: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  tableDensity: 'middle',
  themeMode: 'light',
  layoutColor: '#1B3150',
  siderWidth: 200,
  collapsed: false,
};

const STORAGE_KEY = 'app_settings';

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (partial: Partial<AppSettings>) => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

function loadSettings(): AppSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.error('Failed to load settings:', e);
  }
  return { ...DEFAULT_SETTINGS };
}

function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
}

/** hex 색상을 밝게 만드는 유틸리티 */
function lightenColor(hex: string, amount: number = 0.15): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, ((num >> 16) & 0xFF) + Math.round(255 * amount));
  const g = Math.min(255, ((num >> 8) & 0xFF) + Math.round(255 * amount));
  const b = Math.min(255, (num & 0xFF) + Math.round(255 * amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

/** CSS 변수를 업데이트하여 레이아웃 색상을 동적으로 반영 */
function updateCSSVariables(layoutColor: string): void {
  const root = document.documentElement;
  root.style.setProperty('--layout-color', layoutColor);
  root.style.setProperty('--layout-color-selected', lightenColor(layoutColor, 0.12));
}

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(loadSettings);

  useEffect(() => {
    updateCSSVariables(settings.layoutColor);
  }, [settings.layoutColor]);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // 초기 CSS 변수 설정
  useEffect(() => {
    updateCSSVariables(settings.layoutColor);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateSettings = useCallback((partial: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...partial }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings({ ...DEFAULT_SETTINGS });
    updateCSSVariables(DEFAULT_SETTINGS.layoutColor);
  }, []);

  const value = useMemo(() => ({ settings, updateSettings, resetSettings }), [settings, updateSettings, resetSettings]);

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
