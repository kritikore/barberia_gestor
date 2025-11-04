// src/pages/login.tsx

import React, { useState, FormEvent } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link'; // 🔑 Importar Link
import { useRouter } from 'next/router';
// 🔑 Asegúrate de que la ruta de estilos sea correcta (usando @/ o ../)
import styles from '@/styles/Login.module.css'; 

interface LoginFormState {
  email: string;
  password: string;
}

const LoginPage: NextPage = () => {
  const router = useRouter(); 
  
  const [formState, setFormState] = useState<LoginFormState>({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormState(prevState => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Acceso de desarrollo temporal
    if (formState.email === 'dev@gestor.com' && formState.password === 'access') {
        console.log("Acceso de Desarrollo concedido.");
        router.push('/dashboard'); // O '/inventario'
        setIsLoading(false);
        return; 
    }

    try {
      // Llamada a la API de autenticación (Login)
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formState),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Error de autenticación');
      }

      // Redirección basada en rol
      if (data.user.role === 'admin') {
        router.push('/dashboard');
      } else {
        router.push('/barbero/bitacora'); // O la ruta del barbero
      }
      
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false); // Asegúrate de parar la carga en caso de error
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox}>
        
        <h1>💈 Barbería Gestor</h1>
        <h2>Panel de Control</h2>
        
        <form onSubmit={handleSubmit}>
          {/* ... (Campos de email y password) ... */}
          <div className={styles.formGroup}>
            <label htmlFor="email">Usuario:</label>
            <input
              className={styles.loginInput}
              id="email"
              name="email"
              type="text"
              placeholder="administrador o usuario"
              value={formState.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="password">Contraseña:</label>
            <input
              className={styles.loginInput}
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={formState.password}
              onChange={handleChange}
              required
            />
          </div>

          {error && <p className={styles.errorMessage}>{error}</p>}

          <button 
            type="submit" 
            className={styles.loginButton} 
            disabled={isLoading}
          >
            {isLoading ? 'Accediendo...' : 'Acceder'}
          </button>
        </form>
        
        {/* 🔑 CORRECCIÓN: Enlace a la página de registro */}
        <div style={{ marginTop: '25px', textAlign: 'center', color: 'var(--color-label)' }}>
            <p>
                ¿Eres un nuevo empleado?{' '}
                {/* 1. Se eliminó la etiqueta <a> interior.
                  2. 'style' se pasa directamente al componente <Link>.
                */}
                <Link 
                    href="/register" 
                    style={{ 
                        color: 'var(--color-accent)', 
                        fontWeight: 'bold', 
                        textDecoration: 'underline',
                        cursor: 'pointer'
                    }}
                >
                    Regístrate aquí
                </Link>
            </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;