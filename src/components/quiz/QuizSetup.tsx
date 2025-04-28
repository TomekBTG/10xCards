import React, { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card";
import type { FlashcardCategory, QuizSessionOptions } from "../../types";
import QuizSettings from "./QuizSettings";

interface QuizSetupProps {
  categories: FlashcardCategory[];
  filterOptions: QuizSessionOptions;
  onFilterChange: (newOptions: QuizSessionOptions) => void;
  onStart: () => void;
  isLoading: boolean;
}

export default function QuizSetup({ categories, filterOptions, onFilterChange, onStart, isLoading }: QuizSetupProps) {
  const [sessionOptions, setSessionOptions] = useState<QuizSessionOptions>(filterOptions);

  const handleSettingsChange = (newSettings: QuizSessionOptions) => {
    setSessionOptions(newSettings);
    onFilterChange(newSettings);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Konfiguracja sesji powtórkowej</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <QuizSettings
          categories={categories}
          settingsOptions={sessionOptions}
          onSettingsChange={handleSettingsChange}
        />

        <div className="text-center text-muted-foreground">
          <p>Po ustawieniu parametrów kliknij przycisk &quot;Rozpocznij&quot; aby rozpocząć naukę z fiszkami.</p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button size="lg" onClick={onStart} disabled={isLoading} className="px-8">
          {isLoading ? (
            <>
              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Ładowanie...
            </>
          ) : (
            "Rozpocznij"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
