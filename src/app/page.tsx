'use client';

import Image from 'next/image';
import type * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox'; // Added Checkbox import
import { AppHeader } from '@/components/layout/Header';
import { LanguageSelector } from '@/components/LanguageSelector';
import { IngredientChip } from '@/components/IngredientChip';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { SubstitutionModal } from '@/components/SubstitutionModal';
import { useToast } from '@/hooks/use-toast';
import { identifyIngredients, type IdentifyIngredientsOutput } from '@/ai/flows/identify-ingredients';
import { generateRecipe, type GenerateRecipeInput, type GenerateRecipeOutput } from '@/ai/flows/generate-recipe'; // Updated import
import { suggestSubstitutions, type SuggestSubstitutionsOutput } from '@/ai/flows/suggest-substitutions';
import { validateRecipe, type ValidateRecipeOutput } from '@/ai/flows/validate-recipe';
import { UploadCloud, Sparkles, ChefHat, UtensilsCrossed, Lightbulb, XCircle, RotateCcw, ShieldCheck, ShieldAlert, Salad } from 'lucide-react'; // Added Salad icon

type AppStep = 'upload' | 'confirmIngredients' | 'displayRecipe';

const commonDietaryRestrictions = [
  "Vegetarian", 
  "Vegan", 
  "Gluten-Free", 
  "Dairy-Free", 
  "Nut-Free",
  "Low-Carb"
];

