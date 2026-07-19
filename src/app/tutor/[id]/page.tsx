import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, BadgeCheck, CalendarClock, MapPin, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { tutors } from "@/lib/demo-data";

type TutorPageProps = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return tutors.map((tutor) => ({ id: tutor.id }));
}

export async function generateMetadata({ params }: TutorPageProps): Promise<Metadata> {
  const { id } = await params;
  const tutor = tutors.find((item) => item.id === id);

  return {
    title: tutor ? tutor.name : "Profil Tutor",
  };
}

export default async function TutorProfilePage({ params }: TutorPageProps) {
  const { id } = await params;
  const tutor = tutors.find((item) => item.id === id);

  if (!tutor) {
    notFound();
  }

  const breakdown = [
    ["Kelulusan akademik", tutor.scoreBreakdown.kelulusan],
    ["Pengalaman mengajar", tutor.scoreBreakdown.pengalaman],
    ["Kelas selesai", tutor.scoreBreakdown.kelasSelesai],
    ["Ketepatan masa", tutor.scoreBreakdown.ketepatanMasa],
    ["Kadar respons", tutor.scoreBreakdown.respons],
    ["Prestasi murid", tutor.scoreBreakdown.prestasiMurid],
  ];

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <Button asChild variant="ghost" className="mb-4">
        <Link href="/cari-tutor">
          <ArrowLeft className="size-4" />
          Kembali ke carian
        </Link>
      </Button>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="space-y-4">
          <Card className="rounded-lg border-slate-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-3xl font-semibold text-slate-950">{tutor.name}</h1>
                    {tutor.verified ? (
                      <Badge className="bg-emerald-50 text-emerald-700">
                        <BadgeCheck className="size-3" />
                        Identiti Disahkan
                      </Badge>
                    ) : null}
                  </div>
                  <p className="mt-2 text-lg text-slate-600">{tutor.title}</p>
                  <p className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                    <MapPin className="size-4" />
                    {tutor.district}, {tutor.state} - {tutor.distanceKm} km dari kawasan demo
                  </p>
                </div>
                <div className="rounded-lg bg-blue-50 p-4 text-blue-900">
                  <p className="text-sm">Kadar bermula</p>
                  <p className="text-3xl font-semibold">RM{tutor.price}</p>
                  <p className="text-sm">sejam</p>
                </div>
              </div>
              <Separator className="my-5" />
              <p className="leading-7 text-slate-700">{tutor.bio}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {tutor.subjects.map((subject) => (
                  <Badge key={subject} variant="outline" className="border-blue-200 text-blue-700">
                    {subject}
                  </Badge>
                ))}
                {tutor.badges.map((badge) => (
                  <Badge key={badge} className="bg-emerald-50 text-emerald-700">
                    {badge}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-lg border-slate-200 shadow-none">
            <CardHeader>
              <CardTitle>Professional Score</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <ScoreBox label="Professional Score" value={`${tutor.professionalScore}/100`} />
                <ScoreBox label="Customer Rating" value={tutor.rating ? `${tutor.rating}/5` : "Belum ada"} />
                <ScoreBox label="Review disahkan" value={String(tutor.reviewCount)} />
              </div>
              {breakdown.map(([label, value]) => (
                <div key={label} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">{label}</span>
                    <span className="text-slate-500">{value}</span>
                  </div>
                  <Progress value={Number(value)} />
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <aside className="space-y-4">
          <Card className="rounded-lg border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle>Jadual masa nyata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {tutor.slots.map((slot) => (
                <div key={slot.id} className="rounded-lg border border-slate-200 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2 font-medium text-slate-950">
                      <CalendarClock className="size-4 text-blue-600" />
                      {slot.day}
                    </span>
                    <Badge variant="outline">{slot.status}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{slot.date} - {slot.time} - {slot.mode}</p>
                </div>
              ))}
              <Button asChild className="w-full bg-blue-600 text-white hover:bg-blue-700">
                <Link href="/cari-tutor">Tempah sesi percubaan</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-lg border-slate-200 shadow-none">
            <CardHeader>
              <CardTitle>Customer Rating</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {["Penguasaan subjek", "Cara penerangan", "Kesabaran", "Komunikasi", "Ketepatan masa", "Persediaan kelas", "Profesionalisme", "Keberkesanan pembelajaran"].map((item, index) => (
                <div key={item} className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-slate-600">{item}</span>
                  <span className="flex items-center gap-1 font-semibold text-slate-950">
                    <Star className="size-3 fill-amber-400 text-amber-400" />
                    {(4.6 + (index % 3) * 0.1).toFixed(1)}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </aside>
      </div>
    </main>
  );
}

function ScoreBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-950">{value}</p>
    </div>
  );
}
