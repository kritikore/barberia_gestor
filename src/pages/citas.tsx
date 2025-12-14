// src/pages/citas.tsx (ADMIN)
import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { FaCalendarAlt, FaFilter, FaTrashAlt, FaEdit } from 'react-icons/fa';
import AdminLayout from '@/components/AdminLayout';
import styles from '@/styles/Servicios.module.css';

interface Cita { id_cita: number; fecha: string; hora: string; estado: string; nombre_cliente: string; nombre_barbero: string; nombre_servicio: string; }

const CitasAdminPage: NextPage = () => {
    const [citas, setCitas] = useState<Cita[]>([]);
    const [filterDate, setFilterDate] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/citas');
            if (res.ok) setCitas(await res.json());
        } catch (e) { console.error(e); } 
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    // Filtrado en frontend por fecha (para simplificar)
    const filteredCitas = filterDate 
        ? citas.filter(c => c.fecha.startsWith(filterDate)) 
        : citas;

    return (
        <>
            <Head><title>Agenda Global</title></Head>
            <main>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <h1><FaCalendarAlt style={{marginRight: 10, color: 'var(--color-accent)'}} /> Agenda Global</h1>
                    
                    {/* Filtro de Fecha */}
                    <div style={{display: 'flex', alignItems: 'center', gap: '10px', background: '#222', padding: '5px 15px', borderRadius: '8px', border: '1px solid #444'}}>
                        <FaFilter color="#aaa"/>
                        <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} style={{background: 'transparent', border: 'none', color: 'white'}} />
                    </div>
                </div>

                <div className={styles.tableContainer}>
                    <table className={styles.serviciosTable}>
                        <thead>
                            <tr><th>Fecha/Hora</th><th>Barbero</th><th>Cliente</th><th>Servicio</th><th>Estado</th><th>Acciones</th></tr>
                        </thead>
                        <tbody>
                            {filteredCitas.map((c) => (
                                <tr key={c.id_cita}>
                                    <td>
                                        <div style={{fontWeight: 'bold'}}>{new Date(c.fecha).toLocaleDateString()}</div>
                                        <div style={{fontSize: '0.9em', color: '#888'}}>{c.hora.slice(0,5)}</div>
                                    </td>
                                    <td style={{color: 'var(--color-accent)'}}>{c.nombre_barbero}</td>
                                    <td>{c.nombre_cliente}</td>
                                    <td>{c.nombre_servicio}</td>
                                    <td><span style={{/* Estilos de badge iguales al barbero */}}>{c.estado}</span></td>
                                    <td className={styles.actionCell}>
                                        <button className={styles.actionButton} onClick={() => alert("Editar Cita (Admin)")}><FaEdit /></button>
                                        <button className={`${styles.actionButton} ${styles.deleteIcon}`} onClick={() => alert("Cancelar Cita")}><FaTrashAlt /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </>
    );
};

export default CitasAdminPage;