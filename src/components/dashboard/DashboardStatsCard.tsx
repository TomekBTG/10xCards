import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import type { DashboardStatsDTO } from "@/types/dashboard";

interface DashboardStatsCardProps {
  stat: DashboardStatsDTO;
}

function DashboardStatsCard({ stat }: DashboardStatsCardProps) {
  if (stat.value < 0) {
    console.error("Statistic value cannot be negative:", stat);
    return null;
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <h2 className="text-3xl font-bold mt-1">{stat.value}</h2>
          </div>
          {stat.icon && (
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="text-primary text-2xl">{stat.icon}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Funkcja porównawcza dla React.memo - renderuje ponownie tylko gdy dane statystyki się zmieniły
function arePropsEqual(prevProps: DashboardStatsCardProps, nextProps: DashboardStatsCardProps) {
  return (
    prevProps.stat.label === nextProps.stat.label &&
    prevProps.stat.value === nextProps.stat.value &&
    prevProps.stat.icon === nextProps.stat.icon
  );
}

export default React.memo(DashboardStatsCard, arePropsEqual);
