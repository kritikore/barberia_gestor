import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import styles from '@/styles/Servicios.module.css'; // Asegúrate que este CSS exista o usa estilos en línea
import { FaHistory, FaArrowLeft } from 'react-icons/fa';
import { useRouter } from 'next/router';

interface VentaHistorial {
    id_venta: number;
    dia: number;
    mes: number;
    ao: number;
    total: number; // Cambiado a number para mejor manejo
    vendedor: string;
    productos: string;
}

const HistorialPage: NextPage = () => {
    const router = useRouter();
    const [ventas, setVentas] = useState<VentaHistorial[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/historial/ventas')
            .then(res => res.json())
            .then(data => {
                setVentas(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    // Helper para nombre de mes
    const getMesNombre = (m: number) => {
        const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
        return meses[m - 1] || m;
    };

    return (
        <>
            <Head><title>Historial de Ventas</title></Head>
            
            <main style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
                    <button onClick={() => router.back()} style={{background:'none', border:'none', color:'#aaa', cursor:'pointer', fontSize:'1.2rem'}}>
                        <FaArrowLeft />
                    </button>
                    <h1 style={{ color: 'var(--foreground)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FaHistory style={{ color: 'var(--color-accent)' }} /> Historial de Ingresos
                    </h1>
                </div>

                <div className={styles.tableContainer} style={{ background: 'var(--card-bg)', borderRadius: '12px', padding: '20px', border: '1px solid var(--border-color)' }}>
                    <table className={styles.serviciosTable} style={{width: '100%', borderCollapse: 'collapse'}}>
                        <thead>
                            <tr style={{borderBottom: '1px solid var(--border-color)'}}>
                                <th style={{color: 'var(--color-accent)', padding: '15px', textAlign: 'left'}}>ID</th>
                                <th style={{color: 'var(--foreground)', padding: '15px', textAlign: 'left'}}>Fecha</th>
                                <th style={{color: 'var(--foreground)', padding: '15px', textAlign: 'left'}}>Barbero (Vendedor)</th>
                                <th style={{color: 'var(--foreground)', padding: '15px', textAlign: 'left'}}>Servicio</th>
                                <th style={{color: 'var(--foreground)', padding: '15px', textAlign: 'right'}}>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={5} style={{textAlign: 'center', padding: '30px', color: '#888'}}>Cargando historial...</td></tr>
                            ) : ventas.length === 0 ? (
                                <tr><td colSpan={5} style={{textAlign: 'center', padding: '30px', color: '#888'}}>No hay ventas registradas aún.</td></tr>
                            ) : (
                                ventas.map((v) => (
                                    <tr key={v.id_venta} style={{ borderBottom: '1px solid #333' }}>
                                        <td style={{padding: '15px', color: '#888'}}>#{v.id_venta}</td>
                                        <td style={{padding: '15px'}}>
                                            <span style={{fontWeight:'bold'}}>{v.dia}</span> {getMesNombre(v.mes)} {v.ao}
                                        </td>
                                        <td style={{padding: '15px', color: '#ccc'}}>{v.vendedor}</td>
                                        <td style={{padding: '15px'}}>{v.productos}</td>
                                        <td style={{padding: '15px', textAlign: 'right', color: '#4ade80', fontWeight: 'bold', fontSize:'1.1em'}}>
                                            ${Number(v.total).toFixed(2)}
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

export default HistorialPage;