import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { NavButtonDTO } from "@/types/dashboard";

export default function NavigationPanel() {
  const [navButtons] = useState<NavButtonDTO[]>([
    {
      label: "Generuj nowe fiszki",
      route: "/generate",
      icon: "✨",
    },
    {
      label: "Dodaj własne fiszki",
      route: "/flashcards/add",
      icon: "✏️",
    },
    {
      label: "Przeglądaj fiszki",
      route: "/library",
      icon: "📚",
    },
    {
      label: "Rozpocznij quiz",
      route: "/quiz",
      icon: "🧠",
    },
    {
      label: "Statystyki i postępy",
      route: "/stats",
      icon: "📊",
    },
  ]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Szybka nawigacja</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {navButtons.map((button, index) => (
            <a key={index} href={button.route} className="no-underline">
              <Button
                variant="outline"
                className="w-full h-auto py-6 flex flex-col items-center justify-center gap-2 text-lg"
              >
                <span className="text-2xl">{button.icon}</span>
                {button.label}
              </Button>
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
