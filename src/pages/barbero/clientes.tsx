import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { FaUsers, FaPlus, FaPhone, FaArrowLeft } from 'react-icons/fa';
import AdminLayout from '@/components/AdminLayout'; 
import ClientModal from '@/components/ClientModal';
import ClientDetailModal from '@/components/ClientDetailModal';
import { useBarbero } from '@/hooks/useBarbero'; // 👈 Hook
import styles from '@/styles/Servicios.module.css';

const ClientesBarberoPage: NextPage = () => {
    const router = useRouter();
    const { barbero, loading: sessionLoading } = useBarbero();
    
    const [clientes, setClientes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedClientId, setSelectedClientId] = useState<number | null>(null);

    const fetchMisClientes = async () => {
        if (!barbero) return;
        setLoading(true);
        try {
            const res = await fetch('/api/clientes');
            if (res.ok) {
                const data = await res.json();
                // 🔍 FILTRO REAL: Solo clientes asignados a MI ID
                const misClientes = data.filter((c: any) => c.id_bar === barbero.id_bar);
                setClientes(misClientes);
            }
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    useEffect(() => { if (barbero) fetchMisClientes(); }, [barbero]);

    if (sessionLoading || !barbero) return <div style={{color:'white', padding:50}}>Cargando...</div>;

    return (
        <>
            <Head><title>Mi Directorio</title></Head>

            {isAddModalOpen && (
                <ClientModal 
                    onClose={() => setIsAddModalOpen(false)} 
                    onSuccess={fetchMisClientes}
                    fixedBarberId={barbero.id_bar} // 👈 Auto-asignación
                />
            )}

            {selectedClientId && (
                <ClientDetailModal 
                    clientId={selectedClientId}
                    onClose={() => setSelectedClientId(null)}
                    onUpdateSuccess={fetchMisClientes}
                />
            )}

            <main>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <div style={{display:'flex', alignItems:'center', gap: 15}}>
                        <button onClick={() => router.back()} style={{background:'none', border:'none', color:'#aaa', cursor:'pointer', fontSize:'1.2rem'}}><FaArrowLeft /></button>
                        <h1 style={{margin:0}}><FaUsers style={{marginRight:10, color:'var(--color-accent)'}}/> Mi Directorio</h1>
                    </div>
                    <button onClick={() => setIsAddModalOpen(true)} style={{backgroundColor:'var(--color-accent)', color:'black', border:'none', padding:'10px 20px', borderRadius:'8px', cursor:'pointer', fontWeight:'bold', display:'flex', alignItems:'center', gap:'8px'}}>
                       <FaPlus /> Nuevo Cliente
                    </button>
                </div>

                <div className={styles.tableContainer}>
                    <table className={styles.serviciosTable}>
                        <thead>
                            <tr><th>Nombre</th><th>Teléfono</th><th>Ocupación</th></tr>
                        </thead>
                        <tbody>
                            {clientes.map((cli) => (
                                <tr key={cli.id_clie} onClick={() => setSelectedClientId(cli.id_clie)} style={{cursor:'pointer'}}>
                                    <td style={{fontWeight:'bold', color:'white'}}>{cli.nom_clie} {cli.apell_clie}</td>
                                    <td style={{color:'#ccc'}}><FaPhone size={12} style={{marginRight:5}}/>{cli.tel_clie}</td>
                                    <td style={{color:'#aaa'}}>{cli.ocupacion || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </>
    );
};
export default ClientesBarberoPage;