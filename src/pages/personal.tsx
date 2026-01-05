import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { FaUserTie, FaPlus, FaTrash, FaEye, FaEdit, FaUserSlash, FaCheckCircle, FaPhone } from 'react-icons/fa';
import BarberModal from '@/components/BarberModal'; 
import styles from '@/styles/Servicios.module.css';

interface Barbero {
    id_bar: number;
    nom_bar: string;
    apell_bar: string;
    tel_bar: string;
    email: string;
    estado: string; 
}

const PersonalPage: NextPage = () => {
    const router = useRouter();
    const [personal, setPersonal] = useState<Barbero[]>([]);
    const [loading, setLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBarbero, setSelectedBarbero] = useState<Barbero | null>(null);

    const fetchPersonal = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/personal');
            if (res.ok) setPersonal(await res.json());
        } catch (error) { console.error(error); } 
        finally { setLoading(false); }
    };

    useEffect(() => { fetchPersonal(); }, []);

    const handleCreate = () => {
        setSelectedBarbero(null);
        setIsModalOpen(true);
    };

    const handleEdit = (barbero: Barbero) => {
        setSelectedBarbero(barbero);
        setIsModalOpen(true);
    };

    const handleDelete = async (barbero: Barbero) => {
        const mensaje = `¿Gestionar baja de ${barbero.nom_bar}?\n\nSi tiene historial, pasará a INACTIVO para no perder datos contables.\nSi es nuevo, se eliminará permanentemente.`;
        if (!confirm(mensaje)) return;
        
        try {
            const res = await fetch(`/api/personal/${barbero.id_bar}`, { method: 'DELETE' });
            const data = await res.json();
            if (res.ok) { alert("✅ " + data.message); fetchPersonal(); } 
            else { alert("⚠️ " + data.message); }
        } catch (error) { alert("Error de conexión"); }
    };

    return (
        <>
            <Head><title>Gestión de Personal</title></Head>

            <BarberModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchPersonal}
                barberoToEdit={selectedBarbero}
            />

            <main style={{padding: 20}}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <h1 style={{margin:0, display:'flex', alignItems:'center', color:'white'}}>
                        <FaUserTie style={{ marginRight: '10px', color: 'var(--color-accent)' }} /> 
                        Equipo de Barberos
                    </h1>
                    <button 
                        onClick={handleCreate} 
                        style={{ backgroundColor: 'var(--color-accent)', color: 'black', border: 'none', padding: '10px 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 5 }}
                    >
                        <FaPlus /> Nuevo Barbero
                    </button>
                </div>

                <div className={styles.tableContainer}>
                    <table className={styles.serviciosTable} style={{width:'100%'}}>
                        <thead>
                            <tr>
                                <th>Nombre Completo</th>
                                <th>Contacto / Acceso</th>
                                <th style={{textAlign:'center'}}>Estado</th>
                                <th style={{textAlign: 'center'}}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={4} style={{textAlign: 'center', padding: 20, color:'white'}}>Cargando equipo...</td></tr>
                            ) : personal.length === 0 ? (
                                <tr><td colSpan={4} style={{textAlign: 'center', padding: 20, color:'#aaa'}}>No hay barberos registrados.</td></tr>
                            ) : (
                                personal.map((p) => {
                                    const esActivo = p.estado === 'Activo';
                                    return (
                                        <tr key={p.id_bar} style={{ opacity: esActivo ? 1 : 0.6, background: esActivo ? 'transparent' : 'rgba(0,0,0,0.3)' }}>
                                            
                                            <td style={{fontWeight: 'bold', color: 'black', fontSize:'1.1em'}}>
                                                {p.nom_bar} {p.apell_bar}
                                            </td>

                                            <td style={{color: '#000000ff'}}>
                                                <div style={{fontWeight:'bold', color:'black'}}>{p.email}</div>
                                                <div style={{fontSize:'0.85em', color:'#000000ff', display:'flex', alignItems:'center', gap:5}}>
                                                    <FaPhone size={10}/> {p.tel_bar || 'Sin teléfono'}
                                                </div>
                                            </td>

                                            <td style={{textAlign:'center'}}>
                                                <span style={{ 
                                                    padding: '4px 10px', borderRadius: '12px', fontSize: '0.85em', fontWeight: 'bold',
                                                    backgroundColor: esActivo ? 'rgba(40, 167, 69, 0.2)' : 'rgba(220, 53, 69, 0.2)', 
                                                    color: esActivo ? '#28a745' : '#dc3545', 
                                                    border: esActivo ? '1px solid #28a745' : '1px solid #dc3545',
                                                    display: 'inline-flex', alignItems: 'center', gap: 5
                                                }}>
                                                    {esActivo ? <FaCheckCircle size={10}/> : <FaUserSlash size={10}/>}
                                                    {esActivo ? 'ACTIVO' : 'BAJA'}
                                                </span>
                                            </td>

                                            <td className={styles.actionCell} style={{justifyContent: 'center', gap: '10px'}}>
                                                <button onClick={() => router.push(`/personal/${p.id_bar}`)} className={styles.actionButton} style={{color:'#0D6EFD', border:'1px solid #0D6EFD'}} title="Ver Rendimiento">
                                                    <FaEye />
                                                </button>
                                                <button onClick={() => handleEdit(p)} className={styles.actionButton} style={{color:'#ffc107', border:'1px solid #ffc107'}} title="Editar Datos">
                                                    <FaEdit />
                                                </button>
                                                <button onClick={() => handleDelete(p)} className={styles.actionButton} style={{color: esActivo ? '#dc3545' : '#666', border: esActivo ? '1px solid #dc3545' : '1px solid #666'}} title="Dar de Baja" disabled={!esActivo}>
                                                    <FaTrash />
                                                </button>
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

export default PersonalPage;