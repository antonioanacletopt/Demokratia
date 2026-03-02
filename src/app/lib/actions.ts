'use server';

/**
 * @fileOverview Server actions for Genkit AI integration.
 * Centralizes AI flows for economic simulations, fact-checking, and tax assessment.
 */

import { genkit, z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

// Initialize Genkit v1.x
const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-1.5-flash',
});

// Use the same implementation as the main actions file to avoid confusion
export * from '@/lib/actions';
