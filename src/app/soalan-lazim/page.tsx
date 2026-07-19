import type { Metadata } from "next";

import { InfoPage } from "@/components/shared/info-page";

export const metadata: Metadata = { title: "Soalan Lazim" };

export default function Page() {
  return (
    <InfoPage
      eyebrow="FAQ"
      title="Soalan lazim Tutor2U"
      description="Jawapan ringkas untuk ibu bapa, tutor dan admin yang menilai aliran Fasa 1."
      cta={{ href: "/hubungi-kami", label: "Hubungi kami" }}
      items={[
        "Adakah tutor disahkan? Ya, Tutor2U menyimpan status identiti, sijil, kelayakan dan semakan admin.",
        "Bagaimana rating diberikan? Review hanya dibenarkan untuk sesi yang telah selesai.",
        "Bolehkah banding tutor? Ya, ibu bapa boleh membandingkan maksimum tiga tutor.",
        "Adakah jadual mengelakkan double booking? Migration menyediakan unique partial index untuk slot aktif tutor.",
        "Adakah payment gateway sebenar aktif? Fasa 1 menggunakan placeholder tetapi struktur pembayaran tersedia.",
        "Bolehkah sokong English kemudian? Struktur copy dan role label dipisahkan untuk i18n seterusnya.",
      ]}
    />
  );
}
