// src/pages/citas.tsx
import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { FaCalendarAlt, FaTrashAlt, FaEdit, FaPlus, FaCheck, FaTimes } from 'react-icons/fa'; 
import AdminLayout from '@/components/AdminLayout';
import AddCitaModal from '@/components/AddCitaModal';
import EditCitaModal from '@/components/EditCitaModal'; 
import styles from '@/styles/Servicios.module.css';

interface Cita {
    id_cita: number;
    fecha: string;
    hora: string;
    estado: string;
    observaciones: string;
    nombre_cliente: string;
    nombre_barbero: string;
    nombre_servicio: string;
    id_bar: number;
    id_serv: number;
    id_clie: number;
}

const CitasAdminPage: NextPage = () => {
    const [citas, setCitas] = useState<Cita[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Estados de Modales
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingCita, setEditingCita] = useState<Cita | null>(null);

    // Cargar Citas
    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/citas');
            if (res.ok) {
                const data = await res.json();
                console.log("Datos recibidos en frontend:", data); // 🔍 Para depuración
                setCitas(data);
            }
        } catch (error) { 
            console.error(error); 
        } finally { 
            setLoading(false); 
        }
    };

    useEffect(() => { fetchData(); }, []);

    // Funciones de Acción
    const handleDelete = async (id: number) => {
        if (!confirm("¿Deseas eliminar esta cita permanentemente?")) return;
        try {
            await fetch(`/api/citas/${id}`, { method: 'DELETE' });
            fetchData();
        } catch(e) { alert("Error al eliminar"); }
    };

    const handleQuickStatus = async (id: number, nuevoEstado: string) => {
        if (!confirm(`¿Cambiar estado a: ${nuevoEstado}?`)) return;
        try {
            await fetch(`/api/citas/${id}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ estado: nuevoEstado, observaciones: `Cambio rápido a ${nuevoEstado}` })
            });
            fetchData();
        } catch(e) { alert("Error al actualizar"); }
    };

    // Formateador de Fecha seguro
    const formatDate = (dateString: string) => {
        if (!dateString) return "Sin fecha";
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
    };

    return (
        <>
            <Head><title>Agenda Global - Administración</title></Head>
            
            {isAddModalOpen && <AddCitaModal onClose={() => setIsAddModalOpen(false)} onSuccess={fetchData} />}
            
            {editingCita && (
                <EditCitaModal 
                    cita={editingCita} 
                    onClose={() => setEditingCita(null)} 
                    onSuccess={fetchData} 
                />
            )}

            <main> 
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <h1>
                        <FaCalendarAlt style={{ marginRight: '10px', color: 'var(--color-accent)' }} /> 
                        Agenda Global
                    </h1>
                    <button 
                        onClick={() => setIsAddModalOpen(true)} 
                        style={{ 
                            backgroundColor: 'var(--color-accent)', 
                            color: 'black', 
                            border: 'none', 
                            padding: '10px 15px', 
                            borderRadius: '6px', 
                            cursor: 'pointer', 
                            fontWeight: 'bold',
                            display: 'flex', alignItems: 'center', gap: '8px'
                        }}
                    >
                       <FaPlus /> Agendar Cita
                    </button>
                </div>
                
                <div className={styles.tableContainer}>
                    <table className={styles.serviciosTable}>
                        <thead>
                            <tr>
                                <th style={{color: 'white'}}>Fecha / Hora</th>
                                <th style={{color: 'white'}}>Barbero</th>
                                <th style={{color: 'white'}}>Cliente</th>
                                <th style={{color: 'white'}}>Servicio</th>
                                <th style={{color: 'white'}}>Estado</th>
                                <th style={{textAlign: 'center', color: 'white'}}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} style={{textAlign: 'center', padding: '20px', color: 'white'}}>Cargando agenda...</td></tr>
                            ) : (
                                citas.map((c) => (
                                    <tr key={c.id_cita}>
                                        {/* COLUMNA 1: FECHA Y HORA */}
                                        <td>
                                            <div style={{fontWeight: 'bold', color: 'white'}}>
                                                {formatDate(c.fecha)}
                                            </div>
                                            <div style={{color: 'var(--color-primary)', fontSize: '0.9em', fontWeight: 'bold'}}>
                                                {c.hora ? c.hora.substring(0,5) : '--:--'}
                                            </div>
                                        </td>
                                        
                                        {/* COLUMNA 2: BARBERO (Forzamos color blanco) */}
                                        <td style={{color: '#ddd', fontSize: '1.05em'}}>
                                            {c.nombre_barbero || 'Sin asignar'}
                                        </td> 
                                        
                                        {/* COLUMNA 3: CLIENTE (Forzamos color blanco) */}
                                        <td style={{color: '#ddd', fontSize: '1.05em'}}>
                                            {c.nombre_cliente || 'Cliente Anónimo'}
                                        </td>

                                        {/* COLUMNA 4: SERVICIO (Forzamos color blanco) */}
                                        <td style={{color: '#ddd'}}>
                                            {c.nombre_servicio || 'General'}
                                        </td>

                                        {/* COLUMNA 5: ESTADO */}
                                        <td>
                                            <span style={{
                                                padding: '4px 10px', borderRadius: '12px', fontSize: '0.85em', fontWeight: 'bold',
                                                backgroundColor: c.estado === 'Confirmada' ? '#28a745' : 
                                                               (c.estado === 'Pendiente' ? '#ffc107' : 
                                                               (c.estado === 'Cancelada' ? '#dc3545' : '#6c757d')),
                                                color: c.estado === 'Pendiente' ? 'black' : 'white'
                                            }}>
                                                {c.estado}
                                            </span>
                                        </td>

                                        {/* COLUMNA 6: ACCIONES */}
                                        <td className={styles.actionCell} style={{justifyContent: 'center', gap: '10px'}}>
                                            {c.estado === 'Confirmada' && (
                                                <button className={styles.actionButton} style={{color: '#28a745', border: '1px solid #28a745'}} onClick={() => handleQuickStatus(c.id_cita, 'Completada')} title="Marcar Completada">
                                                    <FaCheck />
                                                </button>
                                            )}

                                            <button className={styles.actionButton} style={{color: '#0D6EFD', border: '1px solid #0D6EFD'}} onClick={() => setEditingCita(c)} title="Editar Cita">
                                                <FaEdit />
                                            </button>

                                            <button className={styles.actionButton} style={{color: '#dc3545', border: '1px solid #dc3545'}} onClick={() => handleDelete(c.id_cita)} title="Eliminar">
                                                <FaTrashAlt />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                            {!loading && citas.length === 0 && (
                                <tr><td colSpan={6} style={{textAlign: 'center', padding: '30px', color: '#aaa'}}>No se encontraron citas.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </main>
        </>
    );
};

export default CitasAdminPage;