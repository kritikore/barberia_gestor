import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { FaCalendarAlt, FaArrowLeft, FaClock } from 'react-icons/fa';
import AdminLayout from '@/components/AdminLayout';
import { useBarbero } from '@/hooks/useBarbero'; // 👈 Hook
import styles from '@/styles/Servicios.module.css';

const MisCitasPage: NextPage = () => {
    const router = useRouter();
    const { barbero, loading: sessionLoading } = useBarbero();
    const [citas, setCitas] = useState<any[]>([]);

    const fetchCitas = async () => {
        if (!barbero) return;
        const res = await fetch('/api/citas');
        const data = await res.json();
        // 🔍 FILTRO REAL
        const misCitas = data.filter((c: any) => c.id_bar === barbero.id_bar);
        // Ordenar por hora
        misCitas.sort((a: any, b: any) => new Date(a.fecha+'T'+a.hora).getTime() - new Date(b.fecha+'T'+b.hora).getTime());
        setCitas(misCitas);
    };

    useEffect(() => { if (barbero) fetchCitas(); }, [barbero]);

    if (sessionLoading) return null;

    return (
        <>
            <Head><title>Mi Agenda</title></Head>
            <main>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px', gap: 15 }}>
                    <button onClick={() => router.back()} style={{background:'none', border:'none', color:'#aaa', cursor:'pointer', fontSize:'1.2rem'}}><FaArrowLeft /></button>
                    <h1><FaCalendarAlt style={{color:'var(--color-accent)', marginRight:10}}/> Mi Agenda</h1>
                </div>

                <div className={styles.tableContainer}>
                    <table className={styles.serviciosTable}>
                        <thead><tr><th>Hora</th><th>Cliente</th><th>Servicio</th><th>Estado</th></tr></thead>
                        <tbody>
                            {citas.map((c) => (
                                <tr key={c.id_cita} style={{opacity: c.estado==='Cancelada'?0.5:1}}>
                                    <td><div style={{color:'var(--color-accent)', display:'flex', alignItems:'center', gap:5}}><FaClock/> {c.hora.slice(0,5)}</div></td>
                                    <td style={{color:'white'}}>{c.nombre_cliente}</td>
                                    <td style={{color:'#ccc'}}>{c.nombre_servicio}</td>
                                    <td><span style={{color: c.estado==='Completada'?'#0D6EFD':'#ffc107'}}>{c.estado}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </>
    );
};
export default MisCitasPage;