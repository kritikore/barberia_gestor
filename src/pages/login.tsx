// src/pages/login.tsx

import { useState, FormEvent } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router'; // Para la redirección después del login
import styles from '../styles/Login.module.css'; // <--- Importación del CSS Module

// Define las interfaces para asegurar que los datos del formulario son correctos
interface LoginFormState {
  email: string;
  password: string;
}

const LoginPage: NextPage = () => {
  // Inicialización del hook de enrutamiento
  const router = useRouter(); 
  
  // Estado del formulario y la UI
  const [formState, setFormState] = useState<LoginFormState>({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Maneja los cambios en los inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Maneja el envío del formulario y llama al API de Yovany
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // ----------------------------------------------------
      // LLAMADA A LA API DE AUTENTICACIÓN (ENDPOINT DE YOVANY)
      // ----------------------------------------------------
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formState),
      });

      const data = await response.json();

      if (!response.ok) {
        // Error 401: Credenciales inválidas
        throw new Error(data.message || 'Error de conexión con el servidor.');
      }

      // Si es exitoso, redireccionar según el rol (Administrador o Barbero)
      if (data.user.role === 'admin') {
        router.push('/dashboard'); // Redirigir al dashboard de administrador
      } else if (data.user.role === 'barbero') {
        router.push('/barbero/bitacora'); // Redirigir a la vista de Barbero
      } else {
         throw new Error('Rol de usuario no reconocido.');
      }
      
    } catch (err: any) {
      // Muestra el error de autenticación al usuario
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Usa la clase de contenedor principal para centrar
    <div className={styles.loginContainer}>
      {/* Usa la clase de la caja para el estilo oscuro */}
      <div className={styles.loginBox}>
        
        <h1>💈 Barbería Gestor</h1>
        <h2>Panel de Control</h2>
        
        <form onSubmit={handleSubmit}>
          {/* Campo de Email/Usuario */}
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

          {/* Campo de Contraseña */}
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

          {/* Mensaje de Error */}
          {error && <p className={styles.errorMessage}>{error}</p>}

          {/* Botón de Enviar */}
          <button 
            type="submit" 
            className={styles.loginButton} 
            disabled={isLoading || !formState.email || !formState.password} // Deshabilita si está cargando o campos vacíos
          >
            {isLoading ? 'Accediendo...' : 'Acceder'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;