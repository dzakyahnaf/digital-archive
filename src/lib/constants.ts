export const KATEGORI_DOKUMEN = [
  'Informasi Nilai Tanah',
  'Zona Nilai Tanah',
  'Pengadaan Tanah',
  'Surat Masuk',
  'Surat Keluar',
  'Nota Dinas',
  'Persuratan',
] as const;

export const TAHUN_OPTIONS = ['2024', '2025', '2026'] as const;

export const DISTRIK_KELURAHAN_MAP: Record<string, string[]> = {
  'Kota Waisai': ['Waisai Kota', 'Sapordanco', 'Bonkawir', 'Warmasen'],
  'Waigeo Selatan': ['Wawiyai', 'Saporkren', 'Yenbeser', 'Saonek'],
};

export const DISTRIK_OPTIONS = Object.keys(DISTRIK_KELURAHAN_MAP);

export type KategoriDokumen = (typeof KATEGORI_DOKUMEN)[number];
export type Tahun = (typeof TAHUN_OPTIONS)[number];
