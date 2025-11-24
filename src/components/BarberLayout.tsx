// src/components/BarberLayout.tsx
import React from 'react';
import Head from 'next/head';
// (Opcional: Podrías crear un BarberSidebar.tsx si el barbero necesita un menú más complejo)

interface BarberLayoutProps {
  children: React.ReactNode;
}

const BarberLayout: React.FC<BarberLayoutProps> = ({ children }) => {
  // Por ahora, es un layout simple que solo da el fondo oscuro
  // y la tipografía Roboto.
  return (
    <>
      <Head>
        <title>Panel de Barbero - The Gentleman's Cut</title>
      </Head>
      <div style={{ 
          backgroundColor: 'var(--color-background)', 
          color: 'var(--color-text)', 
          minHeight: '100vh',
          fontFamily: 'Roboto, sans-serif' 
      }}>
        <main style={{ padding: '30px' }}>
          {children}
        </main>
      </div>
    </>
  );
};

export default BarberLayout;