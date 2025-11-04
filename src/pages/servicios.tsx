// src/pages/servicios.tsx
import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { FaCut, FaEdit, FaTrashAlt } from 'react-icons/fa';

import layoutStyles from '@/styles/GlobalLayout.module.css'; 
import styles from '@/styles/Servicios.module.css'; 
import ServiceModal from '@/components/ServiceModal'; 

// Interfaz actualizada (sin duración)
interface Servicio {
    id_serv: number;
    tipo: string;
    precio: string;
    descripcion: string;
}

const ServiciosPage: NextPage = () => {
    const moduleName = "Servicios"; 

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [serviceToEdit, setServiceToEdit] = useState<Servicio | null>(null);
    const [servicios, setServicios] = useState<Servicio[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/servicios');
            if (!res.ok) throw new Error('Error al cargar servicios');
            const data = await res.json();
            setServicios(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // --- Funciones de Acciones (CRUD) ---
    const handleAdd = () => {
        setServiceToEdit(null); 
        setIsModalOpen(true);
    };
    const handleEdit = (servicio: Servicio) => {
        setServiceToEdit(servicio);
        setIsModalOpen(true);
    };
    const handleDelete = async (id: number) => {
        if (confirm(`¿Seguro que quieres eliminar este servicio?`)) {
            try {
                const res = await fetch(`/api/servicios/${id}`, { method: 'DELETE' });
                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.message);
                }
                fetchData(); 
            } catch (error: any) {
                alert(`Error: ${error.message}`);
            }
        }
    };

    return (
        <>
            <Head>
                <title>{moduleName} - Barbería Gestor</title>
            </Head>
            
            {isModalOpen && (
                <ServiceModal
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={fetchData} 
                    serviceToEdit={serviceToEdit}
                />
            )}

            <main className={layoutStyles.mainContent}> 
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <h1>
                        <FaCut style={{ marginRight: '10px', color: 'var(--color-accent)' }} /> 
                        Gestión de Servicios
                    </h1>
                    <button onClick={handleAdd} style={{ /* Estilos del botón + Añadir */ }}>
                       + Añadir Nuevo Servicio
                    </button>
                </div>
                
                <p style={{ color: '#aaa', marginBottom: '40px' }}>
                    Define los servicios y precios que ofrece la barbería.
                </p>

                {/* Tabla de Servicios (Sin Duración) */}
                <div className={styles.tableContainer}>
                    <table className={styles.serviciosTable}>
                        <thead>
                            <tr>
                                <th>Servicio (Tipo)</th>
                                <th>Descripción</th>
                                <th>Precio</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={4} style={{textAlign: 'center'}}>Cargando...</td></tr>
                            ) : (
                                servicios.map((s) => (
                                    <tr key={s.id_serv}>
                                        <td>{s.tipo}</td>
                                        <td>{s.descripcion || 'N/A'}</td>
                                        <td>${parseFloat(s.precio).toFixed(2)}</td>
                                        <td className={styles.actionCell}>
                                            <button className={`${styles.actionButton} ${styles.editIcon}`} onClick={() => handleEdit(s)}>
                                                <FaEdit />
                                            </button>
                                            <button className={`${styles.actionButton} ${styles.deleteIcon}`} onClick={() => handleDelete(s.id_serv)}>
                                                <FaTrashAlt />
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

export default ServiciosPage;