import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { FaUserTie, FaPlus, FaTrash, FaEye, FaEdit } from 'react-icons/fa';
import AdminLayout from '@/components/AdminLayout';
import BarberModal from '@/components/BarberModal'; // Importamos el modal
import styles from '@/styles/Servicios.module.css';

interface Barbero {
    id_bar: number;
    nom_bar: string;
    apell_bar: string;
    tel_bar: string;
    email: string;
    estado: string | boolean; // Manejo flexible del tipo de dato
}

const PersonalPage: NextPage = () => {
    const router = useRouter();
    const [personal, setPersonal] = useState<Barbero[]>([]);
    const [loading, setLoading] = useState(true);

    // Estados para el Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBarbero, setSelectedBarbero] = useState<Barbero | null>(null);

    const fetchPersonal = async () => {
        try {
            const res = await fetch('/api/personal');
            if (res.ok) {
                const data = await res.json();
                setPersonal(data);
            }
        } catch (error) { console.error(error); } 
        finally { setLoading(false); }
    };

    useEffect(() => { fetchPersonal(); }, []);

    // Abrir modal para CREAR
    const handleCreate = () => {
        setSelectedBarbero(null);
        setIsModalOpen(true);
    };

    // Abrir modal para EDITAR
    const handleEdit = (barbero: Barbero) => {
        setSelectedBarbero(barbero);
        setIsModalOpen(true);
    };

    // Helper para determinar si está activo (Manejo robusto de estado)
    const isActivo = (estado: any) => {
        if (estado === true) return true;
        if (typeof estado === 'string' && estado.toLowerCase() === 'activo') return true;
        return false;
    };

    // --- LÓGICA DE ELIMINACIÓN INTELIGENTE ---
    const handleDelete = async (barbero: Barbero) => {
      // Mensaje único y claro
        const mensaje = `¿Estás seguro de eliminar a ${barbero.nom_bar}?\n\nSi tiene ventas registradas, el sistema conservará los datos contables pero el barbero desaparecerá de esta lista definitivamente.`;

        if (!confirm(mensaje)) return;
        
        try {
            const response = await fetch(`/api/personal/${barbero.id_bar}`, { method: 'DELETE' });
            const data = await response.json();

            if (response.ok) {
                alert(`✅ ${data.message}`);
                fetchPersonal(); // Se recarga la lista y el 'Eliminado' ya no aparecerá
            } else {
                alert(`⚠️ ${data.message}`);
            }
        } catch (error) { alert("Error de conexión."); }
    };

    return (
        <>
            <Head><title>Gestión de Personal</title></Head>

            {/* MODAL INTEGRADO PARA CREAR/EDITAR */}
            <BarberModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchPersonal}
                barberoToEdit={selectedBarbero}
            />

            <main>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <h1><FaUserTie style={{ marginRight: '10px', color: 'var(--color-accent)' }} /> Equipo de Barberos</h1>
                    
                    {/* Botón Nuevo Barbero */}
                    <button 
                        onClick={handleCreate} 
                        style={{ backgroundColor: 'var(--color-accent)', color: 'black', border: 'none', padding: '10px 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 5 }}
                    >
                        <FaPlus /> Nuevo Barbero
                    </button>
                </div>

                <div className={styles.tableContainer}>
                    <table className={styles.serviciosTable}>
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Email</th>
                                <th>Estado</th>
                                <th style={{textAlign: 'center'}}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={4} style={{textAlign: 'center', padding: 20}}>Cargando equipo...</td></tr>
                            ) : (
                                personal.map((p) => {
                                    const activo = isActivo(p.estado);
                                    return (
                                        <tr key={p.id_bar} style={{ opacity: activo ? 1 : 0.75, backgroundColor: activo ? 'transparent' : 'rgba(0,0,0,0.2)' }}>
                                            <td style={{fontWeight: 'bold', color: 'white'}}>{p.nom_bar} {p.apell_bar}</td>
                                            <td>{p.email}</td>
                                            <td>
                                                <span style={{ 
                                                    padding: '4px 8px', borderRadius: '4px', fontSize: '0.85em', 
                                                    backgroundColor: activo ? 'rgba(40, 167, 69, 0.2)' : 'rgba(108, 117, 125, 0.2)', 
                                                    color: activo ? '#28a745' : '#aaa', 
                                                    border: activo ? '1px solid #28a745' : '1px solid #666',
                                                    fontWeight: 'bold'
                                                }}>
                                                    {activo ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </td>
                                            <td className={styles.actionCell} style={{justifyContent: 'center', gap: '10px'}}>
                                                
                                                {/* 1. Ver Detalle (Insumos) */}
                                                <button 
                                                    onClick={() => router.push(`/personal/${p.id_bar}`)} 
                                                    className={styles.actionButton} 
                                                    title="Ver Insumos y Rendimiento"
                                                >
                                                    <FaEye color="#0D6EFD"/>
                                                </button>
                                                
                                                {/* 2. Editar (Modal) */}
                                                <button 
                                                    onClick={() => handleEdit(p)} 
                                                    className={styles.actionButton} 
                                                    title="Editar Datos de Acceso"
                                                >
                                                    <FaEdit color="#ffc107"/>
                                                </button>

                                                {/* 3. Eliminar / Desactivar (INTELIGENTE) */}
                                                <button 
                                                    onClick={() => handleDelete(p)} 
                                                    className={styles.actionButton} 
                                                    title={activo ? "Desactivar (Baja Lógica)" : "Eliminar Definitivamente"}
                                                >
                                                    <FaTrash color={activo ? "#ffc107" : "#dc3545"} />
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