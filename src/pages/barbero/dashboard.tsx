// src/pages/barbero/dashboard.tsx
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { FaUserPlus, FaUsers, FaCalendarAlt, FaFlask, FaBolt, FaClock ,FaShoppingCart} from 'react-icons/fa'; 
import BarberLayout from '@/components/BarberLayout'; 

const BarberDashboard: NextPage = () => {
    const [userName, setUserName] = useState("Barbero");

    useEffect(() => {
        const storedUser = localStorage.getItem('userProfile');
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                setUserName(user.nombre || "Barbero");
            } catch (error) { console.error(error); }
        }
    }, []);

    // Estilos en línea para asegurar que se vea bien sin depender del CSS Module externo
    const cardStyle = {
        display: 'flex',
        flexDirection: 'column' as 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '25px',
        borderRadius: '12px',
        textDecoration: 'none',
        transition: 'transform 0.2s, box-shadow 0.2s',
        color: 'white',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
        textAlign: 'center' as 'center',
        cursor: 'pointer'
    };

    return (
        <>
            <Head><title>Panel de Barbero</title></Head>
            
            <header style={{marginBottom: '30px', borderBottom: '1px solid #333', paddingBottom: '20px'}}>
                <h1 style={{color: 'var(--color-accent)', margin: 0}}>Hola, {userName} 👋</h1>
                <p style={{color: '#aaa', margin: '5px 0'}}>¿Qué vamos a hacer ahora?</p>
            </header>

            {/* GRID PRINCIPAL */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', // Responsivo
                gap: '20px',
                maxWidth: '1000px',
                margin: '0 auto'
            }}>
                
                {/* 1. CAJA RÁPIDA (Destacado - Estilo "Urbano Premium") */}
                <Link href="/barbero/caja-rapida" style={{
                    ...cardStyle,
                    gridColumn: '1 / -1', // Ocupa todo el ancho
                    background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.2) 0%, rgba(28, 28, 28, 1) 100%)', // Dorado oscuro
                    border: '2px solid var(--color-accent)',
                    flexDirection: 'row', // Icono al lado del texto
                    gap: '20px',
                    padding: '30px'
                }}>
                    <div style={{background: 'var(--color-accent)', padding: '15px', borderRadius: '50%', color: 'black'}}>
                        <FaBolt size={30} />
                    </div>
                    <div style={{textAlign: 'left'}}>
                        <h2 style={{margin: 0, color: 'var(--color-accent)', textTransform: 'uppercase', fontSize: '1.5em'}}>Caja Rápida</h2>
                        <p style={{margin: 0, color: '#ddd'}}>Cobrar corte al instante (Walk-in)</p>
                    </div>
                </Link>

                {/* 2. AGENDAR CITA (Nuevo Acceso Directo) */}
                <Link href="/barbero/agendar" style={{
                    ...cardStyle,
                    gridColumn: 'span 2', // Ocupa 2 espacios si cabe
                    background: 'linear-gradient(135deg, rgba(13, 110, 253, 0.2) 0%, rgba(28, 28, 28, 1) 100%)', // Azul oscuro
                    border: '1px solid #0D6EFD'
                }}>
                    <FaClock size={25} color="#0D6EFD" style={{marginBottom: 10}}/>
                    <h3 style={{margin: 0}}>Agendar Cita</h3>
                    <span style={{fontSize: '0.8em', color: '#aaa'}}>Reservar espacio futuro</span>
                </Link>

                {/* 3. VER AGENDA (Consultar) */}
                <Link href="/barbero/citas" style={{...cardStyle, background: '#2A2A2A'}}>
                    <FaCalendarAlt size={25} color="#F5C542" style={{marginBottom: 10}}/> 
                    <h3 style={{margin: 0, fontSize: '1em'}}>Ver Agenda</h3>
                </Link>

                {/* 4. REGISTRAR CLIENTE */}
                <Link href="/barbero/registrar-cliente" style={{...cardStyle, background: '#2A2A2A'}}>
                    <FaUserPlus size={25} color="#28a745" style={{marginBottom: 10}}/> 
                    <h3 style={{margin: 0, fontSize: '1em'}}>Nuevo Cliente</h3>
                </Link>

                {/* 5. CONSULTAR CLIENTES */}
                <Link href="/barbero/clientes" style={{...cardStyle, background: '#2A2A2A'}}>
                    <FaUsers size={25} color="#17a2b8" style={{marginBottom: 10}}/> 
                    <h3 style={{margin: 0, fontSize: '1em'}}>Directorio</h3>
                </Link>

                {/* 6. INSUMOS */}
                <Link href="/barbero/insumos" style={{...cardStyle, background: '#2A2A2A'}}>
                    <FaFlask size={25} color="#dc3545" style={{marginBottom: 10}}/> 
                    <h3 style={{margin: 0, fontSize: '1em'}}>Mis Insumos</h3>
                </Link>

              <Link
    href="/barbero/ventas"
    style={{ ...cardStyle, background: '#2A2A2A' }}
>
    <FaShoppingCart
        size={25}
        color="#6f42c1"
        style={{ marginBottom: 10 }}
    />
    <h3 style={{ margin: 0, fontSize: '1em' }}>
        Vender Productos
    </h3>
</Link>


            </div>
        </>
    );
};

export default BarberDashboard;