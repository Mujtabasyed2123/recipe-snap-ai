
'use server';
/**
 * @fileOverview Recipe generation AI agent.
 *
 * - generateRecipe - A function that handles the recipe generation process.
 * - GenerateRecipeInput - The input type for the generateRecipe function.
 * - GenerateRecipeOutput - The return type for the generateRecipe function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateRecipeInputSchema = z.object({
  ingredients: z
    .array(z.string())
    .describe('A list of ingredients to use in the recipe. The AI must infer the most appropriate dish and add any missing common ingredients (e.g., spices, oil, salt, pepper) to make the dish complete and authentic.'),
  language: z
    .string()
    .optional()
    .describe('The language to generate the recipe in. Defaults to English.'),
  substitutions: z
    .array(z.object({ingredient: z.string(), substitute: z.string()}))
    .optional()
    .describe('A list of ingredient substitutions to make.'),
  dietaryRestrictions: z
    .array(z.string())
    .optional()
    .describe('A list of dietary restrictions to apply to the recipe (e.g., "vegetarian", "gluten-free", "vegan", "dairy-free", "nut-free").'),
});
export type GenerateRecipeInput = z.infer<typeof GenerateRecipeInputSchema>;

const GenerateRecipeOutputSchema = z.object({
  recipeName: z.string().describe('The specific and appealing name of the generated recipe (e.g., "Classic Chicken Biryani", "Simple Tomato Pasta", "Smoky Eggplant and Tomato Mash", "Chicken and Rice Pilaf").'),
  instructions: z.string().describe('The recipe instructions, formatted as a list of bullet points or numbered steps, detailed for a beginner, explaining each step simply, with correct spelling and grammar. Include a list of necessary equipment before the steps.'),
  ingredients: z.array(z.string()).describe('A comprehensive list of all ingredients used in the recipe, including those provided by the user and those inferred by the AI (like spices, oil, salt, pepper etc.) to make the dish complete.'),
});
export type GenerateRecipeOutput = z.infer<typeof GenerateRecipeOutputSchema>;

export async function generateRecipe(input: GenerateRecipeInput): Promise<GenerateRecipeOutput> {
  return generateRecipeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateRecipePrompt',
  input: {schema: GenerateRecipeInputSchema},
  output: {schema: GenerateRecipeOutputSchema},
  prompt: `You are a world-class chef that can create recipes based on a list of ingredients.
  Your goal is to create a complete and delicious recipe that is very easy to follow, especially for someone who is cooking for the first time.
  
  1.  **Name the Dish Accurately and Appropriately**: 
      *   Based on the provided ingredients, if they strongly suggest a specific, well-known, and complex dish (e.g., chicken, rice, and a variety of characteristic spices for "Chicken Biryani"; pasta and tomatoes for "Classic Tomato Pasta"), you MUST use that specific and appealing name. The goal is a recipe name that sounds like something a chef or a cookbook would call it.
      *   However, if the ingredients do not clearly point to a specific, well-known complex dish, you MUST still create a delicious and coherent recipe. The name should be descriptive of the main ingredients and preparation style, and sound appealing (e.g., "Smoky Eggplant and Tomato Mash," "Garlic Herb Roasted Vegetables," "Spicy Chickpea Curry"). Avoid overly generic or uninspired names (e.g., avoid "Eggplant Dish" or "Mixed Vegetable Stir-fry" if a more evocative name is possible).
      *   CRITICAL: Do not mislabel simple dishes. For instance, "Chicken Biryani" is a complex spiced rice dish. If the ingredients are just 'chicken' and 'rice' without further context suggesting a rich spice blend, do NOT call it Biryani. Opt for a name like "Simple Chicken and Rice" or "Chicken and Rice Pilaf" instead. Avoid overly generic names like "Spiced Chicken and Rice" if a more common or appealing descriptive name is suitable.
  
  2.  **Complete Ingredient List**: CRITICAL: Review the provided ingredients. You MUST add all other essential ingredients for the specific dish you are creating OR for the cuisine style you are aiming for if a specific complex dish isn't named. For example, if creating an actual Biryani (because the ingredients and context support it), include all typical spices (e.g., cumin, coriander, turmeric, garam masala, cardamom, cloves), oil/ghee, onions, ginger, garlic, etc., even if not listed by the user. If creating a simpler dish, or a dish where a specific name isn't identified but a cuisine style can be inferred (e.g., from ingredients like eggplant, tomatoes, and ginger, an Indian style might be inferred), ensure all basic complementary ingredients (like appropriate spices, salt, pepper, oil) are listed. The final ingredient list in your output must be comprehensive and allow for a complete, flavorful dish appropriate to the recipe's complexity or inferred cuisine style.

  3.  **List Necessary Equipment**: Before the instructions, clearly list all necessary cooking equipment (e.g., "Large pot", "Frying pan", "Baking sheet", "Sharp knife", "Cutting board").

  4.  **Beginner-Friendly Instructions**: The instructions MUST be formatted as a list of bullet points (e.g., using '*' or '-') or numbered steps. Explain each step in simple terms, avoiding jargon where possible. If jargon is necessary, briefly explain it. Be specific about quantities, cooking times, temperatures, and techniques. For example, instead of "cook until done," say "cook for 5-7 minutes, or until golden brown and cooked through."

  5.  **Spelling and Grammar**: Ensure all generated text, especially instructions and ingredient names, uses correct spelling and grammar.

  Create a recipe based on the following initial ingredients:
  {{#each ingredients}}
  - {{this}}
  {{/each}}

  {{#if substitutions}}
  Make the following substitutions:
  {{#each substitutions}}
  - Replace {{this.ingredient}} with {{this.substitute}}
  {{/each}}
  {{/if}}

  {{#if dietaryRestrictions}}
  Please ensure the recipe adheres to the following dietary restrictions:
  {{#each dietaryRestrictions}}
  - {{this}}
  {{/each}}
  {{/if}}

  The recipe should be in {{{language}}} language. If no language is specified, use English.
  Ensure the output strictly follows the 'GenerateRecipeOutputSchema'.
  `,
});

const generateRecipeFlow = ai.defineFlow(
  {
    name: 'generateRecipeFlow',
    inputSchema: GenerateRecipeInputSchema,
    outputSchema: GenerateRecipeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

