import type { Metadata } from "next";

import { InfoPage } from "@/components/shared/info-page";

export const metadata: Metadata = { title: "Tentang Kami" };

export default function Page() {
  return (
    <InfoPage
      eyebrow="Tentang Tutor2U"
      title="Platform tutor yang mengutamakan kepercayaan dan perkembangan anak"
      description="Tutor2U dibina untuk keluarga Malaysia yang mahukan tutor disahkan, jadual jelas, laporan pembelajaran dan pengurusan pejabat yang boleh dipercayai."
      items={[
        "Kepercayaan: semakan identiti, sijil dan rekod tutor sebelum tutor dipaparkan.",
        "Ketelusan: Professional Score dipisahkan daripada Customer Rating.",
        "Perkembangan: laporan kelas, tugasan, markah dan penguasaan topik dipantau berterusan.",
        "Operasi: admin memantau aduan, tutor pengganti, bayaran dan audit log.",
      ]}
    />
  );
}
