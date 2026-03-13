'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { ArsipStats } from '@/lib/types';

export default function DashboardPage() {
  const [stats, setStats] = useState<ArsipStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/arsip/stats');
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      setStats({ totalDokumen: 0, dokumenTahunIni: 0, dokumenINT: 0 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <h1>Dashboard</h1>
          <p>Ringkasan data arsip digital</p>
        </div>

        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        ) : (
          <div className="stats-grid">
            <div className="stats-card blue">
              <div className="stats-icon blue">📄</div>
              <div className="stats-info">
                <h3>{stats?.totalDokumen ?? 0}</h3>
                <p>Total Dokumen</p>
              </div>
            </div>

            <div className="stats-card green">
              <div className="stats-icon green">📅</div>
              <div className="stats-info">
                <h3>{stats?.dokumenTahunIni ?? 0}</h3>
                <p>Dokumen Tahun Ini</p>
              </div>
            </div>

            <div className="stats-card purple">
              <div className="stats-icon purple">🏠</div>
              <div className="stats-info">
                <h3>{stats?.dokumenINT ?? 0}</h3>
                <p>Informasi Nilai Tanah</p>
              </div>
            </div>
          </div>
        )}

        <div className="stats-card" style={{ marginTop: 20, padding: 28 }}>
          <div style={{ width: '100%' }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: 'var(--text-primary)' }}>
              Informasi Sistem
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>Sistem</p>
                <p style={{ fontSize: 15, fontWeight: 500 }}>Arsip Digital v1.0</p>
              </div>
              <div>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>Database</p>
                <p style={{ fontSize: 15, fontWeight: 500 }}>Google Spreadsheet</p>
              </div>
              <div>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>Wilayah</p>
                <p style={{ fontSize: 15, fontWeight: 500 }}>2 Distrik</p>
              </div>
              <div>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>Tahun Aktif</p>
                <p style={{ fontSize: 15, fontWeight: 500 }}>2024 – 2026</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
