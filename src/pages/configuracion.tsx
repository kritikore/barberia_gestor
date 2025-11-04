// src/pages/configuracion.tsx
import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { FaCog, FaPaintBrush, FaUserShield, FaDatabase, FaFileAlt } from 'react-icons/fa';
import { useTheme } from '@/context/ThemeContext'; // 🔑 Importar el hook de Tema

import layoutStyles from '@/styles/GlobalLayout.module.css';
import styles from '@/styles/Configuracion.module.css'; 
// Reutilizamos los estilos de Modal/Formulario
import formStyles from '@/styles/Modal.module.css'; 

// (Interfaz ConfigData - Asumimos que la tienes de la respuesta anterior)

const ConfiguracionPage: NextPage = () => {
    const moduleName = "Configuración"; 
    
    // 🔑 Usamos el hook del Tema
    const { theme, toggleTheme } = useTheme();

    // (Aquí iría la lógica de carga y guardado de REQ-CONF1: Datos del Negocio)
    // const [formData, setFormData] = useState<ConfigData>(...);
    // useEffect(() => { /* fetchData... */ }, []);
    // const handleSubmit = async (e: React.FormEvent) => { /* Guardar datos... */ };

    return (
        <>
            <Head>
                <title>{moduleName} - Barbería Gestor</title>
            </Head>
            
            <main className={layoutStyles.mainContent}> 
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <h1>
                        <FaCog style={{ marginRight: '10px', color: 'var(--color-accent)' }} /> 
                        {moduleName} del Sistema
                    </h1>
                </div>

                {/* ------------------------------------------- */}
                {/* REQ-CONF8: Personalización Visual (Color) */}
                {/* ------------------------------------------- */}
                <div className={styles.sectionCard}>
                    <h2 className={styles.sectionTitle}><FaPaintBrush /> Personalización Visual</h2>
                    <div className={styles.themeToggle}>
                        <span>Modo actual: {theme === 'dark' ? 'Oscuro (Urbano)' : 'Claro (Minimalista)'}</span>
                        <button 
                            onClick={toggleTheme} 
                            className={formStyles.submitButton}
                            style={{ backgroundColor: 'var(--color-primary)' }}
                        >
                            Cambiar a Modo {theme === 'dark' ? 'Claro' : 'Oscuro'}
                        </button>
                    </div>
                </div>

                {/* ------------------------------------------- */}
                {/* REQ-CONF1: Datos del Negocio (Formulario) */}
                {/* ------------------------------------------- */}
                <div className={styles.sectionCard}>
                    <h2 className={styles.sectionTitle}>Datos del Negocio</h2>
                    <p style={{ color: 'var(--color-label)', marginTop: '-15px', marginBottom: '20px' }}>
                        Esta información aparecerá en el Sidebar y en los reportes.
                    </p>
                    {/* <form onSubmit={handleSubmit}> ... (Aquí iría tu formulario de REQ-CONF1) ... </form> */}
                    <p style={{color: 'var(--color-label)'}}>(Aquí va el formulario de REQ-CONF1 para Nombre, Dirección, Teléfono...)</p>
                </div>
                
                {/* ------------------------------------------- */}
                {/* REQ-CONF3: Gestión de Usuarios y Roles (Login) */}
                {/* ------------------------------------------- */}
                <div className={styles.sectionCard}>
                    <h2 className={styles.sectionTitle}><FaUserShield /> Usuarios y Roles</h2>
                    <p style={{ color: 'var(--color-label)', marginBottom: '20px' }}>
                        La gestión de usuarios (Barberos/Empleados) se realiza en el Módulo de Personal.
                    </p>
                    {/* (Puedes añadir un Link al módulo de Personal si quieres) */}
                </div>

                {/* ------------------------------------------- */}
                {/* REQ-CONF7: Backups (Aspectos Técnicos) */}
                {/* ------------------------------------------- */}
                <div className={styles.sectionCard}>
                    <h2 className={styles.sectionTitle}><FaDatabase /> Copias de Seguridad</h2>
                    <p style={{ color: 'var(--color-label)', marginBottom: '20px' }}>
                        Genera un respaldo de la base de datos PostgreSQL.
                    </p>
                    <button className={formStyles.submitButton} onClick={() => alert('Llamando a API de Backup... (Pendiente)')}>
                        Generar Backup (.sql)
                    </button>
                </div>
                
                {/* ------------------------------------------- */}
                {/* REQ-CONF9: Auditoría (Aspectos Técnicos) */}
                {/* ------------------------------------------- */}
                <div className={styles.sectionCard}>
                    <h2 className={styles.sectionTitle}><FaFileAlt /> Auditoría del Sistema</h2>
                    <p style={{ color: 'var(--color-label)', marginBottom: '20px' }}>
                        Revisa los registros de acciones críticas (logins, eliminaciones, etc.). (Pendiente de implementar tabla `auditoria`).
                    </p>
                    {/* (Aquí iría una tabla de logs) */}
                </div>

            </main>
        </>
    );
};

export default ConfiguracionPage;