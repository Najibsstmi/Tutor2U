"use client";

import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { zodResolver } from "@hookform/resolvers/zod";
import { Banknote, CalendarClock, ClipboardList, FileCheck2, Users } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { MetricCard } from "@/components/shared/metric-card";
import { parentBookings, progressSeries, students, tutorEarnings } from "@/lib/demo-data";
import { reportSchema } from "@/lib/validation";

type ReportValues = z.infer<typeof reportSchema>;

export function TutorDashboard() {
  const form = useForm<ReportValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      topics: "Fungsi kuadratik, graf dan punca persamaan",
      masteryLevel: 4,
      strengths: "Murid boleh faktorkan soalan asas tanpa bantuan.",
      weaknesses: "Masih keliru apabila perlu lakar graf dari persamaan.",
      recommendation: "Latihan graf 15 minit sehari dan ulang soalan KBAT.",
    },
  });

  function submitReport(values: ReportValues) {
    toast.success("Laporan kelas demo dihantar.", {
      description: `${values.topics} direkodkan pada tahap penguasaan ${values.masteryLevel}.`,
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-blue-700">Dashboard tutor</p>
        <h1 className="mt-1 text-3xl font-semibold text-slate-950">Urus kelas, laporan dan pendapatan</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Murid aktif" value="18" hint="5 murid SPM" icon={Users} tone="blue" />
        <MetricCard label="Kelas minggu ini" value="12" hint="3 perlu disahkan" icon={CalendarClock} tone="green" />
        <MetricCard label="Laporan belum hantar" value="2" hint="SLA 24 jam" icon={ClipboardList} tone="amber" />
        <MetricCard label="Pendapatan bulan ini" value="RM3.38k" hint="Payout RM2.87k" icon={Banknote} tone="green" />
      </div>

      <Tabs defaultValue="ringkasan" className="space-y-4">
        <TabsList className="grid h-auto grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-7">
          <TabsTrigger value="ringkasan">Ringkasan</TabsTrigger>
          <TabsTrigger value="profil">Profil</TabsTrigger>
          <TabsTrigger value="jadual">Jadual</TabsTrigger>
          <TabsTrigger value="murid">Murid</TabsTrigger>
          <TabsTrigger value="laporan">Laporan</TabsTrigger>
          <TabsTrigger value="latihan">Latihan</TabsTrigger>
          <TabsTrigger value="pendapatan">Pendapatan</TabsTrigger>
        </TabsList>

        <TabsContent value="ringkasan" className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          <Card className="rounded-lg border-slate-200 shadow-none">
            <CardHeader>
              <CardTitle>Jam kelas dan prestasi murid</CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={progressSeries}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="jam" stroke="#10b981" strokeWidth={3} />
                  <Line type="monotone" dataKey="markah" stroke="#2563eb" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="rounded-lg border-slate-200 shadow-none">
            <CardHeader>
              <CardTitle>Professional Score</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                ["Kelulusan akademik", 96],
                ["Pengalaman mengajar", 92],
                ["Kelas selesai", 94],
                ["Ketepatan masa", 98],
                ["Kadar respons", 97],
              ].map(([label, value]) => (
                <div key={label} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">{label}</span>
                    <span className="text-slate-500">{value}</span>
                  </div>
                  <Progress value={Number(value)} />
                </div>
              ))}
              <div className="flex flex-wrap gap-2 pt-2">
                {["Identiti Disahkan", "Sijil Disahkan", "Pakar SPM", "Respons Pantas"].map((badge) => (
                  <Badge key={badge} className="bg-emerald-50 text-emerald-700">
                    {badge}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profil">
          <Card className="rounded-lg border-slate-200 shadow-none">
            <CardHeader>
              <CardTitle>Pendaftaran tutor berperingkat</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {[
                ["Profil profesional", "Lengkap", "Tajuk, bio, gambar profil dan kadar harga telah disemak."],
                ["Kad pengenalan", "Disahkan", "Dokumen disimpan dalam bucket peribadi Supabase."],
                ["Sijil akademik", "Disahkan", "Sarjana Pendidikan Matematik telah diluluskan pejabat."],
                ["Kawasan dan jadual", "Aktif", "Online dan fizikal sekitar Kuala Lumpur."],
              ].map(([title, status, body]) => (
                <div key={title} className="rounded-lg border border-slate-200 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-slate-950">{title}</h3>
                    <Badge variant="outline" className="border-emerald-200 text-emerald-700">
                      {status}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{body}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jadual">
          <Card className="rounded-lg border-slate-200 shadow-none">
            <CardHeader>
              <CardTitle>Permintaan kelas dan jadual mingguan</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Murid</TableHead>
                    <TableHead>Subjek</TableHead>
                    <TableHead>Mod</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tindakan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parentBookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-medium">{booking.studentName}</TableCell>
                      <TableCell>{booking.subject}</TableCell>
                      <TableCell>{booking.mode}</TableCell>
                      <TableCell>{booking.status}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => toast.success("Permintaan diterima.")}>
                            Terima
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => toast.warning("Permintaan ditolak sebagai demo.")}>
                            Tolak
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="murid">
          <Card className="rounded-lg border-slate-200 shadow-none">
            <CardHeader>
              <CardTitle>Senarai murid</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              {students.slice(0, 4).map((student) => (
                <div key={student.id} className="rounded-lg border border-slate-200 p-4">
                  <h3 className="font-semibold text-slate-950">{student.name}</h3>
                  <p className="mt-1 text-sm text-slate-500">{student.level} - {student.curriculum}</p>
                  <p className="mt-3 text-sm text-slate-600">{student.focus}</p>
                  <Button className="mt-4 bg-blue-600 text-white hover:bg-blue-700" size="sm" onClick={() => toast.info("Kelas demo dimulakan.")}>
                    Mulakan kelas
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="laporan">
          <Card className="rounded-lg border-slate-200 shadow-none">
            <CardHeader>
              <CardTitle>Isi laporan selepas kelas</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(submitReport)} className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="topics">Topik dan kemahiran</Label>
                  <Input id="topics" {...form.register("topics")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="masteryLevel">Tahap penguasaan 1-6</Label>
                  <Input id="masteryLevel" type="number" min={1} max={6} {...form.register("masteryLevel", { valueAsNumber: true })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="strengths">Kekuatan</Label>
                  <Textarea id="strengths" {...form.register("strengths")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weaknesses">Kelemahan</Label>
                  <Textarea id="weaknesses" {...form.register("weaknesses")} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="recommendation">Cadangan tutor dan tugasan</Label>
                  <Textarea id="recommendation" {...form.register("recommendation")} />
                </div>
                <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700 md:w-fit">
                  <FileCheck2 className="size-4" />
                  Hantar laporan
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="latihan">
          <Card className="rounded-lg border-slate-200 shadow-none">
            <CardHeader>
              <CardTitle>Latihan, ujian dan markah</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
              <div className="space-y-3">
                {[
                  ["Latihan Fungsi Kuadratik", "Adam Faris", "Due 27 Jul", "Assigned"],
                  ["Kuiz Inersia", "Irfan Danial", "31/40", "Marked"],
                  ["Writing Task 2", "Chloe Tan", "Due 26 Jul", "Draft"],
                ].map(([title, student, meta, status]) => (
                  <div key={title} className="rounded-lg border border-slate-200 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold text-slate-950">{title}</h3>
                      <Badge variant="outline">{status}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">{student} - {meta}</p>
                  </div>
                ))}
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={progressSeries}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} />
                    <Tooltip />
                    <Bar dataKey="markah" fill="#2563eb" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pendapatan">
          <Card className="rounded-lg border-slate-200 shadow-none">
            <CardHeader>
              <CardTitle>Pendapatan, komisen dan status bayaran</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={tutorEarnings}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} />
                    <Tooltip />
                    <Bar dataKey="gross" fill="#2563eb" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="net" fill="#10b981" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3">
                <div className="rounded-lg border border-slate-200 p-4">
                  <p className="text-sm text-slate-500">Payout seterusnya</p>
                  <p className="mt-1 text-2xl font-semibold text-slate-950">RM2,873</p>
                  <p className="mt-1 text-sm text-slate-500">Dijadualkan 26 Jul</p>
                </div>
                <Button variant="outline" onClick={() => toast.info("Ketidakhadiran dan permintaan tutor pengganti dihantar kepada admin.")}>
                  Laporkan ketidakhadiran
                </Button>
                <Button variant="outline" onClick={() => toast.success("Permintaan tutor pengganti direkodkan.")}>
                  Minta tutor pengganti
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
