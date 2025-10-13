// src/components/Sidebar.tsx
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router'; 
// 🔑 IMPORTACIÓN DE ESTILOS CORREGIDA (usando alias absoluto)
import styles from '@/styles/Sidebar.module.css'; 

interface SidebarProps {
  currentModule: string; // Para saber qué módulo está activo
}

const Sidebar: React.FC<SidebarProps> = ({ currentModule }) => {
  const router = useRouter();

  const menuItems = [
    { name: 'Dashboard', icon: '🏠', path: '/dashboard' },
    { name: 'Clientes', icon: '👥', path: '/clientes' },
    { name: 'Inventario', icon: '📦', path: '/inventario' }, 
    { name: 'Estado de Insumos', icon: '🧴', path: '/insumos' },
    { name: 'Personal', icon: '🧑‍💼', path: '/personal' },
    { name: 'Historial', icon: '📜', path: '/historial' }, 
    { name: 'Configuración', icon: '⚙️', path: '/configuracion' },
  ];

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoSection}>
        <h1>The Gentleman's Cut</h1>
        <p>Panel Administrativo</p>
      </div>

      <nav className={styles.navigation}>
        <ul>
          {menuItems.map((item) => (
            <li key={item.name}>
              {/* 🔑 CÓDIGO <Link> CORREGIDO para Next.js 13+ */}
              <Link 
                href={item.path}
                // Las propiedades de 'a' (como className) se pasan directamente al componente Link
                className={`${styles.navItem} ${router.pathname.startsWith(item.path) ? styles.active : ''}`}
              >
                <span className={styles.icon}>{item.icon}</span>
                <span className={styles.text}>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Sección del usuario */}
      <div className={styles.userSection}>
        <div className={styles.userInfo}>
          {/* Asumiendo que esta información viene del contexto de sesión (Admin: Julio Orozco) */}
          <span className={styles.userAvatar}>A</span> 
          <div>
            <p className={styles.userName}>Administrador</p>
            <p className={styles.userEmail}>admin@barberia.com</p>
          </div>
        </div>
        
        {/* El botón de cerrar sesión también usa el nuevo formato de Link si quieres que navegue */}
        <Link href="/login" className={styles.logoutButton}>
          <span className={styles.icon}>➡️</span>
          <span className={styles.text}>Cerrar Sesión</span>
        </Link>
        
        {/* Si quieres que sea un botón de acción (logout API call), mantenlo como <button> */}
        {/*
        <button className={styles.logoutButton}>
          <span className={styles.icon}>➡️</span>
          <span className={styles.text}>Cerrar Sesión</span>
        </button>
        */}

      </div>
    </aside>
  );
};

export default Sidebar;