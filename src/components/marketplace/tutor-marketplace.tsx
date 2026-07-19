"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  BadgeCheck,
  CalendarClock,
  GitCompare,
  Heart,
  MapPin,
  Search,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { students, subjects, states, levels, curriculums, tutors } from "@/lib/demo-data";
import type { ClassMode, SlotStatus, Tutor } from "@/lib/types";
import { bookingSchema } from "@/lib/validation";
import { cn } from "@/lib/utils";

type BookingValues = z.infer<typeof bookingSchema>;

const modes: ClassMode[] = ["Online", "Fizikal", "Hibrid"];

const statusTone: Record<SlotStatus, string> = {
  Available: "border-emerald-200 bg-emerald-50 text-emerald-700",
  "Temporarily held": "border-amber-200 bg-amber-50 text-amber-700",
  Booked: "border-slate-200 bg-slate-100 text-slate-600",
  Unavailable: "border-red-200 bg-red-50 text-red-700",
};

export function TutorMarketplace() {
  const [subject, setSubject] = useState("all");
  const [state, setState] = useState("all");
  const [level, setLevel] = useState("all");
  const [curriculum, setCurriculum] = useState("all");
  const [mode, setMode] = useState("all");
  const [gender, setGender] = useState("all");
  const [maxPrice, setMaxPrice] = useState(120);
  const [minScore, setMinScore] = useState(70);
  const [minRating, setMinRating] = useState(0);
  const [availableOnly, setAvailableOnly] = useState(true);
  const [favourites, setFavourites] = useState<string[]>(["aisyah-rahman"]);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [bookingTutor, setBookingTutor] = useState<Tutor | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id ?? "");
  const [selectedSubject, setSelectedSubject] = useState("Matematik");
  const [selectedMode, setSelectedMode] = useState<ClassMode>("Online");
  const [selectedSlotId, setSelectedSlotId] = useState("");

  const form = useForm<BookingValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      studentId: students[0]?.id ?? "",
      subject: "Matematik",
      mode: "Online",
      slotId: "",
      objective: "Sesi percubaan untuk kenal pasti jurang pembelajaran dan bina pelan ulang kaji.",
    },
  });

  function openBookingDialog(tutor: Tutor) {
    const firstSlot = tutor.slots.find((slot) => slot.status === "Available");
    const nextStudentId = students[0]?.id ?? "";
    const nextSubject = tutor.subjects[0] ?? "";
    const nextMode = firstSlot?.mode ?? tutor.modes[0];
    const nextSlotId = firstSlot?.id ?? "";

    setSelectedStudentId(nextStudentId);
    setSelectedSubject(nextSubject);
    setSelectedMode(nextMode);
    setSelectedSlotId(nextSlotId);
    form.reset({
      studentId: nextStudentId,
      subject: nextSubject,
      mode: nextMode,
      slotId: nextSlotId,
      objective: "Sesi percubaan untuk kenal pasti jurang pembelajaran dan bina pelan ulang kaji.",
    });
    setBookingTutor(tutor);
  }

  const filteredTutors = useMemo(() => {
    return tutors.filter((tutor) => {
      const hasAvailableSlot = tutor.slots.some((slot) => slot.status === "Available");

      return (
        (subject === "all" || tutor.subjects.includes(subject)) &&
        (state === "all" || tutor.state === state) &&
        (level === "all" || tutor.levels.includes(level)) &&
        (curriculum === "all" || tutor.curriculums.includes(curriculum)) &&
        (mode === "all" || tutor.modes.includes(mode as ClassMode)) &&
        (gender === "all" || tutor.gender === gender) &&
        tutor.price <= maxPrice &&
        tutor.professionalScore >= minScore &&
        tutor.rating >= minRating &&
        (!availableOnly || hasAvailableSlot)
      );
    });
  }, [availableOnly, curriculum, gender, level, maxPrice, minRating, minScore, mode, state, subject]);

  const compareTutors = compareIds
    .map((id) => tutors.find((tutor) => tutor.id === id))
    .filter((tutor): tutor is Tutor => Boolean(tutor));

  function toggleFavourite(tutorId: string) {
    setFavourites((current) =>
      current.includes(tutorId) ? current.filter((id) => id !== tutorId) : [...current, tutorId],
    );
  }

  function toggleCompare(tutorId: string) {
    setCompareIds((current) => {
      if (current.includes(tutorId)) {
        return current.filter((id) => id !== tutorId);
      }

      if (current.length === 3) {
        toast.warning("Maksimum tiga tutor boleh dibandingkan.");
        return current;
      }

      return [...current, tutorId];
    });
  }

  function onBookingSubmit(values: BookingValues) {
    const student = students.find((item) => item.id === values.studentId);
    const slot = bookingTutor?.slots.find((item) => item.id === values.slotId);

    toast.success("Tempahan demo direkodkan.", {
      description: `${student?.name ?? "Murid"} bersama ${bookingTutor?.name ?? "tutor"} pada ${slot?.day ?? ""} ${slot?.time ?? ""}.`,
    });
    setBookingTutor(null);
  }

  return (
    <div className="space-y-6">
      <Card className="rounded-lg border-slate-200 shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Search className="size-5 text-blue-600" />
            Tapisan tutor
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <FilterSelect label="Subjek" value={subject} onChange={setSubject} values={subjects} />
          <FilterSelect label="Negeri" value={state} onChange={setState} values={states} />
          <FilterSelect label="Tahap" value={level} onChange={setLevel} values={levels} />
          <FilterSelect label="Kurikulum" value={curriculum} onChange={setCurriculum} values={curriculums} />
          <FilterSelect label="Mod kelas" value={mode} onChange={setMode} values={modes} />
          <FilterSelect label="Jantina tutor" value={gender} onChange={setGender} values={["Perempuan", "Lelaki"]} />

          <div className="space-y-2">
            <Label htmlFor="price">Harga maksimum sejam</Label>
            <Input id="price" type="number" min={30} max={200} value={maxPrice} onChange={(event) => setMaxPrice(Number(event.target.value))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="score">Professional Score minimum</Label>
            <Input id="score" type="number" min={0} max={100} value={minScore} onChange={(event) => setMinScore(Number(event.target.value))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rating">Customer Rating minimum</Label>
            <Input id="rating" type="number" min={0} max={5} step={0.1} value={minRating} onChange={(event) => setMinRating(Number(event.target.value))} />
          </div>
          <label className="flex h-10 items-center gap-2 rounded-md border border-slate-200 px-3 text-sm">
            <Checkbox checked={availableOnly} onCheckedChange={(value) => setAvailableOnly(Boolean(value))} />
            Slot tersedia sahaja
          </label>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-slate-500">Keputusan</p>
          <h2 className="text-2xl font-semibold text-slate-950">{filteredTutors.length} tutor sepadan</h2>
        </div>
        <Button variant="outline" onClick={() => setCompareIds([])} disabled={compareIds.length === 0}>
          <GitCompare className="size-4" />
          Kosongkan perbandingan
        </Button>
      </div>

      {compareTutors.length ? <ComparePanel tutors={compareTutors} /> : null}

      <div className="grid gap-4 lg:grid-cols-2">
        {filteredTutors.map((tutor) => (
          <TutorCard
            key={tutor.id}
            tutor={tutor}
            favourite={favourites.includes(tutor.id)}
            compared={compareIds.includes(tutor.id)}
            onFavourite={() => toggleFavourite(tutor.id)}
            onCompare={() => toggleCompare(tutor.id)}
            onBook={() => openBookingDialog(tutor)}
          />
        ))}
      </div>

      {filteredTutors.length === 0 ? (
        <Card className="rounded-lg border-dashed border-slate-300 shadow-none">
          <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
            <Search className="size-10 text-slate-400" />
            <div>
              <h3 className="font-semibold text-slate-950">Tiada tutor sepadan</h3>
              <p className="mt-1 text-sm text-slate-500">Longgarkan tapisan harga, lokasi atau slot tersedia.</p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Dialog open={Boolean(bookingTutor)} onOpenChange={(open) => !open && setBookingTutor(null)}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Tempah kelas dengan {bookingTutor?.name}</DialogTitle>
            <DialogDescription>Payment gateway sebenar digantikan dengan placeholder untuk Fasa 1.</DialogDescription>
          </DialogHeader>

          {bookingTutor ? (
            <form onSubmit={form.handleSubmit(onBookingSubmit)} className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Anak</Label>
                  <Select
                    value={selectedStudentId}
                    onValueChange={(value) => {
                      setSelectedStudentId(value);
                      form.setValue("studentId", value, { shouldValidate: true });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.name} - {student.level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Subjek</Label>
                  <Select
                    value={selectedSubject}
                    onValueChange={(value) => {
                      setSelectedSubject(value);
                      form.setValue("subject", value, { shouldValidate: true });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {bookingTutor.subjects.map((item) => (
                        <SelectItem key={item} value={item}>
                          {item}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Mod kelas</Label>
                  <Select
                    value={selectedMode}
                    onValueChange={(value) => {
                      const nextMode = value as ClassMode;
                      setSelectedMode(nextMode);
                      form.setValue("mode", nextMode, { shouldValidate: true });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {bookingTutor.modes.map((item) => (
                        <SelectItem key={item} value={item}>
                          {item}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Slot</Label>
                  <Select
                    value={selectedSlotId}
                    onValueChange={(value) => {
                      setSelectedSlotId(value);
                      form.setValue("slotId", value, { shouldValidate: true });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih slot" />
                    </SelectTrigger>
                    <SelectContent>
                      {bookingTutor.slots.map((slot) => (
                        <SelectItem key={slot.id} value={slot.id} disabled={slot.status !== "Available"}>
                          {slot.day}, {slot.time} - {slot.status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="objective">Objektif pembelajaran</Label>
                <Input id="objective" {...form.register("objective")} />
                {form.formState.errors.objective ? (
                  <p className="text-sm text-red-600">{form.formState.errors.objective.message}</p>
                ) : null}
              </div>

              <Card className="rounded-lg border-blue-100 bg-blue-50 shadow-none">
                <CardContent className="grid gap-2 p-4 text-sm text-blue-950">
                  <div className="flex justify-between gap-4">
                    <span>Sesi percubaan</span>
                    <span className="font-semibold">RM39.00</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span>Struktur payment</span>
                    <span className="font-semibold">Placeholder</span>
                  </div>
                  <Separator className="bg-blue-200" />
                  <div className="flex justify-between gap-4 text-base">
                    <span>Jumlah checkout</span>
                    <span className="font-bold">RM39.00</span>
                  </div>
                </CardContent>
              </Card>

              <Button type="submit" className="h-10 bg-blue-600 text-white hover:bg-blue-700">
                Hantar tempahan
              </Button>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  values,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  values: readonly string[];
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua</SelectItem>
          {values.map((item) => (
            <SelectItem key={item} value={item}>
              {item}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function TutorCard({
  tutor,
  favourite,
  compared,
  onFavourite,
  onCompare,
  onBook,
}: {
  tutor: Tutor;
  favourite: boolean;
  compared: boolean;
  onFavourite: () => void;
  onCompare: () => void;
  onBook: () => void;
}) {
  return (
    <Card className="rounded-lg border-slate-200 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <Avatar className="size-12 rounded-md">
            <AvatarFallback className="rounded-md bg-blue-100 font-semibold text-blue-700">{tutor.initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-lg">{tutor.name}</CardTitle>
              {tutor.verified ? (
                <Badge className="bg-emerald-50 text-emerald-700">
                  <BadgeCheck className="size-3" />
                  Disahkan
                </Badge>
              ) : (
                <Badge variant="outline" className="border-amber-200 text-amber-700">
                  Semakan
                </Badge>
              )}
            </div>
            <p className="mt-1 text-sm text-slate-600">{tutor.title}</p>
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3" />
                {tutor.district}, {tutor.state}
              </span>
              <span>{tutor.distanceKm} km</span>
              <span>{tutor.experienceYears} tahun pengalaman</span>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onFavourite} aria-label="Simpan tutor">
            <Heart className={cn("size-4", favourite && "fill-red-500 text-red-500")} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-600">{tutor.bio}</p>

        <div className="grid grid-cols-3 gap-2">
          <ScoreTile label="Pro Score" value={String(tutor.professionalScore)} tone="blue" />
          <ScoreTile label="Rating" value={tutor.rating ? tutor.rating.toFixed(1) : "Baru"} tone="green" />
          <ScoreTile label="Harga" value={`RM${tutor.price}`} tone="slate" />
        </div>

        <div className="flex flex-wrap gap-2">
          {tutor.subjects.map((item) => (
            <Badge key={item} variant="outline" className="border-blue-200 text-blue-700">
              {item}
            </Badge>
          ))}
          {tutor.badges.slice(0, 2).map((item) => (
            <Badge key={item} variant="secondary" className="bg-emerald-50 text-emerald-700">
              {item}
            </Badge>
          ))}
        </div>

        <div className="grid gap-2">
          {tutor.slots.slice(0, 2).map((slot) => (
            <div key={slot.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm">
              <span className="inline-flex items-center gap-2">
                <CalendarClock className="size-4 text-blue-600" />
                {slot.day}, {slot.time}
              </span>
              <Badge variant="outline" className={statusTone[slot.status]}>
                {slot.status}
              </Badge>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button asChild variant="outline" className="flex-1">
            <Link href={`/tutor/${tutor.id}`}>Profil penuh</Link>
          </Button>
          <Button variant={compared ? "secondary" : "outline"} className="flex-1" onClick={onCompare}>
            <GitCompare className="size-4" />
            {compared ? "Dalam bandingan" : "Banding"}
          </Button>
          <Button className="flex-1 bg-blue-600 text-white hover:bg-blue-700" onClick={onBook} disabled={!tutor.verified}>
            Tempah
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ScoreTile({ label, value, tone }: { label: string; value: string; tone: "blue" | "green" | "slate" }) {
  const toneClass = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-emerald-50 text-emerald-700",
    slate: "bg-slate-100 text-slate-700",
  }[tone];

  return (
    <div className={cn("rounded-md px-3 py-2", toneClass)}>
      <p className="text-xs">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}

function ComparePanel({ tutors: comparedTutors }: { tutors: Tutor[] }) {
  return (
    <Card className="rounded-lg border-blue-200 shadow-none">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <GitCompare className="size-5 text-blue-600" />
          Perbandingan tutor
        </CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kriteria</TableHead>
              {comparedTutors.map((tutor) => (
                <TableHead key={tutor.id}>{tutor.name}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            <CompareRow label="Subjek" values={comparedTutors.map((tutor) => tutor.subjects.join(", "))} />
            <CompareRow label="Harga" values={comparedTutors.map((tutor) => `RM${tutor.price}/jam`)} />
            <CompareRow label="Professional Score" values={comparedTutors.map((tutor) => String(tutor.professionalScore))} />
            <CompareRow label="Customer Rating" values={comparedTutors.map((tutor) => (tutor.rating ? `${tutor.rating} (${tutor.reviewCount})` : "Belum ada"))} />
            <CompareRow label="Respons" values={comparedTutors.map((tutor) => `${tutor.responseMinutes} minit`)} />
            <CompareRow label="Lencana" values={comparedTutors.map((tutor) => tutor.badges.slice(0, 2).join(", "))} />
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function CompareRow({ label, values }: { label: string; values: string[] }) {
  return (
    <TableRow>
      <TableCell className="font-medium text-slate-700">{label}</TableCell>
      {values.map((value, index) => (
        <TableCell key={`${label}-${index}`}>{value}</TableCell>
      ))}
    </TableRow>
  );
}
