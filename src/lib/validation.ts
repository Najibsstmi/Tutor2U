import { z } from "zod";

export const roleSchema = z.enum(["parent", "tutor", "admin"]);

export const authSchema = z.object({
  email: z.string().email("Masukkan emel yang sah."),
  password: z.string().min(8, "Kata laluan mesti sekurang-kurangnya 8 aksara."),
  role: roleSchema,
});

export const parentProfileSchema = z.object({
  fullName: z.string().min(2, "Nama diperlukan."),
  phone: z.string().min(8, "Nombor telefon diperlukan."),
  district: z.string().min(2, "Daerah diperlukan."),
  state: z.string().min(2, "Negeri diperlukan."),
});

export const studentProfileSchema = z.object({
  name: z.string().min(2, "Nama anak diperlukan."),
  level: z.string().min(2, "Tahap pendidikan diperlukan."),
  curriculum: z.string().min(2, "Kurikulum diperlukan."),
  focus: z.string().min(8, "Nyatakan fokus pembelajaran."),
});

export const tutorProfileSchema = z.object({
  professionalTitle: z.string().min(4, "Tajuk profesional diperlukan."),
  bio: z.string().min(30, "Bio perlu menerangkan kekuatan tutor."),
  subjects: z.array(z.string()).min(1, "Pilih sekurang-kurangnya satu subjek."),
  hourlyRate: z.coerce.number().min(30, "Kadar minimum ialah RM30 sejam."),
});

export const bookingSchema = z.object({
  studentId: z.string().min(1, "Pilih anak."),
  subject: z.string().min(1, "Pilih subjek."),
  mode: z.enum(["Online", "Fizikal", "Hibrid"]),
  slotId: z.string().min(1, "Pilih slot."),
  objective: z.string().min(12, "Nyatakan objektif pembelajaran."),
});

export const attendanceSchema = z.object({
  pin: z.string().regex(/^\d{4}$/, "PIN kehadiran ialah 4 digit."),
});

export const reportSchema = z.object({
  topics: z.string().min(3, "Topik diperlukan."),
  masteryLevel: z.number().min(1).max(6),
  strengths: z.string().min(6, "Kekuatan diperlukan."),
  weaknesses: z.string().min(6, "Kelemahan diperlukan."),
  recommendation: z.string().min(10, "Cadangan tutor diperlukan."),
});

export const ratingSchema = z.object({
  rating: z.coerce.number().min(1).max(5),
  subjectMastery: z.coerce.number().min(1).max(5),
  explanation: z.coerce.number().min(1).max(5),
  patience: z.coerce.number().min(1).max(5),
  communication: z.coerce.number().min(1).max(5),
  punctuality: z.coerce.number().min(1).max(5),
  preparation: z.coerce.number().min(1).max(5),
  professionalism: z.coerce.number().min(1).max(5),
  effectiveness: z.coerce.number().min(1).max(5),
  reviewText: z.string().min(10, "Tulis ulasan ringkas."),
});
