'use client';

import { useSession } from 'next-auth/react';
import Sidebar from '@/components/Sidebar';
import { KATEGORI_DOKUMEN, DISTRIK_KELURAHAN_MAP, DISTRIK_OPTIONS, TAHUN_OPTIONS } from '@/lib/constants';

export default function SettingsPage() {
  const { data: session } = useSession();

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <h1>Settings</h1>
          <p>Pengaturan aplikasi dan informasi akun</p>
        </div>

        <div className="settings-card">
          <h3>👤 Informasi Akun</h3>
          <div className="settings-item">
            <span className="label">Nama</span>
            <span className="value">{session?.user?.name || '-'}</span>
          </div>
          <div className="settings-item">
            <span className="label">Email</span>
            <span className="value">{session?.user?.email || '-'}</span>
          </div>
          <div className="settings-item">
            <span className="label">Provider</span>
            <span className="value">Google OAuth</span>
          </div>
        </div>

        <div className="settings-card">
          <h3>🗂️ Kategori Dokumen</h3>
          {KATEGORI_DOKUMEN.map((kat, i) => (
            <div className="settings-item" key={kat}>
              <span className="label">{i + 1}</span>
              <span className="value">{kat}</span>
            </div>
          ))}
        </div>

        <div className="settings-card">
          <h3>📍 Wilayah (Distrik & Kelurahan)</h3>
          {DISTRIK_OPTIONS.map((distrik) => (
            <div key={distrik} style={{ marginBottom: 16 }}>
              <div className="settings-item" style={{ background: 'var(--bg-secondary)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', borderBottom: 'none' }}>
                <span className="label" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Distrik {distrik}</span>
              </div>
              <div style={{ paddingLeft: '24px' }}>
                {DISTRIK_KELURAHAN_MAP[distrik].map((kel) => (
                  <div className="settings-item" key={kel}>
                    <span className="label">Kelurahan/Kampung</span>
                    <span className="value">{kel}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="settings-card">
          <h3>📅 Periode Tahun</h3>
          <div className="settings-item">
            <span className="label">Rentang</span>
            <span className="value">{TAHUN_OPTIONS[0]} – {TAHUN_OPTIONS[TAHUN_OPTIONS.length - 1]}</span>
          </div>
        </div>

        <div className="settings-card">
          <h3>ℹ️ Tentang Aplikasi</h3>
          <div className="settings-item">
            <span className="label">Versi</span>
            <span className="value">1.0.0</span>
          </div>
          <div className="settings-item">
            <span className="label">Framework</span>
            <span className="value">Next.js + Google Apps Script</span>
          </div>
          <div className="settings-item">
            <span className="label">Database</span>
            <span className="value">Google Spreadsheet</span>
          </div>
        </div>
      </main>
    </div>
  );
}
