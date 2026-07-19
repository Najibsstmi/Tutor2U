import type { Metadata } from "next";

import { InfoPage } from "@/components/shared/info-page";

export const metadata: Metadata = { title: "Kategori Tutor" };

export default function Page() {
  return (
    <InfoPage
      eyebrow="Kategori"
      title="Tutor mengikut subjek, tahap dan kurikulum"
      description="Kategori awal disusun untuk KSSR, KSSM, SPM dan IGCSE dengan ruang untuk perluasan ke vokasional dan pra-universiti."
      cta={{ href: "/cari-tutor", label: "Bandingkan tutor" }}
      items={[
        "STEM: Matematik, Matematik Tambahan, Sains, Fizik dan Kimia.",
        "Bahasa: Bahasa Melayu, Bahasa Inggeris dan sokongan dwibahasa.",
        "Kemanusiaan: Sejarah dan kemahiran esei.",
        "Tahap rendah: Tahun 1-3 dan Tahun 4-6.",
        "Tahap menengah: Tingkatan 1-3 dan SPM.",
        "Kurikulum antarabangsa: IGCSE dengan tutor English-first.",
      ]}
    />
  );
}
