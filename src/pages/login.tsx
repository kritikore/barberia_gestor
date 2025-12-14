// src/pages/login.tsx

import React, { useState, FormEvent } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link'; 
import { useRouter } from 'next/router';
import styles from '@/styles/Login.module.css'; 

// Definición de la interfaz del estado
interface LoginFormState {
  email: string;
  password: string;
}

// Definición del componente
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
        router.push('/dashboard'); 
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

      // Redirección basada en el rol
      // 🔑 NUEVO: Guardar datos del usuario en localStorage para usarlos después
            localStorage.setItem('userProfile', JSON.stringify(data.user));

            // Redirección
            if (data.user.role === 'admin') {
                router.push('/dashboard');
            } else {
                router.push('/barbero/dashboard');
            }
      
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox}>
        
        <h1>💈 Barbería Gestor</h1>
        <h2>Panel de Control</h2>
        
        <form onSubmit={handleSubmit}>
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
        
        {/* Enlace a la página de registro */}
        <div style={{ marginTop: '25px', textAlign: 'center', color: 'var(--color-label)' }}>
            <p>
                ¿Eres un nuevo empleado?{' '}
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

// 🔑 ESTA LÍNEA ES CRÍTICA PARA SOLUCIONAR TU ERROR:
export default LoginPage;