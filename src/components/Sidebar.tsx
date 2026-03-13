'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import styles from './sidebar.module.css';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/input-arsip', label: 'Input Arsip', icon: '📝' },
  { href: '/daftar-arsip', label: 'Daftar Arsip', icon: '📁' },
  { href: '/settings', label: 'Settings', icon: '⚙️' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <div className={styles.logoIcon}>📋</div>
        <div className={styles.logoText}>
          <h2>Arsip Digital</h2>
          <span>Management System</span>
        </div>
      </div>

      <nav className={styles.nav}>
        <div className={styles.navLabel}>MENU</div>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.navItem} ${pathname === item.href ? styles.active : ''}`}
          >
            <span className={styles.navIcon}>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className={styles.userSection}>
        {session?.user && (
          <div className={styles.userInfo}>
            {session.user.image && (
              <img
                src={session.user.image}
                alt="avatar"
                className={styles.avatar}
                referrerPolicy="no-referrer"
              />
            )}
            <div className={styles.userDetails}>
              <span className={styles.userName}>{session.user.name}</span>
              <span className={styles.userEmail}>{session.user.email}</span>
            </div>
          </div>
        )}
        <button onClick={() => signOut({ callbackUrl: '/login' })} className={styles.logoutBtn}>
          🚪 Logout
        </button>
      </div>
    </aside>
  );
}
