"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { createClient } from "./supabase";
import { fetchMyPersonas, type Persona } from "./personas";

interface PersonaContextValue {
  personas: Persona[];
  activeId: string | null;
  active: Persona | null;
  setActiveId: (id: string) => void;
  refresh: () => Promise<void>;
  loading: boolean;
}

const PersonaContext = createContext<PersonaContextValue>({
  personas: [], activeId: null, active: null,
  setActiveId: () => {}, refresh: async () => {}, loading: true,
});

const STORAGE_KEY = "bankroller_active_persona";

export function PersonaProvider({ children }: { children: React.ReactNode }) {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [activeId, setActiveIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const list = await fetchMyPersonas();
    setPersonas(list);
    setActiveIdState((prev) => {
      const stored = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
      const candidate = prev || stored;
      if (candidate && list.some((p) => p.id === candidate)) return candidate;
      return list[0]?.id ?? null;
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession()
      .then(({ data }) => {
        if (data.session?.user) refresh();
        else { setPersonas([]); setActiveIdState(null); setLoading(false); }
      })
      .catch(() => { setPersonas([]); setActiveIdState(null); setLoading(false); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session?.user) refresh();
      else { setPersonas([]); setActiveIdState(null); setLoading(false); }
    });
    return () => subscription.unsubscribe();
  }, [refresh]);

  const setActiveId = useCallback((id: string) => {
    setActiveIdState(id);
    if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, id);
  }, []);

  const active = personas.find((p) => p.id === activeId) ?? null;

  return (
    <PersonaContext.Provider value={{ personas, activeId, active, setActiveId, refresh, loading }}>
      {children}
    </PersonaContext.Provider>
  );
}

export function usePersona() {
  return useContext(PersonaContext);
}
