import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
    FaHome, FaUsers, FaBoxOpen, FaFlask,
    FaUserTie, FaScroll, FaCog, FaSignOutAlt,
    FaBars, FaCut ,FaCalendarAlt
} from 'react-icons/fa';
// 🔑 CRÍTICO: Asegúrate que esta ruta sea correcta:
import styles from '../styles/Sidebar.module.css'; // Usé '../styles' en lugar de '@/styles' por si el alias falla

interface SidebarProps {
    onToggle: (isExpanded: boolean) => void;
    isExpanded: boolean;
    currentModule: string; 
    onLogout?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onToggle, isExpanded, onLogout }) => {
    const router = useRouter();

    const toggleSidebar = () => {
        onToggle(!isExpanded);
    };

    const menuItems = [
        { name: 'Dashboard', icon: <FaHome />, path: '/dashboard' },
        { name: 'Citas', icon: <FaCalendarAlt />, path: '/citas' },
        { name: 'Clientes', icon: <FaUsers />, path: '/clientes' },
        { name: 'Inventario', icon: <FaBoxOpen />, path: '/inventario' },
        { name: 'Insumos', icon: <FaFlask />, path: '/insumos' },
        { name: 'Personal', icon: <FaUserTie />, path: '/personal' },
        { name: 'Servicios', icon: <FaCut />, path: '/servicios' },
       // { name: 'Historial', icon: <FaScroll />, path: '/historial' },
        { name: 'Configuración', icon: <FaCog />, path: '/configuracion' },
    ];

    // 🔑 CORRECCIÓN 1: Aplicación de la clase 'isExpanded' con ternario simple.
    // Usamos el `styles` importado para generar las clases correctas.
    const sidebarClasses = `${styles.sidebar} ${isExpanded ? styles.isExpanded : ''}`;

    return (
        // El 'fixed' y el ancho/alto deben estar en el CSS Module, pero se mantiene la estructura.
        <aside className={sidebarClasses}>
            
            {/* -------------------- LOGO Y TOGGLE -------------------- */}
            <div className={styles.logoHeader}>
                <div className={styles.logoContainer}>
                    <FaCut className={styles.logoIcon} />
                    {/* 🔑 CORRECCIÓN 2: Renderiza el texto del logo solo cuando está expandido */}
                    {isExpanded && <span className={styles.logoText}>The Gen</span>} 
                </div>

                {/* 🔑 CORRECCIÓN 3: El botón de colapso DEBE estar dentro del sidebar y visible en ambas vistas, 
                    pero solo el ícono de hamburguesa debe mostrarse cuando está expandido. 
                    El botón es solo para la vista expandida, y se oculta en CSS al colapsar. */}
                <button
                    className={styles.menuToggle}
                    onClick={toggleSidebar}
                    title={isExpanded ? 'Colapsar' : 'Expandir'}
                >
                    <FaBars />
                </button>
            </div>

            {/* -------------------- NAVEGACIÓN -------------------- */}
            <nav className={styles.navigation}>
                {/* 🔑 CORRECCIÓN 4: Usamos una lista no ordenada <ul> para la navegación semántica. */}
                <ul>
                    {menuItems.map((item) => (
                        <li key={item.name} className={styles.navItemContainer}>
                            <Link
                                href={item.path}
                                // 🔑 CRÍTICO: Usa 'router.pathname.startsWith' para manejar subrutas (ej. /clientes/detalle)
                                className={`${styles.navItem} ${router.pathname.startsWith(item.path) ? styles.active : ''}`}
                                title={isExpanded ? '' : item.name}
                            >
                                <span className={styles.icon}>{item.icon}</span>
                                {/* 🔑 CORRECCIÓN 5: Usamos el texto solo si está expandido o siempre y el overflow lo corta */}
                                <span className={styles.text}>{item.name}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* -------------------- SECCIÓN DE USUARIO / LOGOUT -------------------- */}
            <div className={styles.userSection}>
                <div className={`${styles.userInfo} ${isExpanded ? styles.isExpanded : ''}`}>
                    {/* Placeholder de Avatar, debes estilizar userAvatar en Sidebar.module.css */}
                    <div className={styles.userAvatar}>A</div> 
                    <div className={styles.userDetails}>
                        <p className={styles.userName}>Administrador</p>
                        <p className={styles.userEmail}>admin@barberia.com</p>
                    </div>
                </div>
                <button
                    className={styles.logoutButton}
                    onClick={onLogout}
                    title={isExpanded ? '' : 'Cerrar Sesión'}
                >
                    <span className={styles.icon}><FaSignOutAlt /></span>
                    <span className={styles.text}>Cerrar Sesión</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;