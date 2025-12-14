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
        try {
            // 1. Llamar a la API para limpiar cookie (si existe)
            await fetch('/api/auth/logout', { method: 'POST' });
            
            // 2. Redirigir al usuario a la pantalla de Login
            console.log("Cerrando sesión...");
            router.push('/login');
            
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
            // Forzamos la salida aunque falle la API
            router.push('/login');
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