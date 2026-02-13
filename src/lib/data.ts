// Data is now fetched from Firestore. This file provides the types
// and the initial data for seeding the database.

export type PublicData = {
  // The 'id' is added by the useCollection hook from the document ID
  id?: string; 
  label: string;
  description: string;
  unit: string;
  data: { year: number; value: number }[];
};

export type DataSetKey = 'gdp' | 'unemployment' | 'inflation';

// This object is now just for seeding purposes and not exported for general app use.
export const publicDataToSeed: Record<DataSetKey, Omit<PublicData, 'id'>> = {
  gdp: {
    label: "PIB (Produto Interno Bruto)",
    description: "Variação homóloga do Produto Interno Bruto em Portugal, em percentagem.",
    unit: "%",
    data: [
      { year: 2018, value: 2.8 },
      { year: 2019, value: 2.2 },
      { year: 2020, value: -8.4 },
      { year: 2021, value: 5.5 },
      { year: 2022, value: 6.7 },
      { year: 2023, value: 2.3 },
    ],
  },
  unemployment: {
    label: "Taxa de Desemprego",
    description: "Taxa de desemprego média anual em Portugal, em percentagem da população ativa.",
    unit: "%",
    data: [
      { year: 2018, value: 7.0 },
      { year: 2019, value: 6.5 },
      { year: 2020, value: 6.8 },
      { year: 2021, value: 6.6 },
      { year: 2022, value: 6.0 },
      { year: 2023, value: 6.5 },
    ],
  },
  inflation: {
    label: "Taxa de Inflação (IHPC)",
    description: "Taxa de variação homóloga do Índice Harmonizado de Preços no Consumidor.",
    unit: "%",
    data: [
      { year: 2018, value: 1.0 },
      { year: 2019, value: 0.3 },
      { year: 2020, value: -0.1 },
      { year: 2021, value: 1.3 },
      { year: 2022, value: 8.1 },
      { year: 2023, value: 5.3 },
    ],
  },
};
