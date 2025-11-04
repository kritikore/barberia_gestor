// src/pages/personal.tsx
import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { FaUserTie } from 'react-icons/fa';

import layoutStyles from '@/styles/GlobalLayout.module.css';
import styles from '@/styles/Personal.module.css'; 
import AddBarberModal from '@/components/AddBarberModal';
import BarberCard from '@/components/BarberCard';

// 🔑 Interfaz para los datos de la API (DEBE INCLUIR EDAD)
interface BarberData {
    id_bar: number;
    nom_bar: string;
    apell_bar: string;
    tel_bar: string;
    edad_bar: number; // ⬅️ 🔑 CORRECCIÓN: Esta línea faltaba
    email: string;
    estado: 'Activo' | 'Inactivo';
    posicion: string;
    fecha_contratacion: string;
    serviciosMes: string;
    ingresosGenerados: string;
}

// Interfaz para las Métricas
interface Metrics {
    total: number;
    activos: number;
    inactivos: number;
}

const PersonalPage: NextPage = () => {
    const moduleName = "Personal"; 

    // Estados
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [barberToEdit, setBarberToEdit] = useState<BarberData | null>(null);
    const [barbers, setBarbers] = useState<BarberData[]>([]);
    const [metrics, setMetrics] = useState<Metrics>({ total: 0, activos: 0, inactivos: 0 });
    const [loading, setLoading] = useState(true);

    // Función para cargar/refrescar TODOS los datos
    const fetchData = async () => {
        setLoading(true);
        try {
            const [metricsRes, barbersRes] = await Promise.all([
                fetch('/api/personal/metrics'),
                fetch('/api/personal')
            ]);
            
            if (!metricsRes.ok || !barbersRes.ok) {
                throw new Error('Error al cargar datos del personal');
            }

            setMetrics(await metricsRes.json());
            setBarbers(await barbersRes.json());

        } catch (error) {
            console.error("Error cargando datos de personal:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // --- Funciones de Acciones (Modales y Delete) ---
    
    // Abrir modal para AÑADIR
    const handleAddBarber = () => {
        setBarberToEdit(null); // Asegura que no estemos editando
        setIsModalOpen(true);
    };

    // Abrir modal para EDITAR
    const handleEditBarber = (barber: BarberData) => {
        setBarberToEdit(barber);
        setIsModalOpen(true);
    };

    // Acción de ELIMINAR (Soft Delete)
    const handleDeleteBarber = async (id: number) => {
        if (confirm(`¿Seguro que quieres desactivar a este barbero?`)) {
            try {
                const response = await fetch(`/api/personal/${id}`, { method: 'DELETE' });
                if (!response.ok) throw new Error('No se pudo desactivar');
                fetchData(); // Refresca la lista
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
                <AddBarberModal
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={fetchData} 
                    barberToEdit={barberToEdit} // ⬅️ 🔑 Ahora 'barberToEdit' (tipo BarberData) coincide con lo que el modal espera
                />
            )}

            <main className={layoutStyles.mainContent}> 
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <h1>
                        <FaUserTie style={{ marginRight: '10px', color: 'var(--color-accent)' }} /> 
                        Gestión de Empleados
                    </h1>
                    <button 
                        onClick={handleAddBarber}
                        // 🔑 Estilos del botón (debes tenerlos en tu CSS)
                        style={{ 
                            backgroundColor: 'var(--color-accent)', 
                            color: 'var(--color-background)', 
                            border: 'none', 
                            padding: '10px 15px', 
                            borderRadius: '6px', 
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                       + Añadir Nuevo Barbero
                    </button>
                </div>
                
                {/* 1. GRID DE MÉTRICAS (Datos Reales) */}
                <div className={styles.metricGrid}>
                    {/* (Aquí renderizarías las 3 tarjetas de métricas) */}
                </div>

                {/* 2. BARRA DE FILTROS (Funcionalidad pendiente) */}
                <div className={styles.filterBar}>
                    {/* (Inputs de filtro se mantienen igual) */}
                </div>

                {/* 3. LISTA DE BARBEROS (Datos Reales) */}
                <div className={styles.grid}>
                    {loading ? (
                        <p>Cargando personal...</p>
                    ) : (
                        barbers.map((barber) => (
                            <BarberCard 
                                key={barber.id_bar} 
                                barber={barber}
                                onEdit={() => handleEditBarber(barber)}
                                onDelete={() => handleDeleteBarber(barber.id_bar)}
                            />
                        ))
                    )}
                </div>
            </main>
        </>
    );
};

export default PersonalPage;