import React, { useState } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { 
    FaUserPlus, FaAddressBook, FaCalendarAlt, 
    FaShoppingBag, FaBoxOpen 
} from 'react-icons/fa';
import ClientModal from '@/components/ClientModal';
import { useBarbero } from '@/hooks/useBarbero';

const BarberDashboard: NextPage = () => {
    const { barbero, loading } = useBarbero();
    const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

    if (loading) return <div style={{color:'white', padding:50, textAlign:'center'}}>Cargando panel...</div>;
    if (!barbero) return null;

    return (
        <>
            <Head><title>Panel de Barbero</title></Head>

            {/* MODAL: Nuevo Cliente Rápido */}
            {isQuickAddOpen && (
                <ClientModal 
                    onClose={() => setIsQuickAddOpen(false)} 
                    onSuccess={() => alert("✅ Cliente guardado en tu cartera personal")} 
                    fixedBarberId={barbero.id_bar} 
                />
            )}

            <div style={{padding: '20px', maxWidth: '1200px', margin: '0 auto'}}>
                
                {/* HEADER DE BIENVENIDA */}
                <header style={{marginBottom: '40px', borderBottom: '1px solid #333', paddingBottom: '20px'}}>
                    <h1 style={{color: 'white', margin: '0 0 10px 0', fontSize: '2rem'}}>
                        Hola, <span style={{color: 'var(--color-accent)'}}>{barbero.nom_bar}</span> 👋
                    </h1>
                    <div style={{display:'flex', alignItems:'center', gap: 10}}>
                        <span style={{background: '#333', padding: '5px 12px', borderRadius: '20px', fontSize: '0.85rem', color: '#ccc'}}>
                            ID Empleado: {barbero.id_bar}
                        </span>
                        <span style={{background: '#28a745', padding: '5px 12px', borderRadius: '20px', fontSize: '0.85rem', color: 'white', fontWeight: 'bold'}}>
                            Activo
                        </span>
                    </div>
                </header>

                {/* GRID DE TARJETAS */}
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
                    gap: '25px' 
                }}>

                    {/* 1. NUEVO CLIENTE */}
                    <div onClick={() => setIsQuickAddOpen(true)} className="dashboard-card" style={cardStyle}>
                        <div style={iconContainerStyle('#28a745')}>
                            <FaUserPlus size={32} color="white" />
                        </div>
                        <div style={{textAlign: 'center'}}>
                            <h3 style={titleStyle}>Nuevo Cliente</h3>
                            <p style={descStyle}>Registrar en mi cartera</p>
                        </div>
                    </div>

                    {/* 2. MI DIRECTORIO */}
                    <Link href="/barbero/clientes" style={{textDecoration:'none'}}>
                        <div className="dashboard-card" style={cardStyle}>
                            <div style={iconContainerStyle('#17a2b8')}>
                                <FaAddressBook size={32} color="white" />
                            </div>
                            <div style={{textAlign: 'center'}}>
                                <h3 style={titleStyle}>Mi Directorio</h3>
                                <p style={descStyle}>Ver mis clientes</p>
                            </div>
                        </div>
                    </Link>

                    {/* 3. MI AGENDA */}
                    <Link href="/barbero/citas" style={{textDecoration:'none'}}>
                        <div className="dashboard-card" style={cardStyle}>
                            <div style={iconContainerStyle('#ffc107')}>
                                <FaCalendarAlt size={32} color="black" />
                            </div>
                            <div style={{textAlign: 'center'}}>
                                <h3 style={titleStyle}>Mi Agenda</h3>
                                <p style={descStyle}>Ver mis citas del día</p>
                            </div>
                        </div>
                    </Link>

                    {/* 4. TIENDA */}
                    <Link href="/barbero/ventas" style={{textDecoration:'none'}}>
                        <div className="dashboard-card" style={cardStyle}>
                            <div style={iconContainerStyle('#0D6EFD')}>
                                <FaShoppingBag size={32} color="white" />
                            </div>
                            <div style={{textAlign: 'center'}}>
                                <h3 style={titleStyle}>Tienda</h3>
                                <p style={descStyle}>Vender productos</p>
                            </div>
                        </div>
                    </Link>

                    {/* 5. INSUMOS */}
                    <Link href="/barbero/insumos" style={{textDecoration:'none'}}>
                        <div className="dashboard-card" style={cardStyle}>
                            <div style={iconContainerStyle('#6c757d')}>
                                <FaBoxOpen size={32} color="white" />
                            </div>
                            <div style={{textAlign: 'center'}}>
                                <h3 style={titleStyle}>Mis Insumos</h3>
                                <p style={descStyle}>Stock personal</p>
                            </div>
                        </div>
                    </Link>

                </div>
            </div>

            {/* Estilos CSS en JS para hover effects */}
            <style jsx>{`
                .dashboard-card {
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                }
                .dashboard-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 20px rgba(0,0,0,0.3);
                    border-color: var(--color-accent) !important;
                }
            `}</style>
        </>
    );
};

// Estilos Base
const cardStyle: React.CSSProperties = { 
    backgroundColor: '#1E1E1E', 
    borderRadius: '16px', 
    padding: '30px 20px', 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    border: '1px solid #333', 
    cursor: 'pointer', 
    height: '100%', 
    justifyContent: 'center', 
    gap: '20px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
};

const iconContainerStyle = (color: string): React.CSSProperties => ({ 
    backgroundColor: color, 
    width: '70px', 
    height: '70px', 
    borderRadius: '50%', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
});

const titleStyle: React.CSSProperties = { 
    margin: '0 0 5px 0', 
    color: 'white', 
    fontSize: '1.3rem',
    fontWeight: '600'
};

const descStyle: React.CSSProperties = { 
    margin: 0, 
    color: '#888', 
    fontSize: '0.95rem' 
};

export default BarberDashboard;