import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

type MetricCardProps = {
  label: string;
  value: string;
  hint: string;
  icon: LucideIcon;
  tone?: "blue" | "green" | "amber" | "slate";
};

const toneMap = {
  blue: "bg-blue-50 text-blue-700",
  green: "bg-emerald-50 text-emerald-700",
  amber: "bg-amber-50 text-amber-700",
  slate: "bg-slate-100 text-slate-700",
};

export function MetricCard({ label, value, hint, icon: Icon, tone = "blue" }: MetricCardProps) {
  return (
    <Card className="rounded-lg border-slate-200 shadow-none">
      <CardContent className="flex items-center gap-4 p-4">
        <span className={`grid size-10 shrink-0 place-items-center rounded-md ${toneMap[tone]}`}>
          <Icon className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="text-sm text-slate-500">{label}</p>
          <p className="text-2xl font-semibold text-slate-950">{value}</p>
          <p className="truncate text-xs text-slate-500">{hint}</p>
        </div>
      </CardContent>
    </Card>
  );
}
