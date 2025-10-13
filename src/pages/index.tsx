// src/pages/index.tsx

import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import type { NextPage } from 'next';

const Home: NextPage = () => {
  const router = useRouter();

  // useEffect se ejecuta una vez que el componente se monta
  React.useEffect(() => {
    // Redirige al usuario a la ruta /login
    router.push('/login');
  }, [router]); 
  // [router] como dependencia asegura que useEffect se ejecute cuando router esté disponible

  return (
    <>
      {/* Configuración de metadatos de la página */}
      <Head>
        <title>Barberia - Sistema de Gestión</title>
        <meta name="description" content="Cargando sistema de gestión integral de barbería..." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Contenido que se muestra brevemente antes de redirigir */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column'
      }}>
        <h1>Cargando Sistema...</h1>
        <p>Redirigiendo a la pantalla de inicio de sesión...</p>
      </div>
    </>
  );
};

export default Home;