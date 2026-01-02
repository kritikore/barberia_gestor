import React, { useState, useEffect } from 'react';
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

const LoginPage: NextPage = () => {
  const router = useRouter();

  // Declaramos los estados primero
  const [formState, setFormState] = useState<LoginFormState>({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ Efecto corregido para usar los nombres de tus variables actuales
 useEffect(() => {
    // Usamos un pequeño delay para asegurar que el navegador de Electron 
    // procese el cambio de estado después de la navegación
    const timer = setTimeout(() => {
      setIsLoading(false);
      setFormState({
        email: '',
        password: '',
      });
      setError(null);
    }, 50);

    localStorage.removeItem('user_session'); 
    localStorage.removeItem('usuario_activo');

    return () => clearTimeout(timer); // Limpieza del timer
  }, []);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormState(prevState => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formState) 
      });

      const data = await res.json();

      if (res.ok) {
        console.log("Login exitoso, datos recibidos:", data.user);

        localStorage.setItem('usuario_activo', JSON.stringify(data.user));

        const guardado = localStorage.getItem('usuario_activo');

        if (guardado) {
          console.log("Sesión guardada correctamente. Redirigiendo...");
          setTimeout(() => {
            if (data.user.role === 'admin') {
              router.push('/dashboard');
            } else {
              router.push('/barbero/dashboard');
            }
          }, 100);
        } else {
          setError("Error al guardar la sesión en el navegador.");
          setIsLoading(false);
        }

      } else {
        setError(data.message || 'Error al iniciar sesión');
        setIsLoading(false);
      }
    } catch (err) {
      console.error(err);
      setError('Error de conexión con el servidor');
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
        <Head>
            <title>Iniciar Sesión</title>
        </Head>
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
              placeholder="dev@gestor.com"
              value={formState.email}
              onChange={handleChange}
              disabled={isLoading} // Bloquea mientras carga
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
              disabled={isLoading} // Bloquea mientras carga
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
        
        <div style={{ marginTop: '25px', textAlign: 'center', color: 'var(--color-label)' }}>
            <p>
                ¿OLVIDASTE TU CONTRASEÑA?{' '}
                <Link 
                    href="/register" 
                    style={{ 
                        color: 'var(--color-accent)', 
                        fontWeight: 'bold', 
                        textDecoration: 'underline',
                        cursor: 'pointer'
                    }}
                >
                    Recuperala aqui
                </Link>
            </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;