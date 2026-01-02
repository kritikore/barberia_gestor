// src/components/BarberLayout.tsx
import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { FaSignOutAlt, FaCut } from 'react-icons/fa';

interface BarberLayoutProps {
  children: React.ReactNode;
}

const BarberLayout: React.FC<BarberLayoutProps> = ({ children }) => {
  const router = useRouter();

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

  return (
    <>
      <Head>
        <title>Panel de Barbero</title>
      </Head>
      
      {/* Contenedor transparente para ver el fondo */}
      <div style={{ backgroundColor: 'transparent', color: 'var(--color-text)', minHeight: '100vh', fontFamily: 'Roboto, sans-serif' }}>
        
        {/* 🔑 BARRA SUPERIOR ÚNICA */}
        <nav style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '15px 20px',
            backgroundColor: 'rgba(26, 26, 26, 0.9)', // Fondo semi-transparente para la barra
            borderBottom: '1px solid #444',
            position: 'sticky',
            top: 0,
            zIndex: 100
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--color-accent)', fontWeight: 'bold', fontSize: '1.2em' }}>
                <FaCut />
                <span>Barber Panel</span>
            </div>
            
            <button 
                onClick={handleLogout}
                style={{
                    background: 'transparent',
                    border: '1px solid #DC3545',
                    color: '#DC3545',
                    padding: '8px 15px',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.9em',
                    fontWeight: 'bold',
                    transition: 'all 0.2s'
                }}
            >
                <FaSignOutAlt /> Salir
            </button>
        </nav>

        <main style={{ padding: '30px', paddingBottom: '80px' }}>
          {children}
        </main>
      </div>
    </>
  );
};

export default BarberLayout;