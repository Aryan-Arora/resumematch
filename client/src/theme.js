import { useEffect, useState } from "react";

const STORAGE_KEY = "resumematch_theme";
const THEME_EVENT = "resumematch-theme-change";

export function getTheme() {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function applyStoredTheme() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "dark") {
    document.documentElement.classList.add("dark");
  }
}

export function setTheme(theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  localStorage.setItem(STORAGE_KEY, theme);
  window.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: theme }));
}

export function toggleTheme() {
  const next = getTheme() === "dark" ? "light" : "dark";
  setTheme(next);
  return next;
}

export function onThemeChange(callback) {
  const handler = (e) => callback(e.detail);
  window.addEventListener(THEME_EVENT, handler);
  return () => window.removeEventListener(THEME_EVENT, handler);
}

// Hook for components that need theme-aware values not expressible as CSS
// (e.g. Recharts colors, which are plain JS props, not classes).
export function useTheme() {
  const [theme, setThemeState] = useState("light");

  useEffect(() => {
    setThemeState(getTheme());
    return onThemeChange(setThemeState);
  }, []);

  return theme;
}
