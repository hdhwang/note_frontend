import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

export type TableDensity = 'small' | 'middle' | 'large';
export type ThemeMode = 'light' | 'dark';

export interface AppSettings {
  tableDensity: TableDensity;
  themeMode: ThemeMode;
  layoutColor: string;
  siderWidth: number;
  collapsed: boolean;
  favorites: string[];
  favoritesExpanded: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  tableDensity: 'middle',
  themeMode: 'light',
  layoutColor: '#1B3150',
  siderWidth: 220,
  collapsed: false,
  favorites: [],
  favoritesExpanded: true,
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
      const parsed = JSON.parse(stored);
      if (parsed.siderWidth && parsed.siderWidth < 220) {
        parsed.siderWidth = 220;
      }
      return { ...DEFAULT_SETTINGS, ...parsed };
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
    if (settings.themeMode === 'dark') {
      document.documentElement.classList.add('dark-theme');
    } else {
      document.documentElement.classList.remove('dark-theme');
    }
  }, [settings.layoutColor, settings.themeMode]);

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
    
    // 테이블 컬럼/순서 관련 설정 삭제
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('smart_table_')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
    window.dispatchEvent(new Event('reset_table_settings'));
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
