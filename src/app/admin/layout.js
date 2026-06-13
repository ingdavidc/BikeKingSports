import Link from 'next/link';
import styles from './admin.module.css';

export default function AdminLayout({ children }) {
  return (
    <div className={styles.adminContainer}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2>Bike King Admin</h2>
        </div>
        <nav className={styles.sidebarNav}>
          <Link href="/admin" className={styles.navItem}>Dashboard</Link>
          <Link href="/admin/productos" className={styles.navItem}>Productos</Link>
          <Link href="/admin/contenido" className={styles.navItem}>Contenido Web</Link>
          <Link href="/" className={styles.navItemBack}>← Volver a la Tienda</Link>
        </nav>
      </aside>
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
}
