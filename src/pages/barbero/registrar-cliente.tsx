// src/pages/barbero/registrar-cliente.tsx

import React, { useState } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { FaUserPlus, FaArrowLeft } from 'react-icons/fa';
import BarberLayout from '@/components/BarberLayout'; // Asegúrate de tener este layout
import styles from '@/styles/Modal.module.css'; // Reusamos los estilos de formulario (inputs oscuros)

const RegistrarClienteBarbero: NextPage = () => {
    const router = useRouter();
    
    // Estado del formulario
    const [formData, setFormData] = useState({
        nom_clie: '',
        apell_clie: '',
        tel_clie: '',
        edad_clie: '',
        ocupacion: '',
    });
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Validación básica antes de enviar
        if (formData.tel_clie.length !== 10) {
            setError("El teléfono debe tener 10 dígitos.");
            setLoading(false);
            return;
        }

        try {
            // Llamada a la API
            const response = await fetch('/api/clientes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    // Limpiamos espacios en blanco
                    nom_clie: formData.nom_clie.trim(),
                    apell_clie: formData.apell_clie.trim(),
                    tel_clie: formData.tel_clie.trim(),
                    edad_clie: parseInt(formData.edad_clie), // Convertir a número
                    ocupacion: formData.ocupacion.trim(),
                }),
            });

            if (!response.ok) {
                const res = await response.json();
                throw new Error(res.message || 'Error al registrar');
            }

            // Éxito
            alert('✅ Cliente registrado exitosamente');
            router.push('/barbero/dashboard'); // Volver al dashboard del barbero

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Head><title>Registrar Cliente - Barbero</title></Head>

            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                
                {/* Botón Volver */}
                <button 
                    onClick={() => router.back()} 
                    style={{ 
                        background: 'none', border: 'none', color: '#aaa', 
                        cursor: 'pointer', display: 'flex', alignItems: 'center', 
                        gap: '5px', marginBottom: '20px', fontSize: '1.1em'
                    }}
                >
                    <FaArrowLeft /> Volver al Dashboard
                </button>

                {/* Tarjeta del Formulario */}
                <div className={styles.modalContent} style={{ maxWidth: '100%' }}>
                    <div className={styles.modalHeader}>
                        <h2 style={{ color: 'var(--color-accent)' }}>
                            <FaUserPlus style={{marginRight: 10}}/> Nuevo Cliente
                        </h2>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {error && <p className={styles.errorMessage}>{error}</p>}
                        
                        <div className={styles.formGrid}>
                            <div className={styles.formGroup}>
                                <label>Nombre</label>
                                <input name="nom_clie" value={formData.nom_clie} onChange={handleChange} required />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Apellido</label>
                                <input name="apell_clie" value={formData.apell_clie} onChange={handleChange} required />
                            </div>
                        </div>
                        
                        <div className={styles.formGroup}>
                            <label>Teléfono (10 dígitos)</label>
                            <input name="tel_clie" type="tel" maxLength={10} value={formData.tel_clie} onChange={handleChange} required />
                        </div>
                        
                        <div className={styles.formGrid}>
                            <div className={styles.formGroup}>
                                <label>Edad</label>
                                <input name="edad_clie" type="number" value={formData.edad_clie} onChange={handleChange} required />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Ocupación</label>
                                <input name="ocupacion" value={formData.ocupacion} onChange={handleChange} required />
                            </div>
                        </div>
                        
                        <button 
                            type="submit" 
                            className={styles.submitButton} 
                            style={{
                                width: '100%', 
                                marginTop: '20px', 
                                backgroundColor: 'var(--color-accent)', 
                                color: 'var(--color-background)',
                                fontSize: '1.1em',
                                padding: '12px'
                            }} 
                            disabled={loading}
                        >
                            {loading ? 'Guardando...' : 'Registrar Cliente'}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
};

export default RegistrarClienteBarbero;