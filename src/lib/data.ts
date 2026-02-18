
// Data is now fetched from Firestore. This file provides the types
// and the initial data for seeding the database. Updated for 2026.

export type PublicData = {
  id?: string; 
  label: string;
  description: string;
  unit: string;
  data: { year: number; value: number }[];
};

export type DataSetKey = 'gdp' | 'unemployment' | 'inflation';

export const publicDataToSeed: Record<DataSetKey, Omit<PublicData, 'id'>> = {
  gdp: {
    label: "PIB (Produto Interno Bruto)",
    description: "Variação homóloga do Produto Interno Bruto em Portugal. Dados consolidados até 2025 e estimativas para 2026 baseadas no OE2026.",
    unit: "%",
    data: [
      { year: 2021, value: 5.5 },
      { year: 2022, value: 6.7 },
      { year: 2023, value: 2.3 },
      { year: 2024, value: 1.8 },
      { year: 2025, value: 2.1 },
      { year: 2026, value: 2.4 },
    ],
  },
  unemployment: {
    label: "Taxa de Desemprego",
    description: "Taxa de desemprego média anual em Portugal. Reflete a estabilização do mercado de trabalho em 2026.",
    unit: "%",
    data: [
      { year: 2021, value: 6.6 },
      { year: 2022, value: 6.0 },
      { year: 2023, value: 6.5 },
      { year: 2024, value: 6.4 },
      { year: 2025, value: 6.2 },
      { year: 2026, value: 6.1 },
    ],
  },
  inflation: {
    label: "Taxa de Inflação (IHPC)",
    description: "Taxa de variação homóloga do Índice Harmonizado de Preços no Consumidor. Valores de 2026 mostram o regresso à meta do BCE.",
    unit: "%",
    data: [
      { year: 2021, value: 1.3 },
      { year: 2022, value: 8.1 },
      { year: 2023, value: 5.3 },
      { year: 2024, value: 2.4 },
      { year: 2025, value: 2.1 },
      { year: 2026, value: 2.0 },
    ],
  },
};
