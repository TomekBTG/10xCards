import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface EmailInputProps {
  label: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
}

export function EmailInput({ label, value, error, onChange, onBlur }: EmailInputProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleBlur = () => {
    if (onBlur) onBlur();
  };

  return (
    <div className="space-y-2">
      <Label
        htmlFor="email"
        className={cn("block text-sm font-medium", error ? "text-destructive" : "text-muted-foreground")}
      >
        {label}
      </Label>
      <Input
        id="email"
        type="email"
        value={value}
        onChange={handleInputChange}
        onBlur={handleBlur}
        className={cn("block w-full", error ? "border-destructive focus-visible:ring-destructive" : "")}
        placeholder="email@przykład.pl"
        autoComplete="email"
      />
      {error && <p className="text-sm text-destructive mt-1">{error}</p>}
    </div>
  );
}
