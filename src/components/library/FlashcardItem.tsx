import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Edit, Trash2 } from "lucide-react";
import type { FlashcardViewModel } from "./LibraryViewPage";
import type { FlashcardStatus, FlashcardDTO } from "../../types";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

interface FlashcardItemProps {
  flashcard: FlashcardViewModel;
  onSelect: (id: string, selected: boolean) => void;
  onUpdate?: (id: string, data: Partial<FlashcardDTO>) => Promise<boolean>;
  onDelete?: (id: string) => Promise<boolean>;
}

// Schema validacji dla formularza edycji fiszki
const formSchema = z.object({
  front: z.string().min(1, "Front jest wymagany").max(200, "Front nie może przekraczać 200 znaków"),
  back: z.string().min(1, "Tył jest wymagany").max(500, "Tył nie może przekraczać 500 znaków"),
  status: z.enum(["accepted", "rejected", "pending"] as const),
});

// Typ danych formularza
type FormValues = z.infer<typeof formSchema>;

const FlashcardItem = ({ flashcard, onSelect, onUpdate, onDelete }: FlashcardItemProps) => {
  // Stan otwartego modalu
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  // Stan ładowania podczas edycji
  const [isEditing, setIsEditing] = useState(false);
  // Stan błędu podczas edycji
  const [editError, setEditError] = useState<string | null>(null);

  // Inicjalizacja formularza
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      front: flashcard.front,
      back: flashcard.back,
      status: (flashcard.status as FlashcardStatus) || "pending",
    },
  });

  // Maksymalna długość tekstu do wyświetlenia
  const maxTextLength = 100;

  // Funkcja do skracania tekstu
  const truncateText = (text: string) => {
    if (text.length <= maxTextLength) return text;
    return text.substring(0, maxTextLength) + "...";
  };

  // Mapowanie statusu na etykiety i kolory
  const getStatusDetails = () => {
    switch (flashcard.status) {
      case "accepted":
        return {
          label: "Zaakceptowana",
          color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
        };
      case "rejected":
        return {
          label: "Odrzucona",
          color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
        };
      case "pending":
      default:
        return {
          label: "Oczekująca",
          color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
        };
    }
  };

  const statusDetails = getStatusDetails();

  // Obsługa zmiany zaznaczenia fiszki
  const handleSelectChange = (checked: boolean) => {
    onSelect(flashcard.id, checked);
  };

  // Obsługa wysłania formularza edycji
  const onSubmit = async (values: FormValues) => {
    setIsEditing(true);
    setEditError(null);

    try {
      // Przygotowanie danych do aktualizacji
      const updateData = {
        front: values.front,
        back: values.back,
        status: values.status,
      };

      if (onUpdate) {
        // Używamy dostarczonej funkcji do aktualizacji
        const success = await onUpdate(flashcard.id, updateData);

        if (!success) {
          throw new Error("Nie udało się zaktualizować fiszki");
        }

        // Po udanej edycji zamykamy modal
        setIsEditModalOpen(false);
      } else {
        // Jeśli brak funkcji onUpdate, używamy bezpośredniego wywołania API
        const response = await fetch(`/api/flashcards/${flashcard.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Wystąpił błąd podczas aktualizacji fiszki");
        }

        // Po udanej edycji zamykamy modal
        setIsEditModalOpen(false);

        // Odświeżenie strony po edycji fiszki jako fallback
        window.location.reload();
      }
    } catch (error) {
      console.error("Error updating flashcard:", error);
      setEditError(error instanceof Error ? error.message : "Wystąpił błąd podczas aktualizacji fiszki");
    } finally {
      setIsEditing(false);
    }
  };

  // Obsługa usuwania fiszki
  const handleDelete = async () => {
    if (!confirm("Czy na pewno chcesz usunąć tę fiszkę?")) {
      return;
    }

    try {
      if (onDelete) {
        // Używamy dostarczonej funkcji do usuwania
        const success = await onDelete(flashcard.id);

        if (!success) {
          throw new Error("Nie udało się usunąć fiszki");
        }
      } else {
        // Jeśli brak funkcji onDelete, używamy bezpośredniego wywołania API
        const response = await fetch(`/api/flashcards/${flashcard.id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Wystąpił błąd podczas usuwania fiszki");
        }

        // Odświeżenie strony po usunięciu fiszki jako fallback
        window.location.reload();
      }
    } catch (error) {
      console.error("Error deleting flashcard:", error);
      alert("Nie udało się usunąć fiszki. Spróbuj ponownie później.");
    }
  };

  return (
    <div className="flex items-start p-4 border-b border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/50">
      <div className="flex items-center w-12">
        <Checkbox
          id={`select-${flashcard.id}`}
          checked={flashcard.selected}
          onCheckedChange={handleSelectChange}
          className="data-[state=checked]:bg-blue-500"
        />
        <label htmlFor={`select-${flashcard.id}`} className="sr-only">
          Zaznacz fiszkę
        </label>
      </div>

      <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Front fiszki */}
        <div className="overflow-hidden">
          <div className="text-sm text-gray-900 dark:text-gray-100">{truncateText(flashcard.front)}</div>
        </div>

        {/* Tył fiszki */}
        <div className="overflow-hidden">
          <div className="text-sm text-gray-900 dark:text-gray-100">{truncateText(flashcard.back)}</div>
        </div>

        {/* Status */}
        <div className="hidden md:block">
          <span className={`px-2 py-1 rounded-full text-xs ${statusDetails.color}`}>{statusDetails.label}</span>
        </div>

        {/* Akcje */}
        <div className="hidden md:flex space-x-2 justify-end">
          <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                <Edit className="h-4 w-4" />
                <span className="sr-only">Edytuj</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Edytuj fiszkę</DialogTitle>
              </DialogHeader>

              {/* Formularz edycji fiszki */}
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  {/* Pole front */}
                  <FormField
                    control={form.control}
                    name="front"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Front</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Wpisz tekst przodu fiszki"
                            {...field}
                            className="resize-none min-h-[100px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Pole back */}
                  <FormField
                    control={form.control}
                    name="back"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tył</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Wpisz tekst tyłu fiszki"
                            {...field}
                            className="resize-none min-h-[150px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Pole status */}
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Wybierz status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="accepted">Zaakceptowana</SelectItem>
                            <SelectItem value="rejected">Odrzucona</SelectItem>
                            <SelectItem value="pending">Oczekująca</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Wyświetlanie błędu */}
                  {editError && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                      <p>{editError}</p>
                    </div>
                  )}

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                      Anuluj
                    </Button>
                    <Button type="submit" disabled={isEditing}>
                      {isEditing ? "Zapisywanie..." : "Zapisz zmiany"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Usuń</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FlashcardItem;
