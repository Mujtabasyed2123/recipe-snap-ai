'use client';

import Image from 'next/image';
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { UploadCloud, Sparkles, ChefHat, Languages, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { identifyIngredients } from '@/ai/flows/identify-ingredients';

const allLanguages = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español (Spanish)' },
  { value: 'fr', label: 'Français (French)' },
  { value: 'de', label: 'Deutsch (German)' },
  { value: 'it', label: 'Italiano (Italian)' },
  { value: 'pt', label: 'Português (Portuguese)' },
  { value: 'ja', label: '日本語 (Japanese)' },
  { value: 'ko', label: '한국어 (Korean)' },
  { value: 'zh-CN', label: '简体中文 (Simplified Chinese)' },
  { value: 'hi', label: 'हिन्दी (Hindi)' },
  { value: 'ar', label: 'العربية (Arabic)' },
  { value: 'ru', label: 'Русский (Russian)' },
  { value: 'bn', label: 'বাংলা (Bengali)' },
  { value: 'ur', label: 'اردو (Urdu)' },
  { value: 'sw', label: 'Kiswahili (Swahili)' },
  { value: 'tr', label: 'Türkçe (Turkish)' },
  { value: 'id', label: 'Bahasa Indonesia (Indonesian)' },
  { value: 'nl', label: 'Nederlands (Dutch)' },
];

export default function Home() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recipe, setRecipe] = useState<any>(null);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [langSearch, setLangSearch] = useState('');
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const { toast } = useToast();

  const filteredLanguages = useMemo(() => {
    if (!langSearch.trim()) return allLanguages;
    return allLanguages.filter((lang) =>
      lang.label.toLowerCase().includes(langSearch.toLowerCase())
    );
  }, [langSearch]);

  const selectedLangLabel = allLanguages.find((l) => l.value === currentLanguage)?.label || 'English';

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
      const reader = new FileReader();
      const dataUri = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(imageFile);
      });

      const result = await identifyIngredients({ photoDataUri: dataUri });

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
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              Welcome to the <span className="text-amber-400">All Blue</span>
            </h2>
            <p className="text-blue-200/80 text-lg">
              Upload a photo of any dish... and I shall recreate it with the soul of a true chef.
            </p>
          </div>

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
              {/* Searchable Language Selector */}
              <div className="relative w-full sm:w-64">
                <div
                  className="flex items-center gap-2 h-10 px-3 rounded-md bg-slate-800 border border-blue-700 cursor-pointer"
                  onClick={() => setShowLangDropdown(!showLangDropdown)}
                >
                  <Languages className="h-4 w-4 text-amber-400" />
                  <span className="text-blue-100 text-sm truncate flex-1">
                    {selectedLangLabel}
                  </span>
                </div>

                {showLangDropdown && (
                  <div className="absolute bottom-12 left-0 w-full bg-slate-900 border border-blue-700 rounded-md shadow-xl z-50 overflow-hidden">
                    <div className="p-2 border-b border-blue-800">
                      <div className="flex items-center gap-2 bg-slate-800 rounded px-2">
                        <Search className="h-4 w-4 text-blue-400" />
                        <input
                          type="text"
                          placeholder="Search language..."
                          value={langSearch}
                          onChange={(e) => setLangSearch(e.target.value)}
                          className="w-full bg-transparent text-blue-100 text-sm py-2 outline-none"
                          autoFocus
                        />
                      </div>
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      {filteredLanguages.map((lang) => (
                        <div
                          key={lang.value}
                          className={`px-3 py-2 text-sm cursor-pointer hover:bg-blue-900 ${
                            currentLanguage === lang.value ? 'bg-blue-900 text-amber-300' : 'text-blue-100'
                          }`}
                          onClick={() => {
                            setCurrentLanguage(lang.value);
                            setShowLangDropdown(false);
                            setLangSearch('');
                          }}
                        >
                          {lang.label}
                        </div>
                      ))}
                      {filteredLanguages.length === 0 && (
                        <div className="px-3 py-2 text-sm text-blue-400">No language found</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <Button
                onClick={handleGenerateRecipe}
                disabled={!imageFile || isLoading}
                size="lg"
                className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-900 font-semibold"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Create the Recipe
              </Button>
            </CardFooter>
          </Card>

          {recipe && (
            <Card className="mt-8 bg-slate-900/70 border-amber-600/40">
              <CardHeader>
                <CardTitle className="text-amber-300 text-2xl">
                  {recipe.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="whitespace-pre-wrap text-blue-100 font-sans text-base">
                  {JSON.stringify(recipe.content, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <footer className="border-t border-blue-900/50 mt-16 py-6 text-center text-blue-300/60 text-sm">
        <p>All Blue Recipes • Cooked with passion by the Black Leg</p>
        <p className="mt-1 text-xs">“The sea is vast... and so is my love for fine cuisine.”</p>
      </footer>
    </div>
  );
}
