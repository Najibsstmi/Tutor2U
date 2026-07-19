"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { BookOpenCheck, GraduationCap, Menu, Search, ShieldCheck, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/cari-tutor", label: "Cari tutor", icon: Search },
  { href: "/cara-ia-berfungsi", label: "Cara ia berfungsi", icon: BookOpenCheck },
  { href: "/kategori-tutor", label: "Kategori", icon: GraduationCap },
  { href: "/jadi-tutor", label: "Jadi tutor", icon: UserRound },
  { href: "/dashboard/admin", label: "Admin", icon: ShieldCheck },
];

export function SiteHeader() {
  const pathname = usePathname();

  const nav = (
    <nav className="flex flex-col gap-1 lg:flex-row lg:items-center lg:gap-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950",
              active && "bg-blue-50 text-blue-700",
            )}
          >
            <Icon className="size-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/92 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2" aria-label={siteConfig.name}>
          <Image
            src={siteConfig.brand.logo192}
            alt={`${siteConfig.name} logo`}
            width={48}
            height={48}
            priority
            className="size-11 rounded-md object-contain"
          />
          <span className="text-lg font-bold text-slate-950">{siteConfig.name}</span>
        </Link>

        <div className="hidden items-center gap-2 lg:flex">{nav}</div>

        <div className="hidden items-center gap-2 lg:flex">
          <Button asChild variant="ghost">
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild className="bg-blue-600 text-white hover:bg-blue-700">
            <Link href="/daftar">Daftar</Link>
          </Button>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="lg:hidden" aria-label="Buka menu">
              <Menu className="size-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[86vw] max-w-sm p-4">
            <SheetTitle className="flex items-center gap-2 text-left">
              <Image
                src={siteConfig.brand.logo192}
                alt={`${siteConfig.name} logo`}
                width={40}
                height={40}
                className="size-10 rounded-md object-contain"
              />
              {siteConfig.name}
            </SheetTitle>
            <div className="mt-6 flex flex-col gap-4">
              {nav}
              <div className="grid grid-cols-2 gap-2">
                <Button asChild variant="outline">
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild className="bg-blue-600 text-white hover:bg-blue-700">
                  <Link href="/daftar">Daftar</Link>
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
