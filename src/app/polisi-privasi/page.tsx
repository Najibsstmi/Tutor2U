import type { Metadata } from "next";

import { InfoPage } from "@/components/shared/info-page";

export const metadata: Metadata = { title: "Polisi Privasi" };

export default function Page() {
  return (
    <InfoPage
      eyebrow="Privasi"
      title="Polisi privasi Tutor2U"
      description="Polisi demo ini menerangkan jenis data yang disimpan dan kawalan akses yang disediakan dalam Supabase RLS."
      items={[
        "Maklumat akaun disimpan dalam `profiles` dan jadual role khusus untuk parent, tutor atau admin.",
        "Data anak hanya boleh diakses oleh ibu bapa sendiri, tutor yang diberikan kelas, dan admin.",
        "Dokumen tutor disimpan dalam bucket peribadi dan tidak boleh diakses secara umum.",
        "Review hanya boleh dibuat oleh pelanggan yang mempunyai sesi selesai.",
        "Audit log menyimpan tindakan admin untuk semakan operasi dan pematuhan.",
      ]}
    />
  );
}
