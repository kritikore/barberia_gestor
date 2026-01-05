import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

// Definimos los estilos básicos aquí para no depender de CSS externos por ahora
const AdminDashboard = () => {
    const router = useRouter();
    const [admin, setAdmin] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 1. LEER DATOS GUARDADOS EN LOGIN
        // Usamos la misma clave 'barbero_data' que pusimos en el login (aunque sea admin)
        // para asegurar que lea lo que acabamos de guardar.
        const storedData = localStorage.getItem('barbero_data');
        const token = localStorage.getItem('token');

        if (!token || !storedData) {
            router.push('/login');
            return;
        }

        try {
            const parsedUser = JSON.parse(storedData);
            
            // 2. VERIFICAR SI REALMENTE ES ADMIN
            // Convertimos a string y minúsculas para asegurar
            const role = String(parsedUser.role || parsedUser.rol || parsedUser.id_rol).toLowerCase();
            
            if (role !== '1' && role !== 'admin' && role !== 'administrador') {
                alert("Acceso denegado: No tienes permisos de administrador.");
                router.push('/login');
                return;
            }

            setAdmin(parsedUser);
            setLoading(false);
        } catch (error) {
            console.error("Error de sesión admin:", error);
            router.push('/login');
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('barbero_data');
        router.push('/login');
    };

    if (loading) return (
        <div style={{height: '100vh', background: '#1a1a1a', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <h2>Cargando Panel de Admin... 👔</h2>
        </div>
    );

    return (
        <div style={{minHeight: '100vh', background: '#f4f6f8', fontFamily: 'sans-serif'}}>
            <Head>
                <title>Admin Dashboard - Barbería</title>
            </Head>

            {/* BARRA SUPERIOR */}
            <nav style={{background: '#0a192f', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white'}}>
                <h2 style={{margin: 0}}>👔 Panel Administrativo</h2>
                <div style={{display: 'flex', gap: '20px', alignItems: 'center'}}>
                    <span>Hola, <b>{admin.nombre || admin.nom_bar || admin.email}</b></span>
                    <button 
                        onClick={handleLogout}
                        style={{background: '#ff4d4d', border: 'none', color: 'white', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold'}}
                    >
                        Salir
                    </button>
                </div>
            </nav>

            {/* CONTENIDO PRINCIPAL */}
            <main style={{padding: '30px', maxWidth: '1200px', margin: '0 auto'}}>
                
                <h1 style={{color: '#333'}}>Gestión General</h1>
                
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '20px'}}>
                    
                    {/* TARJETA 1: BARBEROS */}
                    <div style={cardStyle}>
                        <h3 style={{marginTop: 0, color: '#0a192f'}}>✂️ Barberos</h3>
                        <p style={{color: '#666'}}>Crear, editar o eliminar barberos.</p>
                        <button style={btnStyle}>Gestionar Barberos</button>
                    </div>

                    {/* TARJETA 2: SERVICIOS */}
                    <div style={cardStyle}>
                        <h3 style={{marginTop: 0, color: '#0a192f'}}>🏷️ Servicios</h3>
                        <p style={{color: '#666'}}>Ajustar precios y catálogo.</p>
                        <button style={btnStyle}>Ver Servicios</button>
                    </div>

                    {/* TARJETA 3: REPORTES */}
                    <div style={cardStyle}>
                        <h3 style={{marginTop: 0, color: '#0a192f'}}>📊 Reportes</h3>
                        <p style={{color: '#666'}}>Ver ganancias y métricas.</p>
                        <button style={btnStyle}>Ver Estadísticas</button>
                    </div>

                </div>
            </main>
        </div>
    );
};

// Estilos simples en línea
const cardStyle: React.CSSProperties = {
    background: 'white',
    padding: '25px',
    borderRadius: '10px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
};

const btnStyle: React.CSSProperties = {
    background: '#0a192f',
    color: 'white',
    border: 'none',
    padding: '10px',
    borderRadius: '5px',
    cursor: 'pointer',
    marginTop: 'auto'
};

export default AdminDashboard;