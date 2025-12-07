import { useState, useEffect } from "react";

export interface NotificationPreferences {
  soundEnabled: boolean;
  toastEnabled: boolean;
}

const STORAGE_KEY = "notification-preferences";

const defaultPreferences: NotificationPreferences = {
  soundEnabled: true,
  toastEnabled: true,
};

export const useNotificationPreferences = () => {
  const [preferences, setPreferences] = useState<NotificationPreferences>(() => {
    if (typeof window === "undefined") return defaultPreferences;
    
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return { ...defaultPreferences, ...JSON.parse(stored) };
      } catch {
        return defaultPreferences;
      }
    }
    return defaultPreferences;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  }, [preferences]);

  const updatePreferences = (updates: Partial<NotificationPreferences>) => {
    setPreferences((prev) => ({ ...prev, ...updates }));
  };

  const toggleSound = () => {
    updatePreferences({ soundEnabled: !preferences.soundEnabled });
  };

  const toggleToast = () => {
    updatePreferences({ toastEnabled: !preferences.toastEnabled });
  };

  return {
    preferences,
    updatePreferences,
    toggleSound,
    toggleToast,
  };
};
