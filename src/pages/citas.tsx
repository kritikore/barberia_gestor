// src/pages/citas.tsx
import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { FaCalendarAlt, FaCheck, FaTimes } from 'react-icons/fa'; 

import layoutStyles from '@/styles/GlobalLayout.module.css';
import styles from '@/styles/Servicios.module.css'; // Reusamos estilos de tabla
import AddCitaModal from '@/components/AddCitaModal'; 

interface Cita {
    id_cita: number;
    fecha: string;
    hora: string;
    estado: string;
    nombre_cliente: string;
    nombre_barbero: string;
    nombre_servicio: string;
}

const CitasPage: NextPage = () => {
    const moduleName = "Citas"; 
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [citas, setCitas] = useState<Cita[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/citas');
            if (!res.ok) throw new Error('Error al cargar citas');
            const data = await res.json();
            setCitas(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleComplete = async (id: number) => {
        if (!confirm(`¿Marcar cita como completada?`)) return;
        
        try {
            const res = await fetch(`/api/citas/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ estado: 'Completada', observaciones: 'Finalizado por admin.' })
            });
            if (!res.ok) throw new Error('Error al completar');
            fetchData(); 
        } catch (error: any) {
            alert(`Error: ${error.message}`);
        }
    };

    return (
        <>
            <Head><title>{moduleName} - Barbería Gestor</title></Head>
            
            {isModalOpen && <AddCitaModal onClose={() => setIsModalOpen(false)} onSuccess={fetchData} />}

            <main className={layoutStyles.mainContent}> 
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <h1><FaCalendarAlt style={{ marginRight: '10px', color: 'var(--color-accent)' }} /> Agenda de Citas</h1>
                    <button onClick={() => setIsModalOpen(true)} style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-background)', border: 'none', padding: '10px 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>+ Agendar Nueva Cita</button>
                </div>
                
                <div className={styles.tableContainer}>
                    <table className={styles.serviciosTable}>
                        <thead>
                            <tr>
                                <th>Cliente</th>
                                <th>Servicio</th>
                                <th>Barbero</th>
                                <th>Fecha</th>
                                <th>Hora</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (<tr><td colSpan={7} style={{textAlign: 'center'}}>Cargando...</td></tr>) : (
                                citas.map((c) => (
                                    <tr key={c.id_cita}>
                                        <td>{c.nombre_cliente}</td>
                                        <td>{c.nombre_servicio}</td>
                                        <td>{c.nombre_barbero}</td>
                                        <td>{new Date(c.fecha).toLocaleDateString('es-MX')}</td>
                                        <td>{c.hora}</td>
                                        <td>{c.estado}</td>
                                        <td className={styles.actionCell}>
                                            {c.estado === 'Confirmada' && (
                                                <button className={`${styles.actionButton} ${styles.editIcon}`} style={{color: '#28a745'}} onClick={() => handleComplete(c.id_cita)}><FaCheck /></button>
                                            )}
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

export default CitasPage;