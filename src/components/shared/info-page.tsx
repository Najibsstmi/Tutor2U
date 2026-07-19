import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type InfoPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  items: string[];
  cta?: {
    href: string;
    label: string;
  };
};

export function InfoPage({ eyebrow, title, description, items, cta }: InfoPageProps) {
  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-sm font-medium text-blue-700">{eyebrow}</p>
      <h1 className="mt-2 text-4xl font-semibold leading-tight text-slate-950">{title}</h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">{description}</p>
      {cta ? (
        <Button asChild className="mt-6 bg-blue-600 text-white hover:bg-blue-700">
          <Link href={cta.href}>
            {cta.label}
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      ) : null}
      <div className="mt-8 grid gap-3 md:grid-cols-2">
        {items.map((item) => (
          <Card key={item} className="rounded-lg border-slate-200 shadow-none">
            <CardContent className="p-5 text-sm leading-6 text-slate-700">{item}</CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
