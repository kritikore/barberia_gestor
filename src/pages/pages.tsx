// src/pages/register.tsx
import React, { useState } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FaCut } from 'react-icons/fa';
// Reutilizamos los estilos del Modal para el formulario
import styles from '@/styles/Modal.module.css'; 



const RegisterPage: NextPage = () => {
    const router = useRouter();
    const [formData, setFormData] = useState({
        nom_bar: '',
        apell_bar: '',
        tel_bar: '',
        edad_bar: '',
        email: '',
        password: '',
        posicion: 'Barbero', // Valor por defecto
    });
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const res = await response.json();
                throw new Error(res.message || 'Error al registrar la cuenta');
            }

            // Éxito: Redirigir al Login
            alert('¡Registro exitoso! Ahora puedes iniciar sesión.');
            router.push('/login');

        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <>
            <Head>
                <title>Registrar Nuevo Usuario</title>
            </Head>
            {/* Usamos el contenedor de Modal para el fondo oscuro */}
            <div className={styles.modalBackdrop}>
                <div className={styles.modalContent} style={{ maxWidth: '600px' }}>
                    <div className={styles.modalHeader}>
                        <h2 style={{ color: 'var(--color-accent)' }}>
                            <FaCut /> Registrar Nuevo Barbero
                        </h2>
                    </div>
                    <form onSubmit={handleSubmit}>
                        {error && <p className={styles.errorMessage}>{error}</p>}
                        
                        <div className={styles.formGrid}>
                            <div className={styles.formGroup}>
                                <label>Nombre(s)</label>
                                <input name="nom_bar" value={formData.nom_bar} onChange={handleChange} required />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Apellido(s)</label>
                                <input name="apell_bar" value={formData.apell_bar} onChange={handleChange} required />
                            </div>
                        </div>
                        
                        <div className={styles.formGrid}>
                             <div className={styles.formGroup}>
                                <label>Teléfono (10 dígitos)</label>
                                <input name="tel_bar" value={formData.tel_bar} onChange={handleChange} required maxLength={10} />
                            </div>
                             <div className={styles.formGroup}>
                                <label>Edad</label>
                                <input name="edad_bar" value={formData.edad_bar} onChange={handleChange} type="number" required />
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label>Email (será tu usuario)</label>
                            <input name="email" value={formData.email} onChange={handleChange} type="email" required />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Contraseña</label>
                            <input name="password" value={formData.password} onChange={handleChange} type="password" required />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Posición</label>
                            <select name="posicion" value={formData.posicion} onChange={handleChange}>
                                <option value="Barbero">Barbero</option>
                                <option value="Aprendiz">Aprendiz</option>
                            </select>
                        </div>
                        
                        <div className={styles.formActions}>
                            <Link href="/login">
                                <a className={styles.cancelButton}>Volver a Login</a>
                            </Link>
                            <button type="submit" className={styles.submitButton} style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-background)' }} disabled={loading}>
                                {loading ? 'Registrando...' : 'Registrar Cuenta'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default RegisterPage;