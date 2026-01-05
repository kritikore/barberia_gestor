import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { FaUsers, FaPlus, FaPhone, FaArrowLeft, FaCalendarPlus, FaPen, FaTrash, FaUserCircle } from 'react-icons/fa';
import { useBarbero } from '@/hooks/useBarbero';
import ClientModal from '@/components/ClientModal';
import ClientDetailModal from '@/components/ClientDetailModal';
import AddCitaModal from '@/components/AddCitaModal';
import styles from '@/styles/Servicios.module.css';

const ClientesBarberoPage: NextPage = () => {
    const router = useRouter();
    const { barbero, loading: sessionLoading } = useBarbero();
    
    const [clientes, setClientes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
    const [clientToSchedule, setClientToSchedule] = useState<any | null>(null); 

    const fetchMisClientes = async () => {
        if (!barbero) return;
        setLoading(true);
        try {
            const res = await fetch('/api/clientes');
            if (res.ok) {
                const data = await res.json();
                const misClientes = data.filter((c: any) => Number(c.id_bar) === Number(barbero.id_bar));
                setClientes(misClientes); 
            }
        } catch (error) { 
            console.error(error); 
        } finally { 
            setLoading(false); 
        }
    };

    useEffect(() => { if (barbero) fetchMisClientes(); }, [barbero]);

    const renderFoto = (fotoData: any) => {
        if (!fotoData) return null;
        if (fotoData.type === 'Buffer' && Array.isArray(fotoData.data)) {
            const base64String = Buffer.from(fotoData.data).toString('base64');
            return `data:image/jpeg;base64,${base64String}`;
        }
        if (typeof fotoData === 'string') return fotoData;
        return null;
    };

    const handleDelete = async (id: number) => {
        if (!confirm("¿Eliminar cliente de tu lista?")) return;
        try {
            const res = await fetch(`/api/clientes/${id}`, { method: 'DELETE' });
            if (res.ok) fetchMisClientes();
        } catch (error) { console.error(error); }
    };

    if (sessionLoading || !barbero) return <div style={{color:'black', padding:50}}>Cargando...</div>;

    return (
        <>
            <Head><title>Mi Directorio</title></Head>

            {/* Estilos Responsivos Dinámicos */}
            <style jsx>{`
                .header-container {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 30px;
                    flex-wrap: wrap;
                    gap: 15px;
                }
                .mobile-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 15px;
                }
                @media (max-width: 768px) {
                    .desktop-table { display: none; }
                    .header-container h1 { font-size: 1.5rem; }
                    .add-btn { width: 100%; justify-content: center; }
                }
                @media (min-width: 769px) {
                    .mobile-cards { display: none; }
                }
                .client-card {
                    background: white;
                    border-radius: 12px;
                    padding: 15px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
                    transition: transform 0.2s;
                }
                .client-card:active { transform: scale(0.98); }
            `}</style>

            {isAddModalOpen && <ClientModal onClose={() => setIsAddModalOpen(false)} onSuccess={fetchMisClientes} fixedBarberId={barbero.id_bar} />}
            {selectedClientId && <ClientDetailModal clientId={selectedClientId} onClose={() => setSelectedClientId(null)} onUpdateSuccess={fetchMisClientes} />}
            {clientToSchedule && (
                <AddCitaModal 
                    onClose={() => setClientToSchedule(null)}
                    onSuccess={() => { alert(`Cita agendada para ${clientToSchedule.nom_clie}`); setClientToSchedule(null); }}
                    preSelectedClientId={clientToSchedule.id_clie}
                    preSelectedClientName={`${clientToSchedule.nom_clie} ${clientToSchedule.apell_clie}`}
                />
            )}

            <main style={{ padding: '10px' }}>
                <div className="header-container">
                    <div style={{display:'flex', alignItems:'center', gap: 15}}>
                        <button onClick={() => router.back()} style={{background:'none', border:'none', color:'#000', cursor:'pointer', fontSize:'1.2rem'}}><FaArrowLeft /></button>
                        <h1 style={{margin:0}}><FaUsers style={{marginRight:10, color:'var(--color-accent)'}}/> Mi Directorio</h1>
                    </div>
                    <button className="add-btn" onClick={() => setIsAddModalOpen(true)} style={{backgroundColor:'var(--color-accent)', color:'black', border:'none', padding:'12px 20px', borderRadius:'8px', cursor:'pointer', fontWeight:'bold', display:'flex', alignItems:'center', gap:'8px'}}>
                       <FaPlus /> <span className="btn-text">Nuevo Cliente</span>
                    </button>
                </div>

                {/* VISTA MÓVIL (Tarjetas) */}
                <div className="mobile-cards mobile-grid">
                    {loading ? (
                        <p style={{textAlign:'center', color:'black'}}>Cargando cartera...</p>
                    ) : clientes.length === 0 ? (
                        <p style={{textAlign:'center', color:'black'}}>Tu cartera está vacía.</p>
                    ) : (
                        clientes.map((cli) => (
                            <div key={cli.id_clie} className="client-card">
                                <div style={{display:'flex', alignItems:'center', gap: 12}} onClick={() => setSelectedClientId(cli.id_clie)}>
                                    <div style={{width: '50px', height: '50px', borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f0f0', border: '2px solid var(--color-accent)'}}>
                                        {renderFoto(cli.foto) ? <img src={renderFoto(cli.foto)!} style={{width: '100%', height: '100%', objectFit: 'cover'}} /> : <FaUserCircle size={30} color="#ccc" />}
                                    </div>
                                    <div>
                                        <div style={{fontWeight:'bold', color:'black'}}>{cli.nom_clie}</div>
                                        <div style={{fontSize:'0.85rem', color:'#666'}}><FaPhone size={10}/> {cli.tel_clie}</div>
                                    </div>
                                </div>
                                <div style={{display:'flex', gap: 8}}>
                                    <button onClick={() => setClientToSchedule(cli)} style={{background: '#28a745', border: 'none', borderRadius: '8px', padding: '10px', color: 'white'}}><FaCalendarPlus /></button>
                                    <button onClick={() => setSelectedClientId(cli.id_clie)} style={{background: '#0D6EFD', border: 'none', borderRadius: '8px', padding: '10px', color: 'white'}}><FaPen /></button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* VISTA DESKTOP (Tabla original mejorada) */}
                <div className={`desktop-table ${styles.tableContainer}`}>
                    <table className={styles.serviciosTable}>
                        <thead>
                            <tr>
                                <th style={{width: '60px'}}></th>
                                <th>Nombre</th>
                                <th>Teléfono</th>
                                <th style={{textAlign: 'center'}}>Acciones Rápidas</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={4} style={{textAlign:'center', padding:20, color:'black'}}>Cargando...</td></tr>
                            ) : (
                                clientes.map((cli) => (
                                    <tr key={cli.id_clie}>
                                        <td onClick={() => setSelectedClientId(cli.id_clie)} style={{cursor:'pointer'}}>
                                            <div style={{width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#eee', border: '2px solid var(--color-accent)'}}>
                                                {renderFoto(cli.foto) ? <img src={renderFoto(cli.foto)!} style={{width: '100%', height: '100%', objectFit: 'cover'}} /> : <FaUserCircle size={25} color="#ccc" />}
                                            </div>
                                        </td>
                                        <td style={{fontWeight:'bold', color:'black'}}>{cli.nom_clie} {cli.apell_clie}</td>
                                        <td style={{color:'black'}}><FaPhone size={12} style={{marginRight:5}}/>{cli.tel_clie}</td>
                                        <td>
                                            <div style={{display:'flex', gap:'8px', justifyContent:'center'}}>
                                                <button onClick={() => setClientToSchedule(cli)} style={{background: '#28a745', border: 'none', borderRadius: '6px', padding: '8px', color: 'white', cursor: 'pointer'}}><FaCalendarPlus /></button>
                                                <button onClick={() => setSelectedClientId(cli.id_clie)} style={{background: '#0D6EFD', border: 'none', borderRadius: '6px', padding: '8px', color: 'white', cursor: 'pointer'}}><FaPen /></button>
                                                <button onClick={() => handleDelete(cli.id_clie)} style={{background: '#dc3545', border: 'none', borderRadius: '6px', padding: '8px', color: 'white', cursor: 'pointer'}}><FaTrash /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </main>
        </>
    );
};

export default ClientesBarberoPage;