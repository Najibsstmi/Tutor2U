import type { Metadata } from "next";

import { TutorMarketplace } from "@/components/marketplace/tutor-marketplace";

export const metadata: Metadata = {
  title: "Cari Tutor",
};

export default function CariTutorPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <p className="text-sm font-medium text-blue-700">Cari tutor</p>
        <h1 className="mt-1 text-3xl font-semibold text-slate-950">Bandingkan tutor berdasarkan data sebenar</h1>
        <p className="mt-3 max-w-3xl text-slate-600">
          Tapis mengikut negeri, daerah, jarak, subjek, tahap, kurikulum, bahasa, jantina, mod kelas, harga, pengalaman, skor dan slot tersedia.
        </p>
      </div>
      <TutorMarketplace />
    </main>
  );
}
