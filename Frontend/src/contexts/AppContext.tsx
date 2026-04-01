import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AppState {
  aiCompanionEnabled: boolean;
  setAiCompanionEnabled: (v: boolean) => void;
  language: "en" | "hi";
  setLanguage: (v: "en" | "hi") => void;
  fontSize: "small" | "medium" | "large";
  setFontSize: (v: "small" | "medium" | "large") => void;
}

const AppContext = createContext<AppState | null>(null);

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within AppProvider");
  return ctx;
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [aiCompanionEnabled, setAiCompanionEnabled] = useState(() => {
    const saved = localStorage.getItem("preventx_ai_companion");
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [language, setLanguage] = useState<"en" | "hi">(() => {
    return (localStorage.getItem("preventx_language") as "en" | "hi") || "en";
  });
  const [fontSize, setFontSize] = useState<"small" | "medium" | "large">(() => {
    return (localStorage.getItem("preventx_font_size") as "small" | "medium" | "large") || "medium";
  });

  useEffect(() => {
    localStorage.setItem("preventx_ai_companion", JSON.stringify(aiCompanionEnabled));
  }, [aiCompanionEnabled]);

  useEffect(() => {
    localStorage.setItem("preventx_language", language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem("preventx_font_size", fontSize);
    const root = document.documentElement;
    root.classList.remove("text-sm", "text-base", "text-lg");
    if (fontSize === "small") root.classList.add("text-sm");
    else if (fontSize === "large") root.classList.add("text-lg");
    else root.classList.add("text-base");
  }, [fontSize]);

  return (
    <AppContext.Provider value={{ aiCompanionEnabled, setAiCompanionEnabled, language, setLanguage, fontSize, setFontSize }}>
      {children}
    </AppContext.Provider>
  );
};
