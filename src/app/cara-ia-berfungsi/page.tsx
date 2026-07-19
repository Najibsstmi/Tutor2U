import type { Metadata } from "next";

import { InfoPage } from "@/components/shared/info-page";

export const metadata: Metadata = { title: "Cara Ia Berfungsi" };

export default function Page() {
  return (
    <InfoPage
      eyebrow="Aliran Tutor2U"
      title="Dari carian tutor ke pemantauan akademik"
      description="Tutor2U menggabungkan marketplace tutor dengan pemantauan pembelajaran supaya ibu bapa boleh membuat keputusan berdasarkan data."
      cta={{ href: "/cari-tutor", label: "Cari tutor" }}
      items={[
        "Ibu bapa menambah profil anak dan memilih objektif pembelajaran.",
        "Carian tutor menggunakan lokasi, subjek, tahap, kurikulum, rating, Professional Score dan slot tersedia.",
        "Checkout Fasa 1 menggunakan payment placeholder tetapi struktur data bersedia untuk gateway sebenar.",
        "Tutor mengesahkan kelas, merekod kehadiran, menghantar laporan dan memberi tugasan.",
        "Ibu bapa melihat graf markah, jam kelas, kehadiran, tugasan dan penguasaan topik.",
        "Admin memantau tutor, pelanggan, tempahan, aduan, pembayaran dan audit log.",
      ]}
    />
  );
}
