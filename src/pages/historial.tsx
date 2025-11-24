// src/pages/historial.tsx
import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import layoutStyles from '@/styles/GlobalLayout.module.css';
import styles from '@/styles/Clientes.module.css'; // Reusamos estilos de tabla
import { FaHistory, FaFileInvoiceDollar } from 'react-icons/fa';

interface VentaHistorial {
    id_venta: number;
    dia: number;
    mes: number;
    ao: number;
    total: string;
    vendedor: string;
    productos: string;
}

const HistorialPage: NextPage = () => {
    const [ventas, setVentas] = useState<VentaHistorial[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/historial/ventas')
            .then(res => res.json())
            .then(data => {
                setVentas(data);
                setLoading(false);
            })
            .catch(err => console.error(err));
    }, []);

    return (
        <>
            <Head><title>Historial de Ventas</title></Head>
            <main className={layoutStyles.mainContent}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
                    <h1 style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FaHistory style={{ color: 'var(--color-accent)' }} /> Historial de Ventas
                    </h1>
                </div>

                <div className={styles.tableContainer}>
                    <table className={styles.clientesTable}>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Fecha</th>
                                <th>Vendedor</th>
                                <th>Productos</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={5} style={{textAlign: 'center'}}>Cargando historial...</td></tr>
                            ) : ventas.map((v) => (
                                <tr key={v.id_venta}>
                                    <td>#{v.id_venta}</td>
                                    <td>{v.dia}/{v.mes}/{v.ao}</td>
                                    <td>{v.vendedor}</td>
                                    <td style={{color: '#ccc', fontSize: '0.9em'}}>{v.productos}</td>
                                    <td style={{color: '#4caf50', fontWeight: 'bold'}}>${parseFloat(v.total).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </>
    );
};

export default HistorialPage;