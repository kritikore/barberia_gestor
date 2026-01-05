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

    // 🔍 AQUÍ ESTÁ LA CORRECCIÓN CLAVE
    const fetchMisClientes = async () => {
        if (!barbero) return;
        setLoading(true);
        try {
            const res = await fetch('/api/clientes');
            if (res.ok) {
                const data = await res.json();
                
                // FILTRADO ESTRICTO: Solo clientes asignados a ESTE barbero
                // Usamos Number() para asegurar que coincidan aunque uno sea string y otro int
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

            <main>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <div style={{display:'flex', alignItems:'center', gap: 15}}>
                        <button onClick={() => router.back()} style={{background:'none', border:'none', color:'#000000ff', cursor:'pointer', fontSize:'1.2rem'}}><FaArrowLeft /></button>
                        <h1 style={{margin:0}}><FaUsers style={{marginRight:10, color:'var(--color-accent)'}}/> Mi Directorio</h1>
                    </div>
                    <button onClick={() => setIsAddModalOpen(true)} style={{backgroundColor:'var(--color-accent)', color:'black', border:'none', padding:'10px 20px', borderRadius:'8px', cursor:'pointer', fontWeight:'bold', display:'flex', alignItems:'center', gap:'8px'}}>
                       <FaPlus /> Nuevo Cliente
                    </button>
                </div>

                <div className={styles.tableContainer}>
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
                                <tr><td colSpan={4} style={{textAlign:'center', padding:20, color:'black'}}>Cargando cartera...</td></tr>
                            ) : clientes.length === 0 ? (
                                <tr><td colSpan={4} style={{textAlign:'center', padding:30, color:'#000000ff'}}>Tu cartera está vacía. ¡Agrega tu primer cliente!</td></tr>
                            ) : (
                                clientes.map((cli) => {
                                    const avatarSrc = renderFoto(cli.foto);
                                    return (
                                        <tr key={cli.id_clie}>
                                            <td onClick={() => setSelectedClientId(cli.id_clie)} style={{cursor:'pointer'}}>
                                                <div style={{width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0b0b0bff', border: '2px solid var(--color-accent)'}}>
                                                    {avatarSrc ? <img src={avatarSrc} style={{width: '100%', height: '100%', objectFit: 'cover'}} /> : <FaUserCircle size={25} color="#000000ff" />}
                                                </div>
                                            </td>
                                            <td style={{fontWeight:'bold', color:'black'}}>{cli.nom_clie} {cli.apell_clie}</td>
                                            <td style={{color:'#020202ff'}}><FaPhone size={12} style={{marginRight:5}}/>{cli.tel_clie}</td>

                                            {/* ACCIONES BARBERO */}
                                            <td>
                                                <div style={{display:'flex', gap:'8px', justifyContent:'center'}}>
                                                    
                                                    {/* 1. AGENDAR */}
                                                    <button 
                                                        title="Agendar Cita"
                                                        onClick={() => setClientToSchedule(cli)}
                                                        style={{background: '#28a745', border: 'none', borderRadius: '6px', padding: '8px', color: 'white', cursor: 'pointer'}}
                                                    >
                                                        <FaCalendarPlus />
                                                    </button>

                                                    {/* 2. EDITAR */}
                                                    <button 
                                                        title="Ver/Editar"
                                                        onClick={() => setSelectedClientId(cli.id_clie)}
                                                        style={{background: '#0D6EFD', border: 'none', borderRadius: '6px', padding: '8px', color: 'white', cursor: 'pointer'}}
                                                    >
                                                        <FaPen />
                                                    </button>

                                                    {/* 3. ELIMINAR */}
                                                    <button 
                                                        title="Eliminar"
                                                        onClick={() => handleDelete(cli.id_clie)}
                                                        style={{background: '#dc3545', border: 'none', borderRadius: '6px', padding: '8px', color: 'white', cursor: 'pointer'}}
                                                    >
                                                        <FaTrash />
                                                    </button>

                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </main>
        </>
    );
};

export default ClientesBarberoPage;