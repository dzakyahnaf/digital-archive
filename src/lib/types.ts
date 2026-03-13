export interface Arsip {
  id: string;
  namaFile: string;
  kategori: string;
  tahun: string;
  distrik: string;
  kelurahan: string;
  linkDokumen: string;
  tanggalInput: string;
}

export interface ArsipStats {
  totalDokumen: number;
  dokumenTahunIni: number;
  dokumenINT: number; // Informasi Nilai Tanah
}

export interface ArsipFormData {
  namaFile: string;
  kategori: string;
  tahun: string;
  distrik: string;
  kelurahan: string;
  linkDokumen: string;
}
