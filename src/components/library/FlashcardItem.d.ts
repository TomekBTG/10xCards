import type { FlashcardViewModel } from "./LibraryViewPage";
import type { FlashcardDTO } from "../../types";

export interface FlashcardItemProps {
  flashcard: FlashcardViewModel;
  onSelect: (id: string, selected: boolean) => void;
  onUpdate?: (id: string, data: Partial<FlashcardDTO>) => Promise<boolean>;
  onDelete?: (id: string) => Promise<boolean>;
}

declare const FlashcardItem: React.FC<FlashcardItemProps>;
export default FlashcardItem;
