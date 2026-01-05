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
                <header style={{marginBottom: '40px', paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.2)'}}>
                    <h1 style={{color: 'white', margin: '0 0 10px 0', textShadow: '0 2px 4px rgba(0,0,0,0.5)'}}>
                        Hola, <span style={{color: 'var(--color-primary)', marginLeft: '10px'}}>{barbero.nom_bar}</span> 👋
                    </h1>
                    <div style={{display:'flex', alignItems:'center', gap: 10}}>
                        <span style={{background: 'rgba(0,0,0,0.6)', padding: '5px 12px', borderRadius: '20px', fontSize: '0.85rem', color: '#fff', border: '1px solid #444'}}>
                            ID Empleado: {barbero.id_bar}
                        </span>
                        <span style={{background: '#28a745', padding: '5px 12px', borderRadius: '20px', fontSize: '0.85rem', color: 'white', fontWeight: 'bold', boxShadow: '0 0 10px rgba(40, 167, 69, 0.4)'}}>
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
                    <div onClick={() => setIsQuickAddOpen(true)} className="dashboard-card" style={{cursor: 'pointer'}}>
                        <div style={iconContainerStyle('#28a745')}>
                            <FaUserPlus size={30} color="white" />
                        </div>
                        <div style={{textAlign: 'center'}}>
                            <h3>Nuevo Cliente</h3>
                            <p>Registrar en mi cartera</p>
                        </div>
                    </div>

                    {/* 2. MI DIRECTORIO */}
                    <Link href="/barbero/clientes" style={{textDecoration:'none'}}>
                        <div className="dashboard-card">
                            <div style={iconContainerStyle('#17a2b8')}>
                                <FaAddressBook size={30} color="white" />
                            </div>
                            <div style={{textAlign: 'center'}}>
                                <h3>Mi Directorio</h3>
                                <p>Ver mis clientes</p>
                            </div>
                        </div>
                    </Link>

                    {/* 3. MI AGENDA */}
                    <Link href="/barbero/citas" style={{textDecoration:'none'}}>
                        <div className="dashboard-card">
                            <div style={iconContainerStyle('#ffc107')}>
                                <FaCalendarAlt size={30} color="white" />
                            </div>
                            <div style={{textAlign: 'center'}}>
                                <h3>Mi Agenda</h3>
                                <p>Ver mis citas del día</p>
                            </div>
                        </div>
                    </Link>

                    {/* 4. TIENDA */}
                    <Link href="/barbero/ventas" style={{textDecoration:'none'}}>
                        <div className="dashboard-card">
                            <div style={iconContainerStyle('#0D6EFD')}>
                                <FaShoppingBag size={30} color="white" />
                            </div>
                            <div style={{textAlign: 'center'}}>
                                <h3>Tienda</h3>
                                <p>Vender productos</p>
                            </div>
                        </div>
                    </Link>

                    {/* 5. INSUMOS */}
                    <Link href="/barbero/insumos" style={{textDecoration:'none'}}>
                        <div className="dashboard-card">
                            <div style={iconContainerStyle('#6c757d')}>
                                <FaBoxOpen size={30} color="white" />
                            </div>
                            <div style={{textAlign: 'center'}}>
                                <h3>Mis Insumos</h3>
                                <p>Stock personal</p>
                            </div>
                        </div>
                    </Link>

                </div>
            </div>

            {/* Estilos CSS en JS para hover effects */}
            <style jsx>{`
                .dashboard-card {
                    /* Estos estilos complementan a globals.css */
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 20px;
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                    cursor: pointer;
                    height: 100%;
                }
                .dashboard-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 12px 25px rgba(0,0,0,0.15);
                    border-color: var(--color-primary) !important;
                }
                .dashboard-card h3 {
                    margin: 0 0 5px 0;
                    color: #333; /* Texto oscuro */
                    font-size: 1.2rem;
                    font-weight: 700;
                }
                .dashboard-card p {
                    margin: 0;
                    color: #666; /* Texto gris */
                    font-size: 0.9rem;
                }
            `}</style>
        </>
    );
};

// Estilo para el círculo del icono
const iconContainerStyle = (color: string): React.CSSProperties => ({ 
    backgroundColor: color, 
    width: '65px', 
    height: '65px', 
    borderRadius: '50%', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
    marginBottom: '5px'
});

export default BarberDashboard;