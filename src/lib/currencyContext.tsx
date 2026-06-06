"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export type Currency = "units" | "SEK" | "EUR" | "GBP" | "USD" | "NOK" | "DKK";

interface CurrencyCtx {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  format: (value: number) => string;
  stakeLabel: string;
}

const CURRENCIES: { value: Currency; label: string; symbol: string }[] = [
  { value: "units", label: "Units",        symbol: "u"   },
  { value: "SEK",   label: "SEK (kr)",     symbol: "kr"  },
  { value: "EUR",   label: "EUR (€)",      symbol: "€"   },
  { value: "GBP",   label: "GBP (£)",      symbol: "£"   },
  { value: "USD",   label: "USD ($)",      symbol: "$"   },
  { value: "NOK",   label: "NOK (kr)",     symbol: "kr"  },
  { value: "DKK",   label: "DKK (kr)",     symbol: "kr"  },
];

export { CURRENCIES };

const Ctx = createContext<CurrencyCtx>({
  currency: "units",
  setCurrency: () => {},
  format: (v) => `${v}u`,
  stakeLabel: "u",
});

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<Currency>("units");

  const sym = CURRENCIES.find(c => c.value === currency)?.symbol ?? "u";

  const format = (value: number) => {
    if (currency === "units") return `${value}u`;
    const prefix = ["EUR","GBP","USD"].includes(currency);
    return prefix ? `${sym}${value.toLocaleString()}` : `${value.toLocaleString()} ${sym}`;
  };

  return (
    <Ctx.Provider value={{ currency, setCurrency, format, stakeLabel: sym }}>
      {children}
    </Ctx.Provider>
  );
}

export function useCurrency() {
  return useContext(Ctx);
}
