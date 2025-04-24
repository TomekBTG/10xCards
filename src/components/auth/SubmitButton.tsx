import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface SubmitButtonProps {
  text: string;
  isLoading: boolean;
  isDisabled?: boolean;
  onClick?: () => void;
}

export function SubmitButton({ text, isLoading, isDisabled = false, onClick }: SubmitButtonProps) {
  return (
    <Button type="submit" className="w-full" disabled={isLoading || isDisabled} onClick={onClick}>
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          <span>Przetwarzanie...</span>
        </>
      ) : (
        text
      )}
    </Button>
  );
}
