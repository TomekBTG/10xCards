import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Trash2 } from "lucide-react";
import type { FlashcardStatus } from "../../types";

interface BulkActionsPanelProps {
  selectedCount: number;
  onStatusChange: (status: FlashcardStatus) => void;
  onDelete: () => void;
}

const BulkActionsPanel = ({ selectedCount, onStatusChange, onDelete }: BulkActionsPanelProps) => {
  return (
    <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg flex items-center justify-between">
      <div className="text-sm text-blue-700">
        Zaznaczono {selectedCount} {selectedCount === 1 ? "fiszkę" : selectedCount < 5 ? "fiszki" : "fiszek"}
      </div>

      <div className="flex space-x-2">
        {/* Menu zmiany statusu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="bg-white">
              Zmień status
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onStatusChange("accepted")}>Zaakceptowane</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusChange("rejected")}>Odrzucone</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusChange("pending")}>Oczekujące</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Przycisk usuwania */}
        <Button variant="destructive" onClick={onDelete} className="flex items-center">
          <Trash2 className="mr-2 h-4 w-4" />
          Usuń zaznaczone
        </Button>
      </div>
    </div>
  );
};

export default BulkActionsPanel;
