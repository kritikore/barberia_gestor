import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { FaUsers, FaPlus, FaTrash, FaUser, FaPhone, FaUserTie, FaPen } from 'react-icons/fa';
import ClientModal from '@/components/ClientModal';
import ClientDetailModal from '@/components/ClientDetailModal';
import styles from '@/styles/Servicios.module.css';

interface Cliente {
    id_clie: number;
    nom_clie: string;
    apell_clie: string;
    tel_clie: string;
    email_clie: string;
    ocupacion: string;
    edad_clie: number;
    foto?: any;
    nom_bar?: string;
    apell_bar?: string;
}

const ClientesPage: NextPage = () => {
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedClientId, setSelectedClientId] = useState<number | null>(null);

    const fetchClientes = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/clientes');
            if (res.ok) setClientes(await res.json());
        } catch (error) { console.error(error); } 
        finally { setLoading(false); }
    };

    useEffect(() => { fetchClientes(); }, []);

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
        if (!confirm("¿Estás seguro de eliminar este cliente permanentemente?")) return;
        try {
            const res = await fetch(`/api/clientes/${id}`, { method: 'DELETE' });
            if (res.ok) fetchClientes();
            else alert("Error al eliminar");
        } catch (error) { console.error(error); }
    };

    return (
        <>
            <Head><title>Cartera Global</title></Head>

            {isAddModalOpen && <ClientModal onClose={() => setIsAddModalOpen(false)} onSuccess={fetchClientes} />}
            {selectedClientId && <ClientDetailModal clientId={selectedClientId} onClose={() => setSelectedClientId(null)} onUpdateSuccess={fetchClientes} />}

            <main>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <h1 style={{margin:0, display:'flex', alignItems:'center'}}>
                        <FaUsers style={{ marginRight: '10px', color: 'var(--color-accent)' }} /> Cartera Global
                    </h1>
                    <button onClick={() => setIsAddModalOpen(true)} style={{ backgroundColor: 'var(--color-accent)', color: 'black', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                                <th>Cartera de</th>
                                <th style={{textAlign: 'center'}}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {clientes.map((cli) => {
                                const avatarSrc = renderFoto(cli.foto);
                                return (
                                    <tr key={cli.id_clie}>
                                        <td onClick={() => setSelectedClientId(cli.id_clie)} style={{cursor:'pointer'}}>
                                            <div style={{width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#333', border: '2px solid var(--color-accent)'}}>
                                                {avatarSrc ? <img src={avatarSrc} style={{width: '100%', height: '100%', objectFit: 'cover'}} /> : <FaUser size={20} color="#666" />}
                                            </div>
                                        </td>
                                        <td style={{fontWeight:'bold', color:'black'}}>{cli.nom_clie} {cli.apell_clie}</td>
                                        <td style={{color:'#ccc'}}><FaPhone size={12} style={{marginRight:5}}/>{cli.tel_clie}</td>
                                        <td>
                                            {cli.nom_bar ? (
                                                <div style={{display:'flex', alignItems:'center', gap:5, background:'rgba(13, 110, 253, 0.2)', padding:'4px 8px', borderRadius:'12px', width:'fit-content', border:'1px solid rgba(13, 110, 253, 0.4)'}}>
                                                    <FaUserTie size={12} color="#0d6efd"/>
                                                    <span style={{color:'#6ea8fe', fontSize:'0.85em'}}>{cli.nom_bar}</span>
                                                </div>
                                            ) : <span style={{color:'#555', fontStyle:'italic'}}>Sin asignar</span>}
                                        </td>
                                        
                                        {/* ACCIONES ADMIN: EDITAR | ELIMINAR */}
                                        <td>
                                            <div style={{display:'flex', gap:'8px', justifyContent:'center'}}>
                                                <button 
                                                    onClick={() => setSelectedClientId(cli.id_clie)}
                                                    title="Ver/Editar"
                                                    style={{background: '#0D6EFD', border: 'none', borderRadius: '6px', padding: '8px', color: 'white', cursor: 'pointer'}}
                                                >
                                                    <FaPen />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(cli.id_clie)}
                                                    title="Eliminar"
                                                    style={{background: '#dc3545', border: 'none', borderRadius: '6px', padding: '8px', color: 'white', cursor: 'pointer'}}
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </main>
        </>
    );
};

export default ClientesPage;