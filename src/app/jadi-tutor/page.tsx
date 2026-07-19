import type { Metadata } from "next";

import { InfoPage } from "@/components/shared/info-page";

export const metadata: Metadata = { title: "Jadi Tutor" };

export default function Page() {
  return (
    <InfoPage
      eyebrow="Tutor"
      title="Bina profil profesional dan urus kelas dengan lebih tersusun"
      description="Tutor2U membantu tutor mengurus pendaftaran, dokumen, jadual, murid, laporan, tugasan, rating dan pendapatan."
      cta={{ href: "/daftar", label: "Daftar sebagai tutor" }}
      items={[
        "Pendaftaran berperingkat untuk profil profesional, gambar, kad pengenalan dan sijil.",
        "Tambah kelulusan, pengalaman, kepakaran, subjek, tahap pendidikan dan kawasan perkhidmatan.",
        "Tetapkan kadar harga serta jadual mingguan untuk online, fizikal atau kedua-duanya.",
        "Terima atau tolak permintaan kelas dengan status yang jelas.",
        "Mulakan kelas, rekod kehadiran, laporan topik, penguasaan, tugasan dan markah.",
        "Pantau rating, ulasan, pendapatan, komisen dan status payout.",
      ]}
    />
  );
}
