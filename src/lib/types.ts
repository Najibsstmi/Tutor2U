export type Role = "parent" | "tutor" | "admin";

export type SlotStatus = "Available" | "Temporarily held" | "Booked" | "Unavailable";

export type ClassMode = "Online" | "Fizikal" | "Hibrid";

export type TutorSlot = {
  id: string;
  date: string;
  day: string;
  time: string;
  mode: ClassMode;
  status: SlotStatus;
};

export type ScoreBreakdown = {
  kelulusan: number;
  pengalaman: number;
  kelasSelesai: number;
  ketepatanMasa: number;
  respons: number;
  prestasiMurid: number;
};

export type Tutor = {
  id: string;
  name: string;
  initials: string;
  title: string;
  state: string;
  district: string;
  distanceKm: number;
  subjects: string[];
  levels: string[];
  curriculums: string[];
  languages: string[];
  gender: "Lelaki" | "Perempuan";
  modes: ClassMode[];
  price: number;
  experienceYears: number;
  professionalScore: number;
  rating: number;
  reviewCount: number;
  responseMinutes: number;
  completionRate: number;
  cancellationRate: number;
  badges: string[];
  slots: TutorSlot[];
  scoreBreakdown: ScoreBreakdown;
  bio: string;
  highlight: string;
  verified: boolean;
};

export type Student = {
  id: string;
  name: string;
  level: string;
  curriculum: string;
  school: string;
  focus: string;
};

export type Booking = {
  id: string;
  tutorName: string;
  studentName: string;
  subject: string;
  mode: ClassMode;
  status: string;
  nextSession: string;
  pin: string;
};

export type ReportPoint = {
  label: string;
  markah: number;
  kehadiran?: number;
  jam?: number;
};

export type AdminTutorReview = {
  id: string;
  name: string;
  state: string;
  subject: string;
  status: "Menunggu" | "Perlu pembetulan" | "Diluluskan";
  documents: string[];
  risk: "Rendah" | "Sederhana" | "Tinggi";
};
