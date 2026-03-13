'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { Arsip } from '@/lib/types';
import { KATEGORI_DOKUMEN, TAHUN_OPTIONS, DISTRIK_OPTIONS, DISTRIK_KELURAHAN_MAP } from '@/lib/constants';

const BADGE_MAP: Record<string, string> = {
  'Informasi Nilai Tanah': 'badge-int',
  'Zona Nilai Tanah': 'badge-znt',
  'Pengadaan Tanah': 'badge-pengadaan',
  'Surat Masuk': 'badge-masuk',
  'Surat Keluar': 'badge-keluar',
  'Nota Dinas': 'badge-nota',
  'Persuratan': 'badge-persuratan',
};

export default function DaftarArsipPage() {
  const [arsipList, setArsipList] = useState<Arsip[]>([]);
  const [filtered, setFiltered] = useState<Arsip[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const [filterKategori, setFilterKategori] = useState('');
  const [filterTahun, setFilterTahun] = useState('');
  const [filterDistrik, setFilterDistrik] = useState('');
  const [filterKelurahan, setFilterKelurahan] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchArsip();
  }, []);

  useEffect(() => {
    let result = arsipList;

    if (filterKategori) {
      result = result.filter((a) => a.kategori === filterKategori);
    }
    if (filterTahun) {
      result = result.filter((a) => a.tahun === filterTahun);
    }
    if (filterDistrik) {
      result = result.filter((a) => a.distrik === filterDistrik);
    }
    if (filterKelurahan) {
      result = result.filter((a) => a.kelurahan === filterKelurahan);
    }
    if (searchQuery) {
      result = result.filter((a) =>
        a.namaFile.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFiltered(result);
  }, [arsipList, filterKategori, filterTahun, filterDistrik, filterKelurahan, searchQuery]);

  const fetchArsip = async () => {
    try {
      const res = await fetch('/api/arsip');
      const data = await res.json();
      setArsipList(data.data || []);
    } catch (error) {
      console.error('Failed to fetch arsip:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus arsip ini?')) return;

    setDeleting(id);
    try {
      const res = await fetch(`/api/arsip/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setArsipList(arsipList.filter((a) => a.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete arsip:', error);
    } finally {
      setDeleting(null);
    }
  };

  const clearFilters = () => {
    setFilterKategori('');
    setFilterTahun('');
    setFilterDistrik('');
    setFilterKelurahan('');
    setSearchQuery('');
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <h1>Daftar Arsip</h1>
          <p>Kelola dan telusuri arsip digital Anda</p>
        </div>

        <div className="table-container">
          <div className="table-toolbar">
            <input
              type="text"
              placeholder="🔍 Cari nama file..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ flex: 1, minWidth: 200 }}
            />
            <select value={filterKategori} onChange={(e) => setFilterKategori(e.target.value)}>
              <option value="">Semua Kategori</option>
              {KATEGORI_DOKUMEN.map((kat) => (
                <option key={kat} value={kat}>{kat}</option>
              ))}
            </select>
            <select value={filterTahun} onChange={(e) => setFilterTahun(e.target.value)}>
              <option value="">Semua Tahun</option>
              {TAHUN_OPTIONS.map((thn) => (
                <option key={thn} value={thn}>{thn}</option>
              ))}
            </select>
            <select value={filterDistrik} onChange={(e) => {
              setFilterDistrik(e.target.value);
              setFilterKelurahan(''); // Reset kelurahan filter when distrik changes
            }}>
              <option value="">Semua Distrik</option>
              {DISTRIK_OPTIONS.map((distrik) => (
                <option key={distrik} value={distrik}>{distrik}</option>
              ))}
            </select>
            <select 
              value={filterKelurahan} 
              onChange={(e) => setFilterKelurahan(e.target.value)}
              disabled={!filterDistrik}
            >
              <option value="">Semua Kelurahan/Kampung</option>
              {filterDistrik && DISTRIK_KELURAHAN_MAP[filterDistrik].map((kel) => (
                <option key={kel} value={kel}>{kel}</option>
              ))}
            </select>
            {(filterKategori || filterTahun || filterDistrik || filterKelurahan || searchQuery) && (
              <button onClick={clearFilters} className="btn-link" style={{ whiteSpace: 'nowrap' }}>
                ✕ Reset Filter
              </button>
            )}
          </div>

          {loading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.4 }}>📂</div>
              <h3>Tidak ada arsip ditemukan</h3>
              <p>
                {arsipList.length === 0
                  ? 'Belum ada arsip. Tambah arsip baru di halaman Input Arsip.'
                  : 'Tidak ada arsip yang sesuai dengan filter. Coba ubah filter Anda.'}
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Nama File</th>
                    <th>Kategori</th>
                    <th>Tahun</th>
                    <th>Distrik</th>
                    <th>Kelurahan/Kampung</th>
                    <th>Tanggal Input</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((arsip, index) => (
                    <tr key={arsip.id}>
                      <td>{index + 1}</td>
                      <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{arsip.namaFile}</td>
                      <td>
                        <span className={`kategori-badge ${BADGE_MAP[arsip.kategori] || ''}`}>
                          {arsip.kategori}
                        </span>
                      </td>
                      <td>{arsip.tahun}</td>
                      <td>{arsip.distrik}</td>
                      <td>{arsip.kelurahan}</td>
                      <td>
                        {arsip.tanggalInput
                          ? new Date(arsip.tanggalInput).toLocaleDateString('id-ID', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })
                          : '-'}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 8 }}>
                          {arsip.linkDokumen && (
                            <a
                              href={arsip.linkDokumen}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-link"
                            >
                              📄 Buka
                            </a>
                          )}
                          <button
                            onClick={() => handleDelete(arsip.id)}
                            className="btn-danger"
                            disabled={deleting === arsip.id}
                          >
                            {deleting === arsip.id ? '...' : '🗑️ Hapus'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {filtered.length > 0 && (
            <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border-color)', fontSize: 13, color: 'var(--text-muted)' }}>
              Menampilkan {filtered.length} dari {arsipList.length} arsip
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
