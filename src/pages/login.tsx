import React, { useState } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
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
    const { name, value } = e.target;
    setFormState(prevState => ({
      ...prevState,
      [name]: value,
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
            body: JSON.stringify({ 
                email: formState.email, 
                password: formState.password 
            }) 
        });

        const data = await res.json();

        if (res.ok) {
            localStorage.removeItem('token');
            localStorage.removeItem('barbero_data'); // Limpiamos datos viejos

            localStorage.setItem('token', data.token);

            // Detectar usuario
            const usuario = data.user || data.usuario || data;
            
            // 👇👇👇 NUEVO: GUARDAMOS LOS DATOS DEL USUARIO EN TEXTO PLANO 👇👇👇
            localStorage.setItem('barbero_data', JSON.stringify(usuario)); 
            // 👆👆👆 ESTO ES LA CLAVE PARA QUE NO FALLE 👆👆👆

            const rawRole = usuario.role || usuario.rol || usuario.id_rol;
            const role = String(rawRole).toLowerCase().trim();

            console.log("👤 Guardando sesión de:", usuario.email);

            if (role === 'barbero' || role === '2') {
                router.push('/barbero/dashboard'); 
            } else if (role === 'admin' || role === 'administrador' || role === '1') {
                router.push('/dashboard'); 
            } else {
                setError(`Rol desconocido (${rawRole}).`);
            }

        } else {
            setError(data.message || 'Error al iniciar sesión');
        }
    } catch (err: any) {
        console.error(err);
        setError('Error de conexión con el servidor');
    } finally {
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
        
        <div style={{ marginTop: '25px', textAlign: 'center', color: 'var(--color-label)' }}>
            <p>
                ¿OLVIDASTE TU CONTRASEÑA?{' '}
                <Link 
                    href="/recuperar" 
                    style={{ 
                        color: 'var(--color-accent)', 
                        fontWeight: 'bold', 
                        textDecoration: 'underline',
                        cursor: 'pointer'
                    }}
                >
                    Recupérala aquí
                </Link>
            </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;