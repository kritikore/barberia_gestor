// src/pages/login.tsx

import React from 'react';
import Head from 'next/head';
import type { NextPage } from 'next';

const LoginPage: NextPage = () => {
  // Aquí es donde Edgar comenzará a construir el formulario de Login
  return (
    <>
      <Head>
        <title>Acceso al Sistema - Barbería</title>
      </Head>
      
      <div style={{ 
        padding: '50px', 
        textAlign: 'center', 
        maxWidth: '400px', 
        margin: '50px auto',
        border: '1px solid #ccc',
        borderRadius: '8px'
      }}>
        <h2>Inicio de Sesión</h2>
        <p>¡Bienvenido al sistema de gestión de la barbería!</p>
        
        {/* Este es el placeholder para el futuro formulario */}
        <form>
          {/* Aquí irán los campos de usuario y contraseña */}
          <div style={{ margin: '15px 0' }}>
            <input type="text" placeholder="Usuario o Boleta" style={{ padding: '10px', width: '100%' }} />
          </div>
          <div style={{ margin: '15px 0' }}>
            <input type="password" placeholder="Contraseña" style={{ padding: '10px', width: '100%' }} />
          </div>
          <button type="submit" style={{ padding: '10px 20px', background: 'black', color: 'white', border: 'none', cursor: 'pointer' }}>
            Iniciar Sesión
          </button>
        </form>
        
      </div>
    </>
  );
};

export default LoginPage;