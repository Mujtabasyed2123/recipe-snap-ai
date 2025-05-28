'use server';
/**
 * @fileOverview AI agent that suggests substitutions for ingredients in a recipe.
 *
 * - suggestSubstitutions - A function that handles the ingredient substitution process.
 * - SuggestSubstitutionsInput - The input type for the suggestSubstitutions function.
 * - SuggestSubstitutionsOutput - The return type for the suggestSubstitutions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestSubstitutionsInputSchema = z.object({
  ingredient: z.string().describe('The ingredient to find a substitution for.'),
  recipeContext: z.string().describe('The context of the recipe using the ingredient.'),
});
export type SuggestSubstitutionsInput = z.infer<typeof SuggestSubstitutionsInputSchema>;

const SuggestSubstitutionsOutputSchema = z.object({
  substitutions: z.array(z.string()).describe('An array of possible substitutions for the ingredient.'),
  reasoning: z.string().describe('The reasoning behind the suggested substitutions.'),
});
export type SuggestSubstitutionsOutput = z.infer<typeof SuggestSubstitutionsOutputSchema>;

export async function suggestSubstitutions(input: SuggestSubstitutionsInput): Promise<SuggestSubstitutionsOutput> {
  return suggestSubstitutionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestSubstitutionsPrompt',
  input: {schema: SuggestSubstitutionsInputSchema},
  output: {schema: SuggestSubstitutionsOutputSchema},
  prompt: `You are a chef that can suggest substitutions for ingredients.

Suggest substitutions for the ingredient: {{{ingredient}}}

Given the following recipe context: {{{recipeContext}}}.

Provide a list of substitutions and the reasoning behind each substitution.

Format your response as a JSON object with a "substitutions" key containing an array of strings and a "reasoning" key explaining the substitutions.`,
});

const suggestSubstitutionsFlow = ai.defineFlow(
  {
    name: 'suggestSubstitutionsFlow',
    inputSchema: SuggestSubstitutionsInputSchema,
    outputSchema: SuggestSubstitutionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
