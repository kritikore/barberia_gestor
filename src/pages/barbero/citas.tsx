// src/pages/barbero/citas.tsx
import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { FaCalendarCheck, FaPlay, FaCheck, FaTimes, FaPlus, FaArrowLeft } from 'react-icons/fa'; 
import BarberLayout from '@/components/BarberLayout';
import styles from '@/styles/Servicios.module.css'; 
import AddCitaModal from '@/components/AddCitaModal'; 
import CobroModal from '@/components/CobroModal'; // 🔑 Nuevo Modal

interface Cita {
    id_cita: number;
    fecha: string;
    hora: string;
    estado: string;
    nombre_cliente: string;
    nombre_servicio: string;
}

const CitasBarberoPage: NextPage = () => {
    const router = useRouter();
    const [citas, setCitas] = useState<Cita[]>([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [citaToPay, setCitaToPay] = useState<Cita | null>(null); // Para el cobro
    const [loading, setLoading] = useState(true);

    // Simulación: Obtenemos ID del localStorage o hardcodeado
    const MI_ID_BARBERO = 1; 

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/citas?barberoId=${MI_ID_BARBERO}`);
            if (res.ok) setCitas(await res.json());
        } catch (error) { console.error(error); } 
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    // 1. INICIAR CITA (Pendiente -> En Progreso)
    const handleStart = async (id: number) => {
        await updateStatus(id, 'En Progreso');
    };

    // 2. TERMINAR CITA (En Progreso -> Modal de Cobro)
    const handleFinish = (cita: Cita) => {
        setCitaToPay(cita); // Abre el modal
    };

    // 3. CONFIRMAR COBRO (Desde el Modal -> Completada)
    const handleConfirmPayment = async (metodo: string, propina: number, total: number) => {
        if (!citaToPay) return;
        
        // Aquí llamaríamos a la API real para registrar el pago y cambiar estado
        await updateStatus(citaToPay.id_cita, 'Completada');
        
        alert(`✅ Cobro registrado: $${total} (${metodo}). Cita completada.`);
        setCitaToPay(null); // Cierra modal
        fetchData();
    };

    // 4. CANCELAR
    const handleCancel = async (id: number) => {
        if (confirm("¿Cancelar cita?")) await updateStatus(id, 'Cancelada');
    };

    // Auxiliar para llamar a la API PUT
    const updateStatus = async (id: number, estado: string) => {
        try {
            await fetch(`/api/citas/${id}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ estado, observaciones: `Estado cambiado a ${estado}` })
            });
            fetchData();
        } catch(e) { alert("Error al actualizar"); }
    };

    return (
        <>
            <Head><title>Mi Agenda</title></Head>
            
            {isAddModalOpen && <AddCitaModal onClose={() => setIsAddModalOpen(false)} onSuccess={fetchData} />}
            
            {/* Modal de Cobro */}
            {citaToPay && (
                <CobroModal 
                    cita={citaToPay} 
                    onClose={() => setCitaToPay(null)} 
                    onConfirm={handleConfirmPayment} 
                />
            )}

            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                         <button onClick={() => router.push('/barbero/dashboard')} style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: '1.2em' }}><FaArrowLeft /></button>
                         <h1 style={{margin: 0, color: 'white'}}>Mi Agenda de Hoy</h1>
                    </div>
                    <button onClick={() => setIsAddModalOpen(true)} style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-background)', border: 'none', padding: '12px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', gap: '8px', alignItems: 'center' }}>
                       <FaPlus /> Agendar Cita
                    </button>
                </div>

                <div className={styles.tableContainer}>
                    <table className={styles.serviciosTable}>
                        <thead>
                            <tr>
                                <th>Hora</th>
                                <th>Cliente</th>
                                <th>Servicio</th>
                                <th>Estado</th>
                                <th>Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {citas.map((c) => (
                                <tr key={c.id_cita}>
                                    <td style={{fontWeight: 'bold', color: 'var(--color-primary)'}}>{c.hora.slice(0,5)}</td>
                                    <td>{c.nombre_cliente}</td>
                                    <td>{c.nombre_servicio}</td>
                                    <td>
                                        <span style={{
                                            padding: '5px 10px', borderRadius: '15px', fontSize: '0.85em', fontWeight: 'bold',
                                            backgroundColor: c.estado === 'Confirmada' ? '#ffc107' : c.estado === 'En Progreso' ? '#0D6EFD' : c.estado === 'Completada' ? '#28a745' : '#444',
                                            color: c.estado === 'Confirmada' ? 'black' : 'white'
                                        }}>
                                            {c.estado === 'Confirmada' ? 'Pendiente' : c.estado}
                                        </span>
                                    </td>
                                    <td className={styles.actionCell}>
                                        {/* Lógica de Botones según Estado */}
                                        {c.estado === 'Confirmada' && (
                                            <button className={styles.actionButton} style={{color: '#0D6EFD'}} title="Iniciar Servicio" onClick={() => handleStart(c.id_cita)}>
                                                <FaPlay /> Iniciar
                                            </button>
                                        )}
                                        {c.estado === 'En Progreso' && (
                                            <button className={styles.actionButton} style={{color: '#28a745'}} title="Terminar y Cobrar" onClick={() => handleFinish(c)}>
                                                <FaCheck /> Terminar
                                            </button>
                                        )}
                                        {(c.estado === 'Confirmada' || c.estado === 'Pendiente') && (
                                            <button className={styles.actionButton} style={{color: '#dc3545'}} title="Cancelar" onClick={() => handleCancel(c.id_cita)}>
                                                <FaTimes />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default CitasBarberoPage;