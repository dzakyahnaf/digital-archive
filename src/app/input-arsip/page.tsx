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
    linkDokumen: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'distrik') {
      // Reset kelurahan when distrik changes
      setFormData({ ...formData, distrik: value, kelurahan: '' });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        setMessage({ type: 'success', text: 'Arsip berhasil ditambahkan!' });
        setFormData({ namaFile: '', kategori: '', tahun: '', distrik: '', kelurahan: '', linkDokumen: '' });
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
          <p>Tambahkan arsip baru ke dalam sistem</p>
        </div>

        {message && (
          <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}>
            {message.type === 'success' ? '✅' : '❌'} {message.text}
          </div>
        )}

        <div className="form-container">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="namaFile">Nama File</label>
              <input
                id="namaFile"
                name="namaFile"
                type="text"
                placeholder="Masukkan nama file..."
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

            <div className="form-group">
              <label htmlFor="linkDokumen">Link Dokumen</label>
              <input
                id="linkDokumen"
                name="linkDokumen"
                type="url"
                placeholder="https://drive.google.com/..."
                value={formData.linkDokumen}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></div>
                  Menyimpan...
                </>
              ) : (
                <>📥 Simpan Arsip</>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
