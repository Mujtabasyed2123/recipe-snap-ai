'use client';

import Image from 'next/image';
import type * as React from 'react';
import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AppHeader } from '@/components/layout/Header';
import { LanguageSelector } from '@/components/LanguageSelector';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { UploadCloud, Sparkles, ChefHat } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Keep your existing AI imports (do not delete these)
import { identifyIngredients } from '@/ai/flows/identify-ingredients';
import { generateRecipe } from '@/ai/flows/generate-recipe'; // if this exists

export default function Home() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recipe, setRecipe] = useState<any>(null);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const { toast } = useToast();

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setRecipe(null);
      setError(null);
    }
  };

  const handleGenerateRecipe = async () => {
    if (!imageFile) {
      toast({
        title: "No image selected",
        description: "Please upload a photo of the dish first, my friend.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Convert image to data URI
      const reader = new FileReader();
      const dataUri = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(imageFile);
      });

      // Call your existing AI (we will update the prompt later to sound like Sanji)
      const result = await identifyIngredients({ photoDataUri: dataUri });
      
      // For now we show a Sanji-style message
      setRecipe({
        title: "A Dish Worthy of the All Blue",
        content: result,
      });

      toast({
        title: "Ah... magnificent!",
        description: "I have prepared something special for you.",
      });
    } catch (err) {
      console.error(err);
      setError("Even the greatest chefs face setbacks. Please try another photo.");
      toast({
        title: "Something went wrong",
        description: "Please try a different image.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-blue-950 to-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-blue-800/50 bg-slate-950/80 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ChefHat className="h-8 w-8 text-amber-400" />
            <h1 className="text-2xl font-bold tracking-tight">
              <span className="text-amber-400">All Blue</span>{" "}
              <span className="text-blue-300">Recipes</span>
            </h1>
          </div>
          <p className="text-sm text-blue-200/70 hidden sm:block">
            Cooked with the passion of the sea
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10">
        <div className="max-w-2xl mx-auto">
          
          {/* Hero text */}
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              Welcome to the <span className="text-amber-400">All Blue</span>
            </h2>
            <p className="text-blue-200/80 text-lg">
              Upload a photo of any dish... and I shall recreate it with the soul of a true chef.
            </p>
          </div>

          {/* Upload Card */}
          <Card className="bg-slate-900/70 border-blue-800/60 shadow-2xl shadow-blue-900/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-amber-300">
                <UploadCloud className="h-6 w-6" />
                Present Your Dish
              </CardTitle>
              <CardDescription className="text-blue-200/70">
                Show me a photo of the food you desire, and I will craft a recipe worthy of the All Blue itself.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="image-upload" className="text-blue-100">
                  Choose Image
                </Label>
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="bg-slate-800 border-blue-700 text-blue-100 file:bg-amber-500 file:text-slate-900 file:font-medium"
                />
              </div>

              {imagePreview && (
                <div className="relative rounded-xl overflow-hidden border-2 border-amber-500/40">
                  <Image
                    src={imagePreview}
                    alt="Selected dish"
                    width={600}
                    height={400}
                    className="w-full h-64 object-cover"
                  />
                </div>
              )}

              {isLoading && (
                <div className="flex justify-center py-6">
                  <LoadingSpinner text="The chef is working his magic..." />
                </div>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertTitle>Ah, a small setback...</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>

            <CardFooter className="flex flex-col sm:flex-row gap-4 justify-between items-center">
              <LanguageSelector
                selectedLanguage={currentLanguage}
                onLanguageChange={setCurrentLanguage}
              />
              <Button
                onClick={handleGenerateRecipe}
                disabled={!imageFile || isLoading}
                size="lg"
                className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-900 font-semibold shadow-lg shadow-amber-500/25"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Create the Recipe
              </Button>
            </CardFooter>
          </Card>

          {/* Recipe Result */}
          {recipe && (
            <Card className="mt-8 bg-slate-900/70 border-amber-600/40">
              <CardHeader>
                <CardTitle className="text-amber-300 text-2xl">
                  {recipe.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-invert max-w-none text-blue-100">
                  <pre className="whitespace-pre-wrap font-sans text-base">
                    {JSON.stringify(recipe.content, null, 2)}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-blue-900/50 mt-16 py-6 text-center text-blue-300/60 text-sm">
        <p>All Blue Recipes • Cooked with passion by the Black Leg</p>
        <p className="mt-1 text-xs">“The sea is vast... and so is my love for fine cuisine.”</p>
      </footer>
    </div>
  );
}
