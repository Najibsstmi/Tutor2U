import type { Metadata } from "next";

import { InfoPage } from "@/components/shared/info-page";

export const metadata: Metadata = { title: "Terma Perkhidmatan" };

export default function Page() {
  return (
    <InfoPage
      eyebrow="Terma"
      title="Terma perkhidmatan Tutor2U"
      description="Terma demo ini menyatakan struktur produk Fasa 1 dan perlu disemak penasihat undang-undang sebelum digunakan secara komersial."
      items={[
        "Ibu bapa bertanggungjawab memastikan maklumat anak, objektif pembelajaran dan alamat kelas adalah tepat.",
        "Tutor perlu memberikan dokumen sah, mematuhi jadual, merekod kehadiran dan menghantar laporan kelas.",
        "Tutor2U boleh menggantung atau menyekat tutor jika terdapat isu dokumen, disiplin, aduan berulang atau keselamatan.",
        "Payment gateway sebenar belum diaktifkan dalam Fasa 1; transaksi demo tidak mengenakan bayaran.",
        "Review mesti berdasarkan sesi selesai dan boleh disemak jika melanggar garis panduan komuniti.",
      ]}
    />
  );
}
