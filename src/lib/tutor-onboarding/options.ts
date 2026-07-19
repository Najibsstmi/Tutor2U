export type Option = {
  value: string;
  labelKey: string;
};

export const educationLevelOptions: Option[] = [
  { value: "Primary school", labelKey: "taxonomy.levels.primary" },
  { value: "Secondary school", labelKey: "taxonomy.levels.secondary" },
  { value: "SPM", labelKey: "taxonomy.levels.spm" },
  { value: "STPM", labelKey: "taxonomy.levels.stpm" },
  { value: "Matriculation", labelKey: "taxonomy.levels.matriculation" },
  { value: "IGCSE", labelKey: "taxonomy.levels.igcse" },
  { value: "A-Level", labelKey: "taxonomy.levels.aLevel" },
  { value: "UEC", labelKey: "taxonomy.levels.uec" },
  { value: "Special education", labelKey: "taxonomy.levels.specialEducation" },
];

export const curriculumOptions: Option[] = [
  { value: "KSSR", labelKey: "taxonomy.curriculums.kssr" },
  { value: "KSSM", labelKey: "taxonomy.curriculums.kssm" },
  { value: "IGCSE", labelKey: "taxonomy.curriculums.igcse" },
  { value: "Cambridge", labelKey: "taxonomy.curriculums.cambridge" },
  { value: "UEC", labelKey: "taxonomy.curriculums.uec" },
];

export const subjectOptions: Option[] = [
  { value: "Matematik", labelKey: "taxonomy.subjects.math" },
  { value: "Matematik Tambahan", labelKey: "taxonomy.subjects.addMath" },
  { value: "Sains", labelKey: "taxonomy.subjects.science" },
  { value: "Bahasa Inggeris", labelKey: "taxonomy.subjects.english" },
  { value: "Bahasa Melayu", labelKey: "taxonomy.subjects.malay" },
  { value: "Fizik", labelKey: "taxonomy.subjects.physics" },
  { value: "Kimia", labelKey: "taxonomy.subjects.chemistry" },
  { value: "Quran learning", labelKey: "taxonomy.subjects.quran" },
  { value: "Music", labelKey: "taxonomy.subjects.music" },
  { value: "Art", labelKey: "taxonomy.subjects.art" },
  { value: "Coding", labelKey: "taxonomy.subjects.coding" },
];

export const categoryOptions: Option[] = [
  { value: "STEM", labelKey: "taxonomy.categories.stem" },
  { value: "Robotics", labelKey: "taxonomy.categories.robotics" },
  { value: "Coding", labelKey: "taxonomy.categories.coding" },
  { value: "Languages", labelKey: "taxonomy.categories.languages" },
  { value: "Quran learning", labelKey: "taxonomy.categories.quran" },
  { value: "Music", labelKey: "taxonomy.categories.music" },
  { value: "Art", labelKey: "taxonomy.categories.art" },
  { value: "SPM", labelKey: "taxonomy.categories.spm" },
];

export const stateOptions: Option[] = [
  { value: "Kuala Lumpur", labelKey: "taxonomy.states.kualaLumpur" },
  { value: "Selangor", labelKey: "taxonomy.states.selangor" },
  { value: "Kelantan", labelKey: "taxonomy.states.kelantan" },
  { value: "Perak", labelKey: "taxonomy.states.perak" },
  { value: "Johor", labelKey: "taxonomy.states.johor" },
  { value: "Pulau Pinang", labelKey: "taxonomy.states.penang" },
  { value: "Sabah", labelKey: "taxonomy.states.sabah" },
  { value: "Kedah", labelKey: "taxonomy.states.kedah" },
  { value: "Negeri Sembilan", labelKey: "taxonomy.states.negeriSembilan" },
];
