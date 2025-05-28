import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-substitutions.ts';
import '@/ai/flows/generate-recipe.ts';
import '@/ai/flows/identify-ingredients.ts';
import '@/ai/flows/validate-recipe.ts';
