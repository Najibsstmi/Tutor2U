import type { Metadata } from "next";

import { InfoPage } from "@/components/shared/info-page";

export const metadata: Metadata = { title: "Hubungi Kami" };

export default function Page() {
  return (
    <InfoPage
      eyebrow="Hubungi"
      title="Pejabat Tutor2U"
      description="Saluran demo untuk pertanyaan ibu bapa, pendaftaran tutor, aduan, pembayaran dan sokongan operasi."
      items={[
        "WhatsApp: +60 12-345 0000",
        "Emel sokongan: hello@tutor2u.test",
        "Waktu operasi: Isnin hingga Jumaat, 9 pagi hingga 6 petang.",
        "Aduan kelas: sertakan nombor tempahan, nama tutor, nama anak dan cadangan penyelesaian.",
      ]}
    />
  );
}
