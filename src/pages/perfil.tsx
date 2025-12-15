import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/AdminLayout'; // Reutilizamos tu layout
import { FaUserShield, FaKey, FaSave, FaArrowLeft } from 'react-icons/fa';

const PerfilPage: NextPage = () => {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    
    // Formulario
    const [passData, setPassData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Leer usuario de localStorage
        const stored = localStorage.getItem('usuario_activo');
        if (stored) {
            setUser(JSON.parse(stored));
        } else {
            router.push('/');
        }
    }, []);

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
                    id_bar: user.id_bar,
                    currentPassword: passData.currentPassword,
                    newPassword: passData.newPassword
                })
            });

            const data = await res.json();

            if (res.ok) {
                alert("✅ ¡Contraseña cambiada con éxito! Por seguridad, inicia sesión nuevamente.");
                localStorage.removeItem('usuario_activo');
                router.push('/');
            } else {
                alert("❌ Error: " + data.message);
            }
        } catch (error) {
            alert("Error de conexión");
        } finally {
            setLoading(false);
        }
    };

    if (!user) return <div style={{background:'#1a1a1a', height:'100vh', color:'white', display:'flex', justifyContent:'center', alignItems:'center'}}>Cargando perfil...</div>;

    return (
        <>
            <Head><title>Mi Perfil</title></Head>
            <main style={{ maxWidth: '600px', margin: '0 auto' }}>
                
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px', gap: 15 }}>
                    <button onClick={() => router.back()} style={{background:'none', border:'none', color:'#aaa', cursor:'pointer', fontSize:'1.2rem'}}>
                        <FaArrowLeft />
                    </button>
                    <h1 style={{margin:0}}><FaUserShield color="var(--color-accent)"/> Mi Perfil</h1>
                </div>

                {/* TARJETA DE INFO */}
                <div style={{ background: '#222', padding: 25, borderRadius: 12, border: '1px solid #444', marginBottom: 30, textAlign:'center' }}>
                    <div style={{width: 80, height: 80, background: '#333', borderRadius: '50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 15px', border:'2px solid var(--color-accent)'}}>
                        <span style={{fontSize: '2rem', fontWeight:'bold', color:'white'}}>
                            {user.nom_bar?.charAt(0)}
                        </span>
                    </div>
                    <h2 style={{color:'white', margin:0}}>{user.nom_bar}</h2>
                    <p style={{color:'#aaa', margin:'5px 0'}}>{user.email}</p>
                    <span style={{background: user.role === 'admin' ? '#dc3545' : '#0D6EFD', color:'white', padding:'4px 12px', borderRadius:20, fontSize:'0.8rem'}}>
                        {user.role === 'admin' ? 'Administrador' : 'Barbero'}
                    </span>
                </div>

                {/* FORMULARIO DE CAMBIO DE CLAVE */}
                <div style={{ background: '#1E1E1E', padding: 25, borderRadius: 12, border: '1px solid #444' }}>
                    <h3 style={{color:'white', marginTop:0, display:'flex', alignItems:'center', gap:10}}>
                        <FaKey color="#D4AF37"/> Cambiar Contraseña
                    </h3>
                    
                    <form onSubmit={handleChangePassword} style={{display:'flex', flexDirection:'column', gap: 15}}>
                        <div>
                            <label style={{color:'#ccc', display:'block', marginBottom:5}}>Contraseña Actual</label>
                            <input type="password" required 
                                style={{width:'100%', padding:10, borderRadius:6, background:'#2A2A2A', border:'1px solid #444', color:'white'}}
                                value={passData.currentPassword}
                                onChange={e => setPassData({...passData, currentPassword: e.target.value})}
                            />
                        </div>

                        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap: 15}}>
                            <div>
                                <label style={{color:'#ccc', display:'block', marginBottom:5}}>Nueva Contraseña</label>
                                <input type="password" required 
                                    style={{width:'100%', padding:10, borderRadius:6, background:'#2A2A2A', border:'1px solid #444', color:'white'}}
                                    value={passData.newPassword}
                                    onChange={e => setPassData({...passData, newPassword: e.target.value})}
                                />
                            </div>
                            <div>
                                <label style={{color:'#ccc', display:'block', marginBottom:5}}>Confirmar Nueva</label>
                                <input type="password" required 
                                    style={{width:'100%', padding:10, borderRadius:6, background:'#2A2A2A', border:'1px solid #444', color:'white'}}
                                    value={passData.confirmPassword}
                                    onChange={e => setPassData({...passData, confirmPassword: e.target.value})}
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            style={{
                                marginTop: 10,
                                background: 'var(--color-accent)', 
                                color: 'black', 
                                border: 'none', 
                                padding: '12px', 
                                borderRadius: '8px', 
                                fontWeight: 'bold', 
                                cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                            }}
                        >
                            {loading ? 'Actualizando...' : <><FaSave /> Actualizar Contraseña</>}
                        </button>
                    </form>
                </div>

            </main>
        </>
    );
};

export default PerfilPage;