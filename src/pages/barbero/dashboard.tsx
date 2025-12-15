import React, { useState } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { 
    FaUserPlus, FaAddressBook, FaCalendarAlt, FaCalendarPlus, 
    FaMoneyBillWave, FaShoppingBag, FaBoxOpen 
} from 'react-icons/fa';
import AdminLayout from '@/components/AdminLayout'; 
import ClientModal from '@/components/ClientModal';
import { useBarbero } from '@/hooks/useBarbero'; // 👈 Hook de identidad real

const BarberDashboard: NextPage = () => {
    const { barbero, loading } = useBarbero();
    const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

    if (loading) return <div style={{color:'white', padding:50}}>Cargando panel...</div>;
    if (!barbero) return null;

    return (
        <>
            <Head><title>Panel de Barbero</title></Head>

            {/* MODAL: Nuevo Cliente (Se guarda directo en la cartera de ESTE barbero) */}
            {isQuickAddOpen && (
                <ClientModal 
                    onClose={() => setIsQuickAddOpen(false)} 
                    onSuccess={() => alert("✅ Cliente guardado en tu cartera personal")} 
                    fixedBarberId={barbero.id_bar} // 👈 ID REAL
                />
            )}

            <div style={{padding: '10px'}}>
                <header style={{marginBottom: '30px'}}>
                    <h1 style={{color: 'white', margin: '0 0 5px 0'}}>Hola, {barbero.nom_bar} 👋</h1>
                    <p style={{color: '#aaa', margin: 0}}>ID Empleado: {barbero.id_bar}</p>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>

                    {/* 1. NUEVO CLIENTE */}
                    <div onClick={() => setIsQuickAddOpen(true)} style={cardStyle}>
                        <div style={iconContainerStyle('#28a745')}><FaUserPlus size={30} color="white" /></div>
                        <h3 style={titleStyle}>Nuevo Cliente</h3>
                        <span style={descStyle}>Registrar en mi cartera</span>
                    </div>

                    {/* 2. MI DIRECTORIO */}
                    <Link href="/barbero/clientes" style={{textDecoration:'none'}}>
                        <div style={cardStyle}>
                            <div style={iconContainerStyle('#17a2b8')}><FaAddressBook size={30} color="white" /></div>
                            <h3 style={titleStyle}>Mi Directorio</h3>
                            <span style={descStyle}>Ver mis clientes</span>
                        </div>
                    </Link>

                    {/* 3. MIS CITAS */}
                    <Link href="/barbero/citas" style={{textDecoration:'none'}}>
                        <div style={cardStyle}>
                            <div style={iconContainerStyle('#ffc107')}><FaCalendarAlt size={30} color="black" /></div>
                            <h3 style={titleStyle}>Mis Citas</h3>
                            <span style={descStyle}>Agenda del día</span>
                        </div>
                    </Link>

                    {/* 4. AGENDAR CITA */}
                    <Link href="/barbero/agendar" style={{textDecoration:'none'}}>
                        <div style={cardStyle}>
                            <div style={iconContainerStyle('#fd7e14')}><FaCalendarPlus size={30} color="white" /></div>
                            <h3 style={titleStyle}>Agendar Cita</h3>
                            <span style={descStyle}>Reservar espacio</span>
                        </div>
                    </Link>

                    {/* 5. CAJA RÁPIDA */}
                    <Link href="/barbero/caja-rapida" style={{textDecoration:'none'}}>
                        <div style={cardStyle}>
                            <div style={iconContainerStyle('#D4AF37')}><FaMoneyBillWave size={30} color="black" /></div>
                            <h3 style={titleStyle}>Caja Rápida</h3>
                            <span style={descStyle}>Cobrar servicios</span>
                        </div>
                    </Link>

                    {/* 6. TIENDA (Ventas) */}
                    <Link href="/barbero/ventas" style={{textDecoration:'none'}}>
                        <div style={cardStyle}>
                            <div style={iconContainerStyle('#0D6EFD')}><FaShoppingBag size={30} color="white" /></div>
                            <h3 style={titleStyle}>Tienda</h3>
                            <span style={descStyle}>Vender productos</span>
                        </div>
                    </Link>

                    {/* 7. INSUMOS (Re-stock) */}
                    <Link href="/barbero/insumos" style={{textDecoration:'none'}}>
                        <div style={cardStyle}>
                            <div style={iconContainerStyle('#6c757d')}><FaBoxOpen size={30} color="white" /></div>
                            <h3 style={titleStyle}>Insumos</h3>
                            <span style={descStyle}>Revisar y reponer stock</span>
                        </div>
                    </Link>

                </div>
            </div>
        </>
    );
};

const cardStyle: React.CSSProperties = { backgroundColor: '#2A2A2A', borderRadius: '16px', padding: '25px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', border: '1px solid #444', cursor: 'pointer', height: '100%', justifyContent: 'center', gap: '15px' };
const iconContainerStyle = (color: string): React.CSSProperties => ({ backgroundColor: color, width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' });
const titleStyle: React.CSSProperties = { margin: 0, color: 'white', fontSize: '1.2rem' };
const descStyle: React.CSSProperties = { color: '#888', fontSize: '0.9rem' };

export default BarberDashboard;