export default function HomePage() {
  const [currentStep, setCurrentStep] = useState<AppStep>('upload');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [identifiedIngredients, setIdentifiedIngredients] = useState<string[]>([]);
  const [customIngredient, setCustomIngredient] = useState<string>('');
  const [recipe, setRecipe] = useState<GenerateRecipeOutput | null>(null);
  const [isLoadingIngredients, setIsLoadingIngredients] = useState(false);
  const [isLoadingRecipe, setIsLoadingRecipe] = useState(false);
  const [isLoadingSubstitutions, setIsLoadingSubstitutions] = useState(false);
  const [isValidatingRecipe, setIsValidatingRecipe] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidateRecipeOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState<string>('en');
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]); // New state for dietary restrictions
  
  const [showSubstitutionModal, setShowSubstitutionModal] = useState(false);
  const [ingredientForSubstitution, setIngredientForSubstitution] = useState<string | null>(null);
  const [substitutions, setSubstitutions] = useState<SuggestSubstitutionsOutput | null>(null);
  const [substitutionError, setSubstitutionError] = useState<string | null>(null);

  const { toast } = useToast();

  const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setError(null);
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      setCurrentStep('upload'); 
    }
  };

  const handleIdentifyIngredients = async () => {
    if (!imageFile) {
      setError('Please select an image first.');
      toast({ title: "No Image", description: "Please select an image first.", variant: "destructive" });
      return;
    }
    setIsLoadingIngredients(true);
    setError(null);
    try {
      const dataUri = await fileToDataUri(imageFile);
      // Call the AI flow to identify ingredients.
      // The prompt for this flow encourages it to be more detailed and look for common spices and components.
      const result = await identifyIngredients({ photoDataUri: dataUri });
      setIdentifiedIngredients(result.ingredients || []);
      setCurrentStep('confirmIngredients');
      toast({ title: "Ingredients Identified!", description: "Review the ingredients and add any missing ones." });
    } catch (err) {
      console.error('Error identifying ingredients:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to identify ingredients. Please try a different image or check your connection.';
      setError(errorMessage);
      toast({ title: "Identification Failed", description: errorMessage, variant: "destructive" });
    } finally {
      setIsLoadingIngredients(false);
    }
  };
  
  const handleAddCustomIngredient = () => {
    if (customIngredient.trim() && !identifiedIngredients.includes(customIngredient.trim())) {
      setIdentifiedIngredients([...identifiedIngredients, customIngredient.trim()]);
      setCustomIngredient('');
    }
  };

  const handleRemoveIngredient = (ingredientToRemove: string) => {
    setIdentifiedIngredients(identifiedIngredients.filter(ing => ing !== ingredientToRemove));
  };

  const handleDietaryRestrictionChange = (restriction: string, checked: boolean) => {
    setDietaryRestrictions(prev => 
      checked ? [...prev, restriction] : prev.filter(r => r !== restriction)
    );
  };

  const handleGenerateRecipe = async () => {
    if (identifiedIngredients.length === 0) {
      setError('Please add some ingredients first.');
      toast({ title: "No Ingredients", description: "Add some ingredients to generate a recipe.", variant: "destructive" });
      return;
    }
    setIsLoadingRecipe(true);
    setError(null);
    setRecipe(null); 
    setValidationResult(null);

    try {
      const recipeInput: GenerateRecipeInput = { 
        ingredients: identifiedIngredients, 
        language: currentLanguage,
        dietaryRestrictions: dietaryRestrictions, // Pass dietary restrictions
      };
      const generatedRecipe = await generateRecipe(recipeInput);
      setRecipe(generatedRecipe);
      setCurrentStep('displayRecipe');
      toast({ title: "Recipe Generated!", description: `Enjoy your ${generatedRecipe.recipeName}!` });

      setIsValidatingRecipe(true);
      try {
        const validation = await validateRecipe({
          recipeName: generatedRecipe.recipeName,
          ingredients: generatedRecipe.ingredients,
          instructions: generatedRecipe.instructions,
        });
        setValidationResult(validation);
        toast({
          title: "Recipe Validated",
          description: validation.isProper ? "The recipe looks good!" : "The recipe has some potential issues, check the feedback.",
          variant: validation.isProper ? "default" : "destructive"
        });
      } catch (validationErr) {
        console.error('Error validating recipe:', validationErr);
        toast({ title: "Validation Failed", description: "Could not validate the recipe quality at this time.", variant: "destructive" });
      } finally {
        setIsValidatingRecipe(false);
      }

    } catch (err) {
      console.error('Error generating recipe:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate recipe. The AI might be busy, or the ingredients are too unusual. Try again or adjust ingredients.';
      setError(errorMessage);
      toast({ title: "Recipe Generation Failed", description: errorMessage, variant: "destructive" });
    } finally {
      setIsLoadingRecipe(false);
    }
  };

  const handleSuggestSubstitutions = async (ingredient: string) => {
    if (!recipe) return;
    setIngredientForSubstitution(ingredient);
    setShowSubstitutionModal(true);
    setIsLoadingSubstitutions(true);
    setSubstitutions(null);
    setSubstitutionError(null);
    try {
      const recipeContext = `Recipe: ${recipe.recipeName}\nInstructions: ${recipe.instructions}`;
      const result = await suggestSubstitutions({ ingredient, recipeContext });
      setSubstitutions(result);
    } catch (err) {
      console.error('Error suggesting substitutions:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to suggest substitutions.';
      setSubstitutionError(errorMessage);
      toast({ title: "Substitution Suggestion Failed", description: errorMessage, variant: "destructive" });
    } finally {
      setIsLoadingSubstitutions(false);
    }
  };

  const resetApp = () => {
    setCurrentStep('upload');
    setImagePreview(null);
    setImageFile(null);
    setIdentifiedIngredients([]);
    setRecipe(null);
    setValidationResult(null);
    setError(null);
    setCustomIngredient('');
    setDietaryRestrictions([]); // Reset dietary restrictions
    if (document.getElementById('image-upload-input') as HTMLInputElement) {
      (document.getElementById('image-upload-input') as HTMLInputElement).value = '';
    }
    toast({ title: "App Reset", description: "Ready for new ingredients!" });
  };

  const renderUploadStep = () => (
    <Card className="w-full max-w-lg mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center"><UploadCloud className="mr-2 h-6 w-6 text-primary" /> Upload Ingredient Photo</CardTitle>
        <CardDescription>Take a picture or upload an image of your ingredients. We'll try to identify them for you!</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="image-upload-input" className="text-base font-medium">Choose Image File</Label>
          <Input id="image-upload-input" type="file" accept="image/*" onChange={handleImageChange} className="text-base file:text-primary file:font-semibold file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-primary/10 hover:file:bg-primary/20" />
        </div>
        {imagePreview && (
          <div className="mt-4 p-2 border border-dashed border-primary/50 rounded-lg bg-primary/5">
            <Image src={imagePreview} alt="Selected ingredients" width={400} height={300} className="rounded-md object-contain max-h-[300px] w-auto mx-auto" data-ai-hint="food ingredients"/>
          </div>
        )}
        {isLoadingIngredients && <LoadingSpinner text="Identifying ingredients..." className="my-4" />}
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-4">
         <LanguageSelector selectedLanguage={currentLanguage} onLanguageChange={setCurrentLanguage} disabled={isLoadingIngredients || isLoadingRecipe} />
        <Button onClick={handleIdentifyIngredients} disabled={!imageFile || isLoadingIngredients} size="lg" className="w-full sm:w-auto bg-accent hover:bg-accent/90">
          <Sparkles className="mr-2 h-5 w-5" />
          Identify Ingredients
        </Button>
      </CardFooter>
    </Card>
  );

  const renderConfirmIngredientsStep = () => (
    <Card className="w-full max-w-2xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center"><ChefHat className="mr-2 h-6 w-6 text-primary" /> Confirm Your Ingredients</CardTitle>
        <CardDescription>Review the identified ingredients. Add or remove any as needed. You can also specify dietary restrictions.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {imagePreview && (
           <div className="mt-4 p-2 border border-dashed border-primary/50 rounded-lg bg-primary/5">
            <Image src={imagePreview} alt="Selected ingredients" width={200} height={150} className="rounded-md object-contain max-h-[150px] w-auto mx-auto" data-ai-hint="food items"/>
          </div>
        )}
        <div>
          <h3 className="text-lg font-semibold mb-2">Identified Ingredients:</h3>
          {identifiedIngredients.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {identifiedIngredients.map(ing => (
                <IngredientChip key={ing} ingredient={ing} onRemove={() => handleRemoveIngredient(ing)} />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No ingredients identified yet, or you've removed them all. Add some below!</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="custom-ingredient" className="text-base">Add Ingredient</Label>
          <div className="flex space-x-2">
            <Input 
              id="custom-ingredient" 
              value={customIngredient} 
              onChange={(e) => setCustomIngredient(e.target.value)}
              placeholder="e.g., tomatoes, chicken breast" 
              className="text-base"
              onKeyPress={(e) => e.key === 'Enter' && handleAddCustomIngredient()}
            />
            <Button onClick={handleAddCustomIngredient} variant="outline" className="text-base">Add</Button>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <Salad className="mr-2 h-5 w-5 text-primary" />
            Dietary Restrictions (Optional):
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3">
            {commonDietaryRestrictions.map((restriction) => (
              <div key={restriction} className="flex items-center space-x-2">
                <Checkbox
                  id={`restriction-${restriction.toLowerCase().replace(/\s+/g, '-')}`}
                  checked={dietaryRestrictions.includes(restriction)}
                  onCheckedChange={(checked: boolean) => handleDietaryRestrictionChange(restriction, checked)}
                  className="border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                />
                <Label htmlFor={`restriction-${restriction.toLowerCase().replace(/\s+/g, '-')}`} className="font-normal text-base cursor-pointer">
                  {restriction}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {isLoadingRecipe && <LoadingSpinner text="Generating your recipe..." className="my-4" />}
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <Button variant="outline" onClick={resetApp} disabled={isLoadingRecipe} className="w-full sm:w-auto">
          <RotateCcw className="mr-2 h-4 w-4" /> Start Over
        </Button>
        <Button onClick={handleGenerateRecipe} disabled={identifiedIngredients.length === 0 || isLoadingRecipe} size="lg" className="w-full sm:w-auto bg-accent hover:bg-accent/90">
          <Sparkles className="mr-2 h-5 w-5" />
          Generate Recipe
        </Button>
      </CardFooter>
    </Card>
  );

  const renderDisplayRecipeStep = () => recipe && (
    <Card className="w-full max-w-3xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl sm:text-3xl font-bold text-center text-primary">{recipe.recipeName}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {isValidatingRecipe && <LoadingSpinner text="Validating recipe quality..." className="my-4" />}
        {validationResult && (
          <Alert variant={validationResult.isProper ? "default" : "destructive"} className="my-4">
            {validationResult.isProper ? <ShieldCheck className="h-5 w-5" /> : <ShieldAlert className="h-5 w-5" />}
            <AlertTitle>{validationResult.isProper ? "Recipe Validation: Looks Good!" : "Recipe Validation: Potential Issues"}</AlertTitle>
            {validationResult.feedback && <AlertDescription>{validationResult.feedback}</AlertDescription>}
          </Alert>
        )}
        <div>
          <h3 className="text-xl font-semibold mb-3 flex items-center"><UtensilsCrossed className="mr-2 h-5 w-5 text-accent" />Ingredients</h3>
          <ul className="list-disc list-inside space-y-1 pl-2">
            {recipe.ingredients.map((ing, index) => (
              <li key={index} className="text-base">
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-base text-foreground hover:text-accent hover:underline"
                  onClick={() => handleSuggestSubstitutions(ing)}
                >
                  {ing} <Lightbulb className="ml-1 h-4 w-4 text-primary/70 inline" />
                </Button>
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted-foreground mt-1">Click an ingredient to see substitution suggestions.</p>
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-3 flex items-center"><ChefHat className="mr-2 h-5 w-5 text-accent" />Instructions</h3>
          <Textarea value={recipe.instructions} readOnly rows={10} className="text-base bg-background/50 whitespace-pre-wrap" />
        </div>
        {isLoadingRecipe && <LoadingSpinner text="Generating another recipe..." className="my-4" />}
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <Button variant="outline" onClick={resetApp} disabled={isLoadingRecipe || isValidatingRecipe} className="w-full sm:w-auto">
          <RotateCcw className="mr-2 h-4 w-4" /> Start Over
        </Button>
        <Button onClick={handleGenerateRecipe} disabled={isLoadingRecipe || isValidatingRecipe} size="lg" className="w-full sm:w-auto">
          <Sparkles className="mr-2 h-5 w-5" />
          Try a Different Recipe
        </Button>
      </CardFooter>
    </Card>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader />
      <main className="flex-grow container mx-auto px-4 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6 max-w-2xl mx-auto">
            <XCircle className="h-5 w-5" />
            <AlertTitle>Oops! Something went wrong.</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {currentStep === 'upload' && renderUploadStep()}
        {currentStep === 'confirmIngredients' && renderConfirmIngredientsStep()}
        {currentStep === 'displayRecipe' && renderDisplayRecipeStep()}
        
        <SubstitutionModal
          isOpen={showSubstitutionModal}
          onOpenChange={setShowSubstitutionModal}
          ingredientName={ingredientForSubstitution}
          substitutions={substitutions}
          isLoading={isLoadingSubstitutions}
          error={substitutionError}
        />
      </main>
      <footer className="text-center py-4 text-sm text-muted-foreground border-t border-border">
        Recipe Snap &copy; {new Date().getFullYear()} - Your AI Kitchen Assistant
      </footer>
    </div>
  );
}
