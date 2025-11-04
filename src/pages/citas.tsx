// src/pages/citas.tsx
import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { FaCalendarAlt, FaCheck, FaTimes } from 'react-icons/fa'; // Iconos

import layoutStyles from '@/styles/GlobalLayout.module.css';
import styles from '@/styles/Servicios.module.css'; // Reutilizamos el CSS de la tabla
import AddCitaModal from '@/components/AddCitaModal'; 

// Interfaz para la Cita (de la API GET)
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

    // 🔑 REQ-C5 y REQ-C6: Funcionalidad futura para el barbero
    const handleComplete = (id: number) => {
        alert(`Acción: Marcar Cita ${id} como 'Completada' y mover a SERVICIO_REALIZADO. (Esto actualizará el Dashboard)`);
        // Aquí iría el fetch a PUT /api/citas/[id] { estado: 'Completada' }
        // Y el fetch a POST /api/servicios-realizados
    };

    return (
        <>
            <Head>
                <title>{moduleName} - Barbería Gestor</title>
            </Head>
            
            {isModalOpen && (
                <AddCitaModal
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={fetchData} // Refresca los datos al añadir
                />
            )}

            <main className={layoutStyles.mainContent}> 
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <h1>
                        <FaCalendarAlt style={{ marginRight: '10px', color: 'var(--color-accent)' }} /> 
                        Agenda de Citas
                    </h1>
                    <button onClick={() => setIsModalOpen(true)} style={{ /* Estilos del botón + Añadir */ }}>
                       + Agendar Nueva Cita
                    </button>
                </div>
                
                <p style={{ color: '#aaa', marginBottom: '40px' }}>
                    Administra las citas pendientes y futuras de los clientes.
                </p>

                {/* Tabla de Citas (REQ-C7) */}
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
                            {loading ? (
                                <tr><td colSpan={7} style={{textAlign: 'center'}}>Cargando citas...</td></tr>
                            ) : (
                                citas.map((c) => (
                                    <tr key={c.id_cita}>
                                        <td>{c.nombre_cliente}</td>
                                        <td>{c.nombre_servicio}</td>
                                        <td>{c.nombre_barbero}</td>
                                        <td>{new Date(c.fecha).toLocaleDateString()}</td>
                                        <td>{c.hora}</td>
                                        <td>{c.estado}</td>
                                        <td className={styles.actionCell}>
                                            <button 
                                                title="Marcar como Completada"
                                                className={`${styles.actionButton} ${styles.editIcon}`} 
                                                onClick={() => handleComplete(c.id_cita)}>
                                                <FaCheck />
                                            </button>
                                            <button 
                                                title="Cancelar Cita"
                                                className={`${styles.actionButton} ${styles.deleteIcon}`}>
                                                <FaTimes />
                                            </button>
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