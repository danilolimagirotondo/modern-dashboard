import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';

interface AppearanceSettings {
  theme: 'light' | 'dark' | 'auto';
  compactMode: boolean;
  sidebarPosition: 'left' | 'right' | 'hidden';
  language: string;
  timezone: string;
  reducedMotion: boolean;
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large';
}

interface ThemeContextType {
  appearance: AppearanceSettings;
  updateAppearance: (settings: Partial<AppearanceSettings>) => void;
  resetAppearance: () => void;
}

const defaultAppearance: AppearanceSettings = {
  theme: 'light',
  compactMode: false,
  sidebarPosition: 'left',
  language: 'pt-BR',
  timezone: 'America/Sao_Paulo',
  reducedMotion: false,
  highContrast: false,
  fontSize: 'medium',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Function to apply theme settings to document
const applyThemeToDocument = (appearance: AppearanceSettings) => {
  const { theme, compactMode, highContrast, reducedMotion, fontSize, sidebarPosition } = appearance;

  // Remove all theme classes first
  document.documentElement.classList.remove('dark', 'compact-mode', 'high-contrast', 'reduced-motion');
  
  // Apply theme
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else if (theme === 'auto') {
    // Auto theme based on system preference
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
  }
  // Note: 'light' theme doesn't need a class, it's the default

  // Apply other settings
  if (compactMode) {
    document.documentElement.classList.add('compact-mode');
  }

  if (highContrast) {
    document.documentElement.classList.add('high-contrast');
  }

  if (reducedMotion) {
    document.documentElement.classList.add('reduced-motion');
  }

  // Apply font size
  document.documentElement.setAttribute('data-font-size', fontSize);

  // Apply sidebar position
  document.documentElement.setAttribute('data-sidebar-position', sidebarPosition);

  // Update CSS custom property for root font size
  const fontSizeMap = {
    small: '13px',
    medium: '14px',
    large: '16px'
  };
  
  document.documentElement.style.setProperty('--font-size', fontSizeMap[fontSize]);

  console.log('🎨 Theme applied:', {
    theme,
    compactMode,
    fontSize,
    sidebarPosition,
    highContrast,
    reducedMotion
  });
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [appearance, setAppearance] = useState<AppearanceSettings>(defaultAppearance);
  const [initialized, setInitialized] = useState(false);

  // Initialize theme from localStorage when user changes
  useEffect(() => {
    if (!user) {
      // Apply default theme for non-authenticated users
      applyThemeToDocument(defaultAppearance);
      setAppearance(defaultAppearance);
      setInitialized(true);
      return;
    }

    console.log('🎨 Loading theme settings for user:', user.id);
    
    try {
      const savedSettings = localStorage.getItem(`settings_${user.id}`);
      let userAppearance = defaultAppearance;

      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        if (parsedSettings.appearance) {
          userAppearance = { ...defaultAppearance, ...parsedSettings.appearance };
          console.log('📂 Loaded appearance settings:', userAppearance);
        }
      }

      // Apply theme immediately to prevent flash
      applyThemeToDocument(userAppearance);
      setAppearance(userAppearance);
      setInitialized(true);

    } catch (error) {
      console.error('❌ Error loading theme settings:', error);
      // Fallback to default theme
      applyThemeToDocument(defaultAppearance);
      setAppearance(defaultAppearance);
      setInitialized(true);
    }
  }, [user?.id]);

  // Listen for system theme changes when in auto mode
  useEffect(() => {
    if (!initialized || appearance.theme !== 'auto') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = () => {
      if (appearance.theme === 'auto') {
        console.log('🌓 System theme changed, reapplying auto theme');
        applyThemeToDocument(appearance);
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, [appearance.theme, initialized]);

  // Update appearance settings
  const updateAppearance = useCallback((newSettings: Partial<AppearanceSettings>) => {
    if (!user) return;

    const updatedAppearance = { ...appearance, ...newSettings };
    
    console.log('🎨 Updating appearance settings:', newSettings);
    
    // Apply theme immediately
    applyThemeToDocument(updatedAppearance);
    setAppearance(updatedAppearance);

    // Save to localStorage
    try {
      const existingSettings = localStorage.getItem(`settings_${user.id}`);
      let fullSettings = { appearance: updatedAppearance };

      if (existingSettings) {
        const parsed = JSON.parse(existingSettings);
        fullSettings = { ...parsed, appearance: updatedAppearance };
      }

      localStorage.setItem(`settings_${user.id}`, JSON.stringify(fullSettings));
      console.log('💾 Theme settings saved to localStorage');
    } catch (error) {
      console.error('❌ Error saving theme settings:', error);
    }
  }, [appearance, user]);

  // Reset to default appearance
  const resetAppearance = useCallback(() => {
    if (!user) return;

    console.log('🔄 Resetting appearance to defaults');
    
    applyThemeToDocument(defaultAppearance);
    setAppearance(defaultAppearance);

    // Update localStorage
    try {
      const existingSettings = localStorage.getItem(`settings_${user.id}`);
      let fullSettings = { appearance: defaultAppearance };

      if (existingSettings) {
        const parsed = JSON.parse(existingSettings);
        fullSettings = { ...parsed, appearance: defaultAppearance };
      }

      localStorage.setItem(`settings_${user.id}`, JSON.stringify(fullSettings));
      console.log('💾 Default theme settings saved');
    } catch (error) {
      console.error('❌ Error saving default theme settings:', error);
    }
  }, [user]);

  // Don't render children until theme is initialized to prevent flash
  if (!initialized) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  const value: ThemeContextType = {
    appearance,
    updateAppearance,
    resetAppearance,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}