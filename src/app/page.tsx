import Link from "next/link";
import { ArrowRight, CalendarCheck, ChartNoAxesCombined, CheckCircle2, GraduationCap, MapPin, ShieldCheck, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { tutors } from "@/lib/demo-data";

const featuredTutors = tutors.filter((tutor) => tutor.verified).slice(0, 3);

export default function Home() {
  return (
    <main className="bg-slate-50">
      <section className="relative isolate overflow-hidden border-b border-slate-200 bg-white">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_68%,#f1f5f9_100%)]" />
        <div className="absolute inset-x-0 bottom-0 top-16 -z-10 opacity-80">
          <HeroScene />
        </div>
        <div className="mx-auto flex min-h-[calc(100svh-8rem)] max-w-7xl items-center px-4 py-16 sm:px-6 lg:px-8">
          <div className="w-full max-w-[22rem] py-10 lg:max-w-lg">
            <Badge className="mb-5 bg-emerald-50 text-emerald-700">Marketplace tutor seluruh Malaysia</Badge>
            <h1 className="text-3xl font-semibold leading-tight text-slate-950 lg:text-5xl">
              Cari tutor, tempah kelas dan pantau perkembangan anak dalam satu aplikasi.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
              Tutor yang disahkan, jadual masa nyata, laporan pembelajaran dan jaminan pengurusan Tutor2U.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild className="h-11 w-full bg-blue-600 px-5 text-white hover:bg-blue-700 lg:w-auto">
                <Link href="/cari-tutor">
                  Cari Tutor
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-11 w-full px-5 lg:w-auto">
                <Link href="/jadi-tutor">Daftar Sebagai Tutor</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-8 sm:px-6 md:grid-cols-4 lg:px-8">
        {[
          ["12", "tutor demo", "Pelbagai negeri dan subjek"],
          ["3 role", "akses berasaskan peranan", "Parent, tutor dan admin"],
          ["100%", "schema Supabase", "Migration dan RLS tersedia"],
          ["PWA", "mobile-first", "Installable dan responsif"],
        ].map(([value, label, hint]) => (
          <Card key={label} className="rounded-lg border-slate-200 shadow-none">
            <CardContent className="p-4">
              <p className="text-3xl font-semibold text-blue-700">{value}</p>
              <p className="mt-1 font-medium text-slate-950">{label}</p>
              <p className="mt-1 text-sm text-slate-500">{hint}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div>
          <p className="text-sm font-medium text-blue-700">Cara Tutor2U berfungsi</p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-950">Dari carian tutor ke laporan pembelajaran</h2>
          <p className="mt-4 text-slate-600">
            Ibu bapa memilih tutor berdasarkan lokasi, subjek, kelayakan, slot, Professional Score dan Customer Rating. Tutor mengurus kelas serta laporan, manakala admin menjaga pengesahan dan kualiti.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            [MapPin, "Cari dan tapis", "Negeri, daerah, jarak, subjek, tahap, kurikulum, mod kelas, harga dan rating."],
            [CalendarCheck, "Tempah slot", "Pilih anak, subjek, objektif, mod kelas dan slot tersedia."],
            [ChartNoAxesCombined, "Pantau akademik", "Graf markah, kehadiran, jam kelas, tugasan dan penguasaan topik."],
            [ShieldCheck, "Jaminan operasi", "Admin mengurus tutor, aduan, pembayaran, semakan dokumen dan tutor pengganti."],
          ].map(([Icon, title, body]) => (
            <Card key={String(title)} className="rounded-lg border-slate-200 shadow-none">
              <CardContent className="p-5">
                <div className="mb-4 grid size-10 place-items-center rounded-md bg-blue-50 text-blue-700">
                  <Icon className="size-5" />
                </div>
                <h3 className="font-semibold text-slate-950">{title as string}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{body as string}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700">Tutor pilihan</p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-950">Kad marketplace dengan skor berasingan</h2>
            </div>
            <Button asChild variant="outline">
              <Link href="/cari-tutor">Lihat semua tutor</Link>
            </Button>
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {featuredTutors.map((tutor) => (
              <Card key={tutor.id} className="rounded-lg border-slate-200 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-slate-950">{tutor.name}</h3>
                      <p className="mt-1 text-sm text-slate-500">{tutor.title}</p>
                    </div>
                    <Badge className="bg-emerald-50 text-emerald-700">
                      <CheckCircle2 className="size-3" />
                      Disahkan
                    </Badge>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <MiniStat label="Pro" value={String(tutor.professionalScore)} />
                    <MiniStat label="Rating" value={tutor.rating.toFixed(1)} />
                    <MiniStat label="RM/jam" value={String(tutor.price)} />
                  </div>
                  <p className="mt-4 text-sm leading-6 text-slate-600">{tutor.highlight}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-3">
          {[
            [GraduationCap, "Parent dashboard", "Profil anak, tempahan, PIN kehadiran, laporan perkembangan, rating dan aduan."],
            [Star, "Tutor dashboard", "Profil profesional, jadual, murid, laporan kelas, tugasan, markah dan pendapatan."],
            [ShieldCheck, "Admin dashboard", "Pengesahan tutor, tempahan, kelas, laporan, review, aduan, payout dan audit log."],
          ].map(([Icon, title, body]) => (
            <Card key={String(title)} className="rounded-lg border-slate-200 shadow-none">
              <CardContent className="p-5">
                <div className="mb-4 grid size-10 place-items-center rounded-md bg-emerald-50 text-emerald-700">
                  <Icon className="size-5" />
                </div>
                <h3 className="font-semibold text-slate-950">{title as string}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{body as string}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-slate-50 px-3 py-2">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-lg font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function HeroScene() {
  return (
    <div className="pointer-events-none mx-auto h-full max-w-7xl px-4 sm:px-6 lg:px-8" aria-hidden="true">
      <div className="ml-auto hidden h-full max-w-2xl grid-cols-12 grid-rows-6 gap-3 py-10 opacity-95 lg:grid">
        <div className="col-span-7 row-span-3 rounded-lg border border-blue-100 bg-white/88 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-950">Tutor berhampiran</span>
            <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs text-emerald-700">Live slot</span>
          </div>
          <div className="mt-4 space-y-3">
            {featuredTutors.map((tutor) => (
              <div key={tutor.id} className="flex items-center justify-between rounded-md bg-slate-50 p-3">
                <div>
                  <p className="text-sm font-medium text-slate-900">{tutor.name}</p>
                  <p className="text-xs text-slate-500">{tutor.subjects[0]} - RM{tutor.price}/jam</p>
                </div>
                <span className="text-sm font-semibold text-blue-700">{tutor.professionalScore}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="col-span-5 row-span-2 rounded-lg border border-emerald-100 bg-white/88 p-4 shadow-sm">
          <p className="text-sm font-semibold text-slate-950">Markah anak</p>
          <div className="mt-4 flex h-24 items-end gap-2">
            {[48, 56, 64, 72, 78].map((height, index) => (
              <span key={height} className="w-full rounded-t-md bg-blue-500/85" style={{ height: `${height}%` }}>
                <span className="sr-only">Bulan {index + 1}</span>
              </span>
            ))}
          </div>
        </div>
        <div className="col-span-5 row-span-2 rounded-lg border border-slate-200 bg-white/88 p-4 shadow-sm">
          <p className="text-sm font-semibold text-slate-950">Kelas hari ini</p>
          <div className="mt-4 space-y-2">
            {["8:00 malam - Add Math", "9:30 malam - English"].map((item) => (
              <div key={item} className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                {item}
              </div>
            ))}
          </div>
        </div>
        <div className="col-span-7 row-span-3 rounded-lg border border-slate-200 bg-white/88 p-4 shadow-sm">
          <p className="text-sm font-semibold text-slate-950">Operasi admin</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {["Tutor menunggu: 2", "Aduan aktif: 1", "Payout pending: 5", "Laporan lewat: 4"].map((item) => (
              <div key={item} className="rounded-md border border-slate-200 bg-white p-3 text-sm text-slate-600">
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
