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

export const publicDataToSeed = (t: (key: string) => string): Record<DataSetKey, Omit<PublicData, 'id'>> => ({
  gdp: {
    label: t('publicData.gdp.label'),
    description: t('publicData.gdp.description'),
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
    label: t('publicData.unemployment.label'),
    description: t('publicData.unemployment.description'),
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
    label: t('publicData.inflation.label'),
    description: t('publicData.inflation.description'),
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
});
