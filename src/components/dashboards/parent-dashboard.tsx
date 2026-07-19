"use client";

import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CalendarCheck, ClipboardCheck, FileWarning, GraduationCap, Star, UserRound } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { MetricCard } from "@/components/shared/metric-card";
import { parentBookings, progressSeries, students, topicMastery } from "@/lib/demo-data";

const criteria = [
  "Penguasaan subjek",
  "Cara penerangan",
  "Kesabaran",
  "Komunikasi",
  "Ketepatan masa",
  "Persediaan kelas",
  "Profesionalisme",
  "Keberkesanan pembelajaran",
];

export function ParentDashboard() {
  const [pin, setPin] = useState("");

  function verifyPin() {
    if (pin === "4286" || pin === "7391") {
      toast.success("Kehadiran berjaya disahkan.");
      setPin("");
      return;
    }

    toast.error("PIN tidak sepadan dengan sesi aktif.");
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-blue-700">Dashboard ibu bapa</p>
        <h1 className="mt-1 text-3xl font-semibold text-slate-950">Pantau pembelajaran anak dalam satu tempat</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Profil anak" value="5" hint="2 memerlukan sasaran Julai" icon={UserRound} tone="blue" />
        <MetricCard label="Kelas akan datang" value="3" hint="1 menunggu tutor" icon={CalendarCheck} tone="green" />
        <MetricCard label="Kehadiran" value="96%" hint="+5% dari bulan lepas" icon={ClipboardCheck} tone="green" />
        <MetricCard label="Aduan aktif" value="1" hint="Reschedule requested" icon={FileWarning} tone="amber" />
      </div>

      <Tabs defaultValue="ringkasan" className="space-y-4">
        <TabsList className="grid h-auto grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-6">
          <TabsTrigger value="ringkasan">Ringkasan</TabsTrigger>
          <TabsTrigger value="anak">Anak</TabsTrigger>
          <TabsTrigger value="tempahan">Tempahan</TabsTrigger>
          <TabsTrigger value="kehadiran">Kehadiran</TabsTrigger>
          <TabsTrigger value="laporan">Laporan</TabsTrigger>
          <TabsTrigger value="rating">Rating</TabsTrigger>
        </TabsList>

        <TabsContent value="ringkasan" className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <Card className="rounded-lg border-slate-200 shadow-none">
            <CardHeader>
              <CardTitle>Perubahan markah</CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={progressSeries} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="markah" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="rounded-lg border-slate-200 shadow-none">
            <CardHeader>
              <CardTitle>Sasaran bulan semasa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {topicMastery.map((topic) => (
                <div key={topic.topic} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">{topic.topic}</span>
                    <span className="text-slate-500">{topic.mastery}%</span>
                  </div>
                  <Progress value={topic.mastery} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="anak">
          <Card className="rounded-lg border-slate-200 shadow-none">
            <CardHeader>
              <CardTitle>Profil anak</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              {students.map((student) => (
                <div key={student.id} className="rounded-lg border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-slate-950">{student.name}</h3>
                      <p className="text-sm text-slate-500">{student.school}</p>
                    </div>
                    <Badge variant="outline" className="border-blue-200 text-blue-700">
                      {student.level}
                    </Badge>
                  </div>
                  <p className="mt-3 text-sm text-slate-600">{student.focus}</p>
                  <div className="mt-3 flex gap-2">
                    <Badge variant="secondary" className="bg-emerald-50 text-emerald-700">
                      {student.curriculum}
                    </Badge>
                    <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                      Aktif
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tempahan">
          <Card className="rounded-lg border-slate-200 shadow-none">
            <CardHeader>
              <CardTitle>Senarai tempahan dan jadual kelas</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tutor</TableHead>
                    <TableHead>Anak</TableHead>
                    <TableHead>Subjek</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sesi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parentBookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-medium">{booking.tutorName}</TableCell>
                      <TableCell>{booking.studentName}</TableCell>
                      <TableCell>{booking.subject}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-emerald-200 text-emerald-700">
                          {booking.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{booking.nextSession}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kehadiran">
          <Card className="rounded-lg border-slate-200 shadow-none">
            <CardHeader>
              <CardTitle>Pengesahan kehadiran melalui PIN</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
              <div className="space-y-3">
                <Label htmlFor="pin">PIN kelas</Label>
                <Input id="pin" inputMode="numeric" maxLength={4} value={pin} onChange={(event) => setPin(event.target.value)} placeholder="4286" />
                <Button className="bg-blue-600 text-white hover:bg-blue-700" onClick={verifyPin}>
                  Sahkan kehadiran
                </Button>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={progressSeries}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} />
                    <Tooltip />
                    <Bar dataKey="kehadiran" fill="#10b981" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="laporan">
          <Card className="rounded-lg border-slate-200 shadow-none">
            <CardHeader>
              <CardTitle>Laporan perkembangan anak</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 lg:grid-cols-3">
              <ProgressNote title="Kekuatan" body="Adam semakin cepat mengenal pasti bentuk soalan fungsi dan tidak lagi kosongkan langkah kerja." icon={GraduationCap} />
              <ProgressNote title="Kelemahan" body="Graf kuadratik masih perlukan latihan supaya paksi dan titik pusingan lebih tepat." icon={FileWarning} />
              <ProgressNote title="Cadangan tutor" body="Buat 15 minit latihan graf setiap malam dan semak satu soalan KBAT bersama tutor." icon={ClipboardCheck} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rating">
          <Card className="rounded-lg border-slate-200 shadow-none">
            <CardHeader>
              <CardTitle>Rating terperinci selepas kelas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {criteria.map((item) => (
                  <div key={item} className="space-y-2">
                    <Label>{item}</Label>
                    <Input type="number" min={1} max={5} defaultValue={5} />
                  </div>
                ))}
              </div>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="review">Review teks</Label>
                <Textarea id="review" defaultValue="Tutor menerangkan dengan jelas dan memberi latihan yang sesuai dengan tahap anak." />
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button className="bg-blue-600 text-white hover:bg-blue-700" onClick={() => toast.success("Rating demo dihantar.")}>
                  <Star className="size-4" />
                  Hantar rating
                </Button>
                <Button variant="outline" onClick={() => toast.info("Aduan dan permohonan pertukaran tutor direkodkan sebagai demo.")}>
                  Aduan atau tukar tutor
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ProgressNote({
  title,
  body,
  icon: Icon,
}: {
  title: string;
  body: string;
  icon: typeof GraduationCap;
}) {
  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <div className="mb-3 grid size-9 place-items-center rounded-md bg-blue-50 text-blue-700">
        <Icon className="size-4" />
      </div>
      <h3 className="font-semibold text-slate-950">{title}</h3>
      <p className="mt-2 text-sm text-slate-600">{body}</p>
    </div>
  );
}
