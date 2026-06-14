export const themes = {
  architect: {
    name: "Architect Vector",
    primary: "#2B3E50",
    accent: "#FF8C42",
    secondary: "#4A4A4A",
    background: "#FAFAFA",
    text: "#2B3E50",
  },
  spark: {
    name: "Bright Arc",
    primary: "#F4A261",
    accent: "#E76F51",
    secondary: "#F4D35E",
    background: "#FFF8F3",
    text: "#2A2A2A",
  },
  anchor: {
    name: "Steady Line",
    primary: "#2A9D8F",
    accent: "#264653",
    secondary: "#457B9D",
    background: "#F1FAEE",
    text: "#264653",
  },
};

export type ThemeKey = keyof typeof themes;

export function getTheme(themeKey?: string) {
  const key = (themeKey || "architect") as ThemeKey;
  return themes[key] || themes.architect;
}

export function getThemeClasses(themeKey?: string) {
  const theme = getTheme(themeKey);
  return {
    bg: `bg-[${theme.background}]`,
    text: `text-[${theme.text}]`,
    primary: `text-[${theme.primary}]`,
    accent: `text-[${theme.accent}]`,
  };
}
