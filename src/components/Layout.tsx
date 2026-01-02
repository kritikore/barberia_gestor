// src/components/Layout.tsx
import React, { useState } from 'react';
import { useRouter } from 'next/router'; // 🔑 Importante para redirigir
import Sidebar from './Sidebar'; 
import styles from '@/styles/Sidebar.module.css'; 

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const router = useRouter();
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

    const handleToggle = (expanded: boolean) => {
        setIsSidebarExpanded(expanded);
    };

    // 🔑 FUNCIÓN DE LOGOUT (Esta es la que faltaba o no se pasaba)
    const handleLogout = async () => {
    if(confirm("¿Cerrar sesión?")) {
        try {
            // 1. Limpieza en backend
            await fetch('/api/auth/logout', { method: 'POST' });
            
            // 2. Limpieza de storage manual por seguridad
            localStorage.removeItem('usuario_activo');
            localStorage.clear();

            // 3. REDIRECCIÓN FORZADA (Solución al bloqueo)
            // Usamos window.location en lugar de router.push
            window.location.href = '/login';
            
        } catch (e) {
            // En caso de error, también forzamos la salida limpia
            window.location.href = '/login';
        }
    }
  };
    // Clase para empujar el contenido
    const mainClasses = `${styles.contentShift} ${isSidebarExpanded ? styles.isExpanded : ''}`;

    return (
        <div style={{ display: 'flex', minHeight: '100vh', width: '100%', backgroundColor: 'var(--color-background)' }}>
            
            {/* 1. Sidebar */}
            <Sidebar 
                currentModule={'Dashboard'} 
                onToggle={handleToggle} 
                isExpanded={isSidebarExpanded} 
                onLogout={handleLogout} // 🔑 ¡AQUÍ ESTÁ LA CLAVE! Pasamos la función.
            />

            {/* 2. Contenido Principal */}
            <main className={mainClasses} style={{ flexGrow: 1, padding: '30px' }}>
                {children}
            </main>
        </div>
    );
};

export default Layout;