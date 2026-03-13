'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { KATEGORI_DOKUMEN, TAHUN_OPTIONS, DISTRIK_KELURAHAN_MAP, DISTRIK_OPTIONS } from '@/lib/constants';

export default function InputArsipPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [formData, setFormData] = useState({
    namaFile: '',
    kategori: '',
    tahun: '',
    distrik: '',
    kelurahan: '',
    fileBase64: '',
    fileName: '',
    mimeType: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'distrik') {
      setFormData({ ...formData, distrik: value, kelurahan: '' });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setFormData({ ...formData, fileBase64: '', fileName: '', mimeType: '' });
      return;
    }

    // Batas ukuran file 3MB untuk Apps Script payload safety
    if (file.size > 3 * 1024 * 1024) {
      alert("Ukuran file maksimal 3MB. Mohon pilih file yang lebih kecil.");
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setFormData({
        ...formData,
        fileBase64: base64String,
        fileName: file.name,
        mimeType: file.type || 'application/octet-stream',
        // Auto-fill namaFile jika masih kosong
        namaFile: formData.namaFile || file.name.split('.')[0],
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fileBase64) {
      setMessage({ type: 'error', text: 'Pilih file dokumen terlebih dahulu' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/arsip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Arsip berhasil diunggah dan disimpan!' });
        setFormData({ 
          namaFile: '', 
          kategori: '', 
          tahun: '', 
          distrik: '', 
          kelurahan: '', 
          fileBase64: '', 
          fileName: '', 
          mimeType: '' 
        });
        // Reset input file (optional via ref, but simpler way is below)
        const fileInput = document.getElementById('fileUpload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        setMessage({ type: 'error', text: data.error || 'Gagal menambahkan arsip' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Terjadi kesalahan saat menambahkan arsip' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <h1>Input Arsip</h1>
          <p>Tambahkan arsip baru ke dalam sistem dan Drive</p>
        </div>

        {message && (
          <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}>
            {message.type === 'success' ? '✅' : '❌'} {message.text}
          </div>
        )}

        <div className="form-container">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="fileUpload">Upload Dokumen (Max 3MB)</label>
              <input
                id="fileUpload"
                name="fileUpload"
                type="file"
                onChange={handleFileChange}
                required
                style={{
                   padding: '10px 14px',
                   background: 'var(--bg-input)',
                   border: '1px dashed var(--accent-blue)',
                   cursor: 'pointer'
                }}
              />
              <p style={{fontSize: 12, color: 'var(--text-muted)', marginTop: 8}}>
                File akan otomatis diupload ke Google Drive.
              </p>
            </div>

            <div className="form-group">
              <label htmlFor="namaFile">Nama File</label>
              <input
                id="namaFile"
                name="namaFile"
                type="text"
                placeholder="Otomatis terisi dari nama file..."
                value={formData.namaFile}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="kategori">Kategori Dokumen</label>
                <select
                  id="kategori"
                  name="kategori"
                  value={formData.kategori}
                  onChange={handleChange}
                  required
                >
                  <option value="">Pilih Kategori</option>
                  {KATEGORI_DOKUMEN.map((kat) => (
                    <option key={kat} value={kat}>{kat}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="tahun">Tahun</label>
                <select
                  id="tahun"
                  name="tahun"
                  value={formData.tahun}
                  onChange={handleChange}
                  required
                >
                  <option value="">Pilih Tahun</option>
                  {TAHUN_OPTIONS.map((thn) => (
                    <option key={thn} value={thn}>{thn}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="distrik">Distrik</label>
                <select
                  id="distrik"
                  name="distrik"
                  value={formData.distrik}
                  onChange={handleChange}
                  required
                >
                  <option value="">Pilih Distrik</option>
                  {DISTRIK_OPTIONS.map((distrik) => (
                    <option key={distrik} value={distrik}>{distrik}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="kelurahan">Kelurahan/Kampung</label>
                <select
                  id="kelurahan"
                  name="kelurahan"
                  value={formData.kelurahan}
                  onChange={handleChange}
                  required
                  disabled={!formData.distrik}
                >
                  <option value="">Pilih Kelurahan/Kampung</option>
                  {formData.distrik && DISTRIK_KELURAHAN_MAP[formData.distrik].map((kel) => (
                    <option key={kel} value={kel}>{kel}</option>
                  ))}
                </select>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{width: '100%', justifyContent: 'center'}}>
              {loading ? (
                <>
                  <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></div>
                  Mengunggah File & Menyimpan...
                </>
              ) : (
                <>📥 Unggah dan Simpan Arsip</>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
