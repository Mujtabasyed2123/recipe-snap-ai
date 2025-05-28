'use server';
/**
 * @fileOverview Recipe validation AI agent.
 *
 * - validateRecipe - A function that handles the recipe validation process.
 * - ValidateRecipeInput - The input type for the validateRecipe function.
 * - ValidateRecipeOutput - The return type for the validateRecipe function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ValidateRecipeInputSchema = z.object({
  recipeName: z.string().describe('The name of the recipe to validate.'),
  ingredients: z.array(z.string()).describe('The list of ingredients for the recipe.'),
  instructions: z.string().describe('The cooking instructions for the recipe.'),
});
export type ValidateRecipeInput = z.infer<typeof ValidateRecipeInputSchema>;

const ValidateRecipeOutputSchema = z.object({
  isProper: z.boolean().describe('Whether the recipe is considered proper, coherent, and sensible.'),
  feedback: z.string().nullable().describe('Constructive feedback or reasons if not proper, or suggestions for improvement. Null if no specific issues or if perfectly fine.'),
});
export type ValidateRecipeOutput = z.infer<typeof ValidateRecipeOutputSchema>;

export async function validateRecipe(input: ValidateRecipeInput): Promise<ValidateRecipeOutput> {
  return validateRecipeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'validateRecipePrompt',
  input: {schema: ValidateRecipeInputSchema},
  output: {schema: ValidateRecipeOutputSchema},
  prompt: `You are a culinary expert tasked with validating user-submitted recipes. 
A "proper" recipe should be coherent, use listed ingredients within the instructions, have clear and safe steps, and be generally sensible (e.g., no unsafe practices, plausible cooking times/temperatures).

Recipe Name: {{{recipeName}}}

Ingredients:
{{#each ingredients}}
- {{this}}
{{/each}}

Instructions:
{{{instructions}}}

Based on this, is the recipe proper? 
- Set 'isProper' to true if the recipe is generally good, coherent, and safe.
- Set 'isProper' to false if there are significant issues (e.g., missing critical steps, ingredients not used, unsafe instructions, nonsensical).
- Provide concise feedback in the 'feedback' field. If it's not proper, explain the main issues. If it is proper, you can offer minor suggestions or a positive comment. If it's excellent and needs no comments, feedback can be null.
`,
});

const validateRecipeFlow = ai.defineFlow(
  {
    name: 'validateRecipeFlow',
    inputSchema: ValidateRecipeInputSchema,
    outputSchema: ValidateRecipeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
