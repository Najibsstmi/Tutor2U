import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { ClassMode, SlotStatus, Tutor } from "@/lib/types";

type ApprovedTutorRow = {
  tutor_profile_id: string;
  display_name: string | null;
  professional_title: string | null;
  bio: string | null;
  gender?: string | null;
  teaching_experience_years?: number | null;
  hourly_rate_cents?: number | null;
  response_minutes?: number | null;
  completion_rate?: number | null;
  cancellation_rate?: number | null;
  can_teach_online?: boolean | null;
  can_teach_physical?: boolean | null;
  base_state: string | null;
  base_district: string | null;
  approved_at: string | null;
  professional_score?: number | null;
  customer_rating?: number | null;
  review_count?: number | null;
  subjects?: string[] | null;
  education_levels?: string[] | null;
  curriculums?: string[] | null;
  badges?: string[] | null;
};

export type MarketplaceTutorSource = "supabase";

export type MarketplaceTutorResult = {
  tutors: Tutor[];
  source: MarketplaceTutorSource;
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "T2";
}

function toTutor(row: ApprovedTutorRow): Tutor {
  const name = row.display_name ?? "Tutor Tutor2U";
  const modes: ClassMode[] = [];

  if (row.can_teach_online !== false) {
    modes.push("Online");
  }

  if (row.can_teach_physical) {
    modes.push("Fizikal");
  }

  return {
    id: row.tutor_profile_id,
    name,
    initials: initials(name),
    title: row.professional_title ?? "Tutor disahkan Tutor2U",
    state: row.base_state ?? "Malaysia",
    district: row.base_district ?? "Online",
    distanceKm: 0,
    subjects: row.subjects ?? [],
    levels: row.education_levels ?? [],
    curriculums: row.curriculums ?? [],
    languages: ["Bahasa Melayu", "English"],
    gender: row.gender === "male" ? "Lelaki" : "Perempuan",
    modes: modes.length ? modes : ["Online"],
    price: Math.round((row.hourly_rate_cents ?? 0) / 100),
    experienceYears: row.teaching_experience_years ?? 0,
    professionalScore: row.professional_score ?? 0,
    rating: row.customer_rating ?? 0,
    reviewCount: row.review_count ?? 0,
    responseMinutes: row.response_minutes ?? 1440,
    completionRate: Number(row.completion_rate ?? 0),
    cancellationRate: Number(row.cancellation_rate ?? 0),
    badges: row.badges?.length ? row.badges : ["Identiti Disahkan"],
    slots: [
      {
        id: `${row.tutor_profile_id}-availability`,
        date: "",
        day: "Hubungi tutor",
        time: "Jadual akan dipaparkan selepas availability disambungkan",
        mode: "Online",
        status: "Available" satisfies SlotStatus,
      },
    ],
    scoreBreakdown: {
      kelulusan: row.professional_score ?? 0,
      pengalaman: row.professional_score ?? 0,
      kelasSelesai: row.professional_score ?? 0,
      ketepatanMasa: row.professional_score ?? 0,
      respons: row.professional_score ?? 0,
      prestasiMurid: row.professional_score ?? 0,
    },
    bio: row.bio ?? "Profil tutor telah diluluskan oleh admin Tutor2U.",
    highlight: row.approved_at ? `Diluluskan pada ${new Date(row.approved_at).toLocaleDateString("ms-MY")}` : "Tutor diluluskan.",
    verified: true,
  };
}

export async function getMarketplaceTutors(): Promise<MarketplaceTutorResult> {
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return { tutors: [], source: "supabase" };
  }

  const { data, error } = await supabase
    .from("approved_tutor_public_profiles")
    .select("*")
    .order("approved_at", { ascending: false })
    .limit(100);

  if (error || !data?.length) {
    return { tutors: [], source: "supabase" };
  }

  return { tutors: (data as ApprovedTutorRow[]).map(toTutor), source: "supabase" };
}

export async function getMarketplaceTutorById(id: string): Promise<Tutor | null> {
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const { data } = await supabase
    .from("approved_tutor_public_profiles")
    .select("*")
    .eq("tutor_profile_id", id)
    .maybeSingle();

  return data ? toTutor(data as ApprovedTutorRow) : null;
}
