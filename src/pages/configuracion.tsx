import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { FaUserCog, FaUserShield, FaSave, FaSignOutAlt, FaLock, FaKey } from 'react-icons/fa';
import AdminLayout from '@/components/AdminLayout';
import styles from '@/styles/Configuracion.module.css';

const ConfiguracionPage: NextPage = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Estado para Datos del Perfil (Nombre y Email)
    const [adminData, setAdminData] = useState({
        id_bar: 0,
        nom_bar: '',
        email: ''
    });

    // Estado para el Cambio de Contraseña
    const [passData, setPassData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Cargar datos al iniciar
    useEffect(() => {
        const stored = localStorage.getItem('usuario_activo');
        if (stored) {
            setAdminData(JSON.parse(stored));
        }
    }, []);

    // --- FUNCIÓN 1: ACTUALIZAR NOMBRE Y CORREO ---
    const handleSaveProfile = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        
        // Simulamos la petición a la API (o puedes crear una real PUT /api/personal)
        setTimeout(() => {
            localStorage.setItem('usuario_activo', JSON.stringify(adminData));
            alert("✅ Perfil actualizado correctamente.");
            setLoading(false);
        }, 800);
    };

    // --- FUNCIÓN 2: CAMBIAR CONTRASEÑA (Lógica real) ---
    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (passData.newPassword !== passData.confirmPassword) {
            return alert("⚠️ Las nuevas contraseñas no coinciden");
        }
        if (passData.newPassword.length < 6) {
            return alert("⚠️ La contraseña debe tener al menos 6 caracteres");
        }

        setLoading(true);
        try {
            const res = await fetch('/api/auth/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_bar: adminData.id_bar,
                    currentPassword: passData.currentPassword,
                    newPassword: passData.newPassword
                })
            });

            const data = await res.json();

            if (res.ok) {
                alert("✅ Contraseña actualizada. Por seguridad, inicia sesión de nuevo.");
                localStorage.removeItem('usuario_activo');
                router.push('/');
            } else {
                alert("❌ Error: " + data.message);
            }
        } catch (error) {
            console.error(error);
            alert("Error de conexión");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        if(confirm("¿Cerrar sesión del sistema?")) {
            localStorage.removeItem('usuario_activo');
            router.push('/');
        }
    };

    return (
        <>
            <Head><title>Configuración | Admin</title></Head>
            
            <div className={styles.container}>
                
                <div className={styles.mainHeader}>
                    <FaUserCog size={45} color="var(--color-accent)" />
                    <div>
                        <h1>Configuración de Cuenta</h1>
                        <p>Administra tus datos personales y seguridad.</p>
                    </div>
                </div>

                {/* --- MÓDULO 1: DATOS DE PERFIL --- */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <div className={styles.iconWrapper}><FaUserCog /></div>
                        <div>
                            <h2>Perfil de Usuario</h2>
                            <p style={{margin: 0, fontSize: '0.9em', color: 'var(--color-label)'}}>Edita tu nombre y correo de acceso.</p>
                        </div>
                    </div>
                    <form onSubmit={handleSaveProfile}>
                        <div className={styles.formGroup}>
                            <label>Nombre de Usuario</label>
                            <input 
                                className={styles.input}
                                value={adminData.nom_bar} 
                                onChange={(e) => setAdminData({...adminData, nom_bar: e.target.value})} 
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Correo Electrónico</label>
                            <input 
                                className={styles.input}
                                value={adminData.email} 
                                onChange={(e) => setAdminData({...adminData, email: e.target.value})} 
                            />
                        </div>
                        <div style={{textAlign: 'right', marginTop: '10px'}}>
                            <button type="submit" className={styles.saveButton} disabled={loading}>
                                {loading ? 'Guardando...' : <><FaSave /> Guardar Datos</>}
                            </button>
                        </div>
                    </form>
                </div>

                {/* --- MÓDULO 2: SEGURIDAD (PASSWORD INTEGRADO) --- */}
                <div className={styles.card} style={{ borderLeft: '4px solid var(--color-primary)' }}>
                    <div className={styles.cardHeader}>
                        <div className={styles.iconWrapper} style={{ color: 'var(--color-primary)', borderColor: 'var(--color-primary)' }}>
                            <FaUserShield />
                        </div>
                        <div>
                            <h2 style={{color: 'var(--color-primary)'}}>Zona de Seguridad</h2>
                            <p style={{margin: 0, fontSize: '0.9em', color: 'var(--color-label)'}}>Cambio de contraseña y sesión.</p>
                        </div>
                    </div>

                    {/* Formulario de Cambio de Contraseña Incrustado */}
                    <div style={{ background: '#1a1a1a', padding: '20px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #333' }}>
                        <h3 style={{color:'white', marginTop:0, fontSize:'1.1rem', display:'flex', alignItems:'center', gap:8}}>
                            <FaKey /> Cambiar Contraseña
                        </h3>
                        
                        <form onSubmit={handleChangePassword}>
                            <div className={styles.formGroup}>
                                <label>Contraseña Actual</label>
                                <input 
                                    type="password" 
                                    className={styles.input}
                                    required 
                                    value={passData.currentPassword}
                                    onChange={e => setPassData({...passData, currentPassword: e.target.value})}
                                />
                            </div>
                            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap: 20}}>
                                <div className={styles.formGroup}>
                                    <label>Nueva Contraseña</label>
                                    <input 
                                        type="password" 
                                        className={styles.input}
                                        required 
                                        value={passData.newPassword}
                                        onChange={e => setPassData({...passData, newPassword: e.target.value})}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Confirmar Nueva</label>
                                    <input 
                                        type="password" 
                                        className={styles.input}
                                        required 
                                        value={passData.confirmPassword}
                                        onChange={e => setPassData({...passData, confirmPassword: e.target.value})}
                                    />
                                </div>
                            </div>
                            <button 
                                type="submit" 
                                className={styles.actionButton} 
                                style={{marginTop: 10, width:'100%', justifyContent:'center'}}
                                disabled={loading}
                            >
                                <FaLock /> Actualizar Contraseña
                            </button>
                        </form>
                    </div>

                    <div style={{borderTop: '1px solid #333', paddingTop: 20, textAlign: 'right'}}>
                        <button 
                            className={styles.dangerButton}
                            onClick={handleLogout}
                        >
                            <FaSignOutAlt /> Cerrar Sesión del Sistema
                        </button>
                    </div>
                </div>

            </div>
        </>
    );
};

export default ConfiguracionPage;