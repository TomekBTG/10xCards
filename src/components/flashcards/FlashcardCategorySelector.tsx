import { useState, useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PlusCircle, ChevronDown } from "lucide-react";
import type { FlashcardCategory } from "@/types";

interface FlashcardCategorySelectorProps {
  categories: FlashcardCategory[];
  selectedCategoryId: string | null;
  newCategoryName: string;
  onChange: (categoryId: string | null, categoryName?: string) => void;
  error?: string;
}

export function FlashcardCategorySelector({
  categories,
  selectedCategoryId,
  newCategoryName,
  onChange,
  error,
}: FlashcardCategorySelectorProps) {
  // Stan selektora kategorii
  const [isAddingNew, setIsAddingNew] = useState(!selectedCategoryId && !!newCategoryName);

  // Obsługa przełączania między wyborem a tworzeniem kategorii
  const toggleAddNew = useCallback(() => {
    setIsAddingNew((prev) => {
      // Jeśli przełączamy z dodawania na wybór, czyścimy nazwę nowej kategorii
      if (prev) {
        onChange(null);
      }
      return !prev;
    });
  }, [onChange]);

  // Obsługa wyboru istniejącej kategorii
  const handleSelectCategory = useCallback(
    (value: string) => {
      if (value === "none") {
        onChange(null);
      } else {
        onChange(value);
      }
    },
    [onChange]
  );

  // Obsługa wprowadzania nazwy nowej kategorii
  const handleNewCategoryChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(null, e.target.value);
    },
    [onChange]
  );

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label className="text-sm font-medium">Kategoria</Label>
        <Button type="button" variant="ghost" size="sm" onClick={toggleAddNew} className="h-7 text-xs">
          {isAddingNew ? (
            <>
              <ChevronDown className="w-3 h-3 mr-1" />
              Wybierz istniejącą
            </>
          ) : (
            <>
              <PlusCircle className="w-3 h-3 mr-1" />
              Dodaj nową
            </>
          )}
        </Button>
      </div>

      {isAddingNew ? (
        // Formularz dodawania nowej kategorii
        <Input
          value={newCategoryName}
          onChange={handleNewCategoryChange}
          placeholder="Wpisz nazwę nowej kategorii"
          className={error ? "border-red-500" : ""}
        />
      ) : (
        // Wybór istniejącej kategorii
        <Select value={selectedCategoryId || "none"} onValueChange={handleSelectCategory}>
          <SelectTrigger className={error ? "border-red-500" : ""}>
            <SelectValue placeholder="Wybierz kategorię" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="none">Bez kategorii</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name} ({category.count})
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      )}

      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  );
}
