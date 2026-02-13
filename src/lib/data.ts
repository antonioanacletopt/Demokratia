import { collection, doc, getFirestore } from "firebase/firestore";

export const publicDataCollection = collection(getFirestore(), 'publicData');

export const gdpDoc = doc(publicDataCollection, 'gdp');
export const unemploymentDoc = doc(publicDataCollection, 'unemployment');
export const inflationDoc = doc(publicDataCollection, 'inflation');

export type PublicData = {
  label: string;
  description: string;
  unit: string;
  data: { year: number; value: number }[];
};

export const publicDataSets = {
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

export type DataSetKey = keyof typeof publicDataSets;
    