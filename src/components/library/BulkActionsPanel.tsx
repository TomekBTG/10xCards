import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Trash2, Loader2 } from "lucide-react";
import type { FlashcardStatus } from "../../types";

interface BulkActionsPanelProps {
  selectedCount: number;
  onStatusUpdate: (status: FlashcardStatus) => Promise<void>;
  onDelete: () => Promise<void>;
  isLoading?: boolean;
}

const BulkActionsPanel = ({ selectedCount, onStatusUpdate, onDelete, isLoading = false }: BulkActionsPanelProps) => {
  // Jeśli nie ma zaznaczonych elementów, nie wyświetlaj panelu
  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg flex items-center justify-between mb-4">
      <div className="text-sm text-blue-700 dark:text-blue-300">
        Zaznaczono {selectedCount} {selectedCount === 1 ? "fiszkę" : selectedCount < 5 ? "fiszki" : "fiszek"}
      </div>

      <div className="flex space-x-2">
        {/* Menu zmiany statusu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="bg-white dark:bg-zinc-800" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Przetwarzanie...
                </>
              ) : (
                <>
                  Zmień status
                  <ChevronDown className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onStatusUpdate("accepted")}>Zaakceptowane</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusUpdate("rejected")}>Odrzucone</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusUpdate("pending")}>Oczekujące</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Przycisk usuwania */}
        <Button variant="destructive" onClick={onDelete} disabled={isLoading} className="flex items-center">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Usuwanie...
            </>
          ) : (
            <>
              <Trash2 className="mr-2 h-4 w-4" />
              Usuń zaznaczone
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default BulkActionsPanel;
