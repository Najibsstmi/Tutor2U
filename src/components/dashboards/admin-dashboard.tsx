"use client";

import Link from "next/link";
import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Banknote, BookOpenCheck, CalendarClock, FileCheck2, FileWarning, ShieldCheck, Star, Users } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MetricCard } from "@/components/shared/metric-card";
import { adminStats, adminTutorReviews, progressSeries, tutorEarnings } from "@/lib/demo-data";
import { useTranslations } from "@/lib/i18n/use-translations";
import type { AdminTutorReview } from "@/lib/types";

const statusClass: Record<AdminTutorReview["status"], string> = {
  Menunggu: "border-amber-200 bg-amber-50 text-amber-700",
  "Perlu pembetulan": "border-red-200 bg-red-50 text-red-700",
  Diluluskan: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

export function AdminDashboard() {
  const { t } = useTranslations();
  const [reviews, setReviews] = useState(adminTutorReviews);

  function updateTutorStatus(id: string, status: AdminTutorReview["status"]) {
    setReviews((current) => current.map((review) => (review.id === id ? { ...review, status } : review)));
    toast.success(`Status tutor dikemas kini: ${status}.`);
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-blue-700">Dashboard admin</p>
        <h1 className="mt-1 text-3xl font-semibold text-slate-950">Pengurusan operasi Tutor2U</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Tutor aktif" value="10" hint="+2 minggu ini" icon={ShieldCheck} tone="green" />
        <MetricCard label="Menunggu pengesahan" value="2" hint="1 perlu pembetulan" icon={FileCheck2} tone="amber" />
        <MetricCard label="Pelanggan aktif" value="3" hint="5 murid aktif" icon={Users} tone="blue" />
        <MetricCard label="Tempahan hari ini" value="7" hint="3 belum disahkan" icon={CalendarClock} tone="blue" />
        <MetricCard label="Bayaran tertunggak" value="RM3.1k" hint="5 payout pending" icon={Banknote} tone="amber" />
      </div>

      <Card className="rounded-lg border-blue-200 bg-blue-50 shadow-none">
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-slate-950">{t("dashboardLinks.adminVerification")}</h2>
            <p className="text-sm text-slate-600">{t("dashboardLinks.adminVerificationHint")}</p>
          </div>
          <Button asChild className="bg-blue-600 text-white hover:bg-blue-700">
            <Link href="/dashboard/admin/tutor-applications">{t("dashboardLinks.adminVerification")}</Link>
          </Button>
        </CardContent>
      </Card>

      <Tabs defaultValue="ringkasan" className="space-y-4">
        <TabsList className="grid h-auto grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-7">
          <TabsTrigger value="ringkasan">Ringkasan</TabsTrigger>
          <TabsTrigger value="tutor">Tutor</TabsTrigger>
          <TabsTrigger value="booking">Booking</TabsTrigger>
          <TabsTrigger value="laporan">Laporan</TabsTrigger>
          <TabsTrigger value="kualiti">Kualiti</TabsTrigger>
          <TabsTrigger value="bayaran">Bayaran</TabsTrigger>
          <TabsTrigger value="audit">Audit</TabsTrigger>
        </TabsList>

        <TabsContent value="ringkasan" className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
          <Card className="rounded-lg border-slate-200 shadow-none">
            <CardHeader>
              <CardTitle>Jualan dan komisen platform</CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tutorEarnings}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Bar dataKey="gross" fill="#2563eb" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="commission" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="rounded-lg border-slate-200 shadow-none">
            <CardHeader>
              <CardTitle>Ringkasan pejabat</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {adminStats.slice(1, 6).map((stat) => (
                <div key={stat.label} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 p-3">
                  <div>
                    <p className="font-medium text-slate-950">{stat.label}</p>
                    <p className="text-sm text-slate-500">{stat.trend}</p>
                  </div>
                  <span className="text-xl font-semibold text-blue-700">{stat.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tutor">
          <Card className="rounded-lg border-slate-200 shadow-none">
            <CardHeader>
              <CardTitle>Semakan dokumen dan pengesahan tutor</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tutor</TableHead>
                    <TableHead>Negeri</TableHead>
                    <TableHead>Subjek</TableHead>
                    <TableHead>Dokumen</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tindakan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reviews.map((review) => (
                    <TableRow key={review.id}>
                      <TableCell className="font-medium">{review.name}</TableCell>
                      <TableCell>{review.state}</TableCell>
                      <TableCell>{review.subject}</TableCell>
                      <TableCell>{review.documents.join(", ")}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusClass[review.status]}>
                          {review.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" variant="outline" onClick={() => updateTutorStatus(review.id, "Diluluskan")}>
                            Lulus
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => updateTutorStatus(review.id, "Perlu pembetulan")}>
                            Pembetulan
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => toast.warning("Tutor digantung sebagai demo.")}>
                            Gantung
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

        <TabsContent value="booking">
          <Card className="rounded-lg border-slate-200 shadow-none">
            <CardHeader>
              <CardTitle>Pengurusan tempahan dan kelas</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 lg:grid-cols-3">
              {[
                ["Pending payment", "8", "Payment gateway placeholder"],
                ["Pending tutor confirmation", "3", "Perlu follow up tutor"],
                ["Replacement required", "1", "Admin perlu cari tutor pengganti"],
              ].map(([label, value, hint]) => (
                <div key={label} className="rounded-lg border border-slate-200 p-4">
                  <p className="text-sm text-slate-500">{label}</p>
                  <p className="mt-1 text-3xl font-semibold text-slate-950">{value}</p>
                  <p className="mt-2 text-sm text-slate-600">{hint}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="laporan">
          <Card className="rounded-lg border-slate-200 shadow-none">
            <CardHeader>
              <CardTitle>Laporan kelas belum dihantar</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
              <div className="space-y-3">
                {[
                  ["Cikgu Aisyah", "Adam Faris", "Lewat 3 jam"],
                  ["Teacher Priyaa", "Chloe Tan", "Due malam ini"],
                  ["Cikgu Lina", "Sofia Hana", "Draft belum submit"],
                ].map(([tutor, student, status]) => (
                  <div key={`${tutor}-${student}`} className="rounded-lg border border-slate-200 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-slate-950">{tutor}</p>
                      <Badge variant="outline" className="border-amber-200 text-amber-700">
                        {status}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">{student}</p>
                  </div>
                ))}
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={progressSeries}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="kehadiran" stroke="#10b981" strokeWidth={3} />
                    <Line type="monotone" dataKey="markah" stroke="#2563eb" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kualiti">
          <Card className="rounded-lg border-slate-200 shadow-none">
            <CardHeader>
              <CardTitle>Rating, review dan aduan</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 lg:grid-cols-3">
              <QualityTile icon={Star} title="Review perlu semakan" value="4" progress={40} />
              <QualityTile icon={FileWarning} title="Aduan aktif" value="1" progress={20} />
              <QualityTile icon={BookOpenCheck} title="Laporan kualiti lengkap" value="92%" progress={92} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bayaran">
          <Card className="rounded-lg border-slate-200 shadow-none">
            <CardHeader>
              <CardTitle>Pengurusan pembayaran dan bayaran tutor</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tutor</TableHead>
                    <TableHead>Gross</TableHead>
                    <TableHead>Komisen</TableHead>
                    <TableHead>Net</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    ["Cikgu Aisyah", "RM320", "RM48", "RM272", "Pending"],
                    ["Cikgu Hafiz", "RM39", "RM5.85", "RM33.15", "Processing"],
                    ["Cikgu Nadia", "RM640", "RM96", "RM544", "Held"],
                  ].map(([name, gross, commission, net, status]) => (
                    <TableRow key={name}>
                      <TableCell className="font-medium">{name}</TableCell>
                      <TableCell>{gross}</TableCell>
                      <TableCell>{commission}</TableCell>
                      <TableCell>{net}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit">
          <Card className="rounded-lg border-slate-200 shadow-none">
            <CardHeader>
              <CardTitle>Kategori, subjek, tutor pengganti dan audit log</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-3">
                {["KSSM", "KSSR", "IGCSE", "Matematik Tambahan", "Tutor pengganti Selangor"].map((item) => (
                  <div key={item} className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                    <span className="font-medium text-slate-950">{item}</span>
                    <Button size="sm" variant="outline" onClick={() => toast.info(`${item} dibuka untuk suntingan demo.`)}>
                      Urus
                    </Button>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                {[
                  ["approve_tutor", "Cikgu Aisyah", "Hari ini"],
                  ["request_correction", "Cikgu Hakim", "Semalam"],
                  ["assign_replacement", "Booking BK-112", "2 hari lepas"],
                ].map(([action, entity, time]) => (
                  <div key={`${action}-${entity}`} className="rounded-lg border border-slate-200 p-3">
                    <p className="font-medium text-slate-950">{action}</p>
                    <p className="text-sm text-slate-500">{entity} - {time}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function QualityTile({
  icon: Icon,
  title,
  value,
  progress,
}: {
  icon: typeof Star;
  title: string;
  value: string;
  progress: number;
}) {
  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <div className="mb-3 grid size-9 place-items-center rounded-md bg-blue-50 text-blue-700">
        <Icon className="size-4" />
      </div>
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-1 text-3xl font-semibold text-slate-950">{value}</p>
      <Progress value={progress} className="mt-3" />
    </div>
  );
}
