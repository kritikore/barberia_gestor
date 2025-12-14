// src/pages/configuracion.tsx
import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { FaStore, FaUserShield, FaSave, FaSignOutAlt, FaLock, FaCog, FaTools } from 'react-icons/fa';
import AdminLayout from '@/components/AdminLayout';
import styles from '@/styles/Configuracion.module.css';

// (No necesitamos ThemeProvider aquí si el _app.tsx está bien configurado, 
// pero ya que definimos un estilo fijo "Urbano", no usaremos el toggle).

const ConfiguracionPage: NextPage = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [businessData, setBusinessData] = useState({
        nombre: "The Gentleman's Cut",
        telefono: "55-1234-5678",
        email: "contacto@barberia.com"
    });

    useEffect(() => {
        const savedData = localStorage.getItem('businessConfig');
        if (savedData) setBusinessData(JSON.parse(savedData));
    }, []);

    const handleSaveBusiness = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            localStorage.setItem('businessConfig', JSON.stringify(businessData));
            alert("✅ Configuración guardada con éxito.");
            setLoading(false);
        }, 800);
    };

    const handleLogout = () => {
        if(confirm("¿Cerrar sesión del sistema?")) router.push('/login');
    };

    return (
        <>
            <Head><title>Configuración | The Gentleman's Cut</title></Head>
            
            <div className={styles.container}>
                
                {/* ENCABEZADO PRINCIPAL */}
                <div className={styles.mainHeader}>
                    <FaCog size={45} color="var(--color-accent)" />
                    <div>
                        <h1>Configuración del Sistema</h1>
                        <p>Personaliza los parámetros de tu barbería.</p>
                    </div>
                </div>

                {/* TARJETA 1: DATOS DEL NEGOCIO */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <div className={styles.iconWrapper}><FaStore /></div>
                        <div>
                            <h2>Datos del Negocio</h2>
                            <p style={{margin: 0, fontSize: '0.9em', color: 'var(--color-label)'}}>Información visible en tickets y reportes.</p>
                        </div>
                    </div>
                    <form onSubmit={handleSaveBusiness}>
                        <div className={styles.formGroup}>
                            <label>Nombre Comercial</label>
                            <input 
                                className={styles.input}
                                value={businessData.nombre} 
                                onChange={(e) => setBusinessData({...businessData, nombre: e.target.value})} 
                            />
                        </div>
                        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
                            <div className={styles.formGroup}>
                                <label>Teléfono Público</label>
                                <input 
                                    className={styles.input}
                                    value={businessData.telefono} 
                                    onChange={(e) => setBusinessData({...businessData, telefono: e.target.value})} 
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Correo de Contacto</label>
                                <input 
                                    className={styles.input}
                                    value={businessData.email} 
                                    onChange={(e) => setBusinessData({...businessData, email: e.target.value})} 
                                />
                            </div>
                        </div>
                        <div style={{textAlign: 'right', marginTop: '10px'}}>
                            <button type="submit" className={styles.saveButton} disabled={loading}>
                                {loading ? 'Guardando...' : <><FaSave /> Guardar Cambios</>}
                            </button>
                        </div>
                    </form>
                </div>

                {/* TARJETA 2: PREFERENCIAS DEL SISTEMA */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <div className={styles.iconWrapper}><FaTools /></div>
                        <div>
                            <h2>Preferencias</h2>
                            <p style={{margin: 0, fontSize: '0.9em', color: 'var(--color-label)'}}>Ajustes de operación.</p>
                        </div>
                    </div>
                    
                    <div className={styles.prefRow}>
                        <span className={styles.prefLabel}>Idioma del Sistema</span>
                        <select className={styles.select} style={{width: 'auto'}}>
                            <option value="es">Español (MX)</option>
                            <option value="en">English (US)</option>
                        </select>
                    </div>
                    <div className={styles.prefRow}>
                        <span className={styles.prefLabel}>Moneda</span>
                        <select className={styles.select} style={{width: 'auto'}}>
                            <option value="mxn">Peso Mexicano ($)</option>
                            <option value="usd">Dólar ($)</option>
                        </select>
                    </div>
                </div>

                {/* TARJETA 3: ZONA DE ADMINISTRADOR */}
                <div className={styles.card} style={{ borderLeft: '4px solid var(--color-primary)' }}>
                    <div className={styles.cardHeader}>
                        <div className={styles.iconWrapper} style={{ color: 'var(--color-primary)', borderColor: 'var(--color-primary)' }}>
                            <FaUserShield />
                        </div>
                        <div>
                            <h2 style={{color: 'var(--color-primary)'}}>Zona de Seguridad</h2>
                            <p style={{margin: 0, fontSize: '0.9em', color: 'var(--color-label)'}}>Gestión de cuenta administrativa.</p>
                        </div>
                    </div>
                    <div style={{display: 'flex', gap: '20px', flexWrap: 'wrap'}}>
                        <button 
                            className={styles.actionButton}
                            onClick={() => alert("Abriendo modal de cambio de contraseña...")}
                        >
                            <FaLock /> Cambiar Contraseña
                        </button>
                        <button 
                            className={styles.dangerButton}
                            onClick={handleLogout}
                        >
                            <FaSignOutAlt /> Cerrar Sesión
                        </button>
                    </div>
                </div>

            </div>
        </>
    );
};

export default ConfiguracionPage;