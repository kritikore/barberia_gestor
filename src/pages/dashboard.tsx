// src/pages/dashboard.tsx
import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import AdminLayout from '@/components/AdminLayout';
import styles from '@/styles/Dashboard.module.css';
import { FaDollarSign, FaCalendarCheck, FaUsers, FaClock, FaFileDownload, FaBoxOpen, FaTrophy, FaChartPie } from 'react-icons/fa';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface Metrics {
    totalRevenue: number;
    desglose?: { servicios: number; productos: number }; // 🔑 Hacemos opcional para evitar error
    citasPendientes: number;
    clientesTotales: number;
    proximaCita: string;
    insumosBajos: number;
    topBarber: string;
}

const COLORS = ['#D4AF37', '#0D6EFD'];

const DashboardPage: NextPage = () => {
    const [data, setData] = useState<Metrics | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/dashboard/metrics')
            .then(res => res.json())
            .then(d => { 
                // Validación simple para asegurar que d tenga datos correctos
                if(d.totalRevenue !== undefined) {
                    setData(d); 
                } else {
                    console.error("API Error:", d);
                }
                setLoading(false); 
            })
            .catch(e => {
                console.error(e);
                setLoading(false);
            });
    }, []);

    const descargarReporteSimple = () => {
        if (!data) return;
        const doc = new jsPDF();
        const fecha = new Date();
        const mesActual = fecha.toLocaleString('es-ES', { month: 'long' });

        doc.setFillColor(28, 28, 28);
        doc.rect(0, 0, 210, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.text("The Gentleman's Cut", 105, 15, { align: 'center' });
        doc.setFontSize(14);
        doc.text(`Reporte Mensual - ${mesActual.toUpperCase()}`, 105, 28, { align: 'center' });

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        doc.text(`Generado el: ${fecha.toLocaleDateString()}`, 14, 50);

        // 🔑 CORRECCIÓN: Usamos valores seguros con "|| 0"
        const servVal = data.desglose?.servicios || 0;
        const prodVal = data.desglose?.productos || 0;

        autoTable(doc, {
            startY: 60,
            head: [['Concepto', 'Valor']],
            body: [
                ['Ingresos por Servicios', `$${servVal.toLocaleString()}`],
                ['Ventas de Productos', `$${prodVal.toLocaleString()}`],
                ['TOTAL GENERAL', `$${(data.totalRevenue || 0).toLocaleString()}`],
                ['-----------------', '-----------------'],
                ['Barbero del Mes', `${data.topBarber || 'N/A'}`],
                ['Insumos en Alerta', `${data.insumosBajos || 0}`],
            ],
            theme: 'grid',
            headStyles: { fillColor: [212, 175, 55] },
        });

        doc.save(`Reporte_${mesActual}.pdf`);
    };

    if (loading) return <AdminLayout><p style={{color:'white', padding:30}}>Cargando panel...</p></AdminLayout>;

    // 🔑 CORRECCIÓN DEL ERROR: Usamos el operador ?. (Optional Chaining)
    // Si desglose no existe, usa 0 y no truena la app.
    const chartData = [
        { name: 'Servicios (Cortes)', value: data?.desglose?.servicios || 0 },
        { name: 'Productos (Ventas)', value: data?.desglose?.productos || 0 },
    ];

    return (
        <AdminLayout>
            <Head><title>Panel de Control</title></Head>
            
            <div className={styles.dashboardContainer}>
                <header className={styles.header} style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 30}}>
                    <div>
                        <h1 className={styles.title}>Panel de Control</h1>
                        <span className={styles.date}>Resumen General</span>
                    </div>
                    <button 
                        onClick={descargarReporteSimple}
                        style={{ background: '#D4AF37', color: 'black', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}
                    >
                        <FaFileDownload /> Reporte Mensual PDF
                    </button>
                </header>

                <div className={styles.dailySummaryGrid} style={{ marginBottom: '30px' }}>
                    <Link href="/historial" style={{textDecoration:'none'}}>
                        <div className={styles.metricCard} style={{cursor:'pointer', borderLeft: '4px solid #28a745'}}>
                            <div className={styles.cardHeader}>
                                <span>Ingresos Totales</span>
                                <FaDollarSign className={styles.iconGreen} />
                            </div>
                            <div className={styles.cardValue}>${(data?.totalRevenue || 0).toLocaleString()}</div>
                            <small style={{color: '#aaa', fontSize: '0.8em'}}>
                                Serv: ${(data?.desglose?.servicios || 0).toLocaleString()} | Prod: ${(data?.desglose?.productos || 0).toLocaleString()}
                            </small>
                        </div>
                    </Link>

                    <Link href="/citas" style={{textDecoration:'none'}}>
                        <div className={styles.metricCard} style={{cursor:'pointer', borderLeft: '4px solid #0D6EFD'}}>
                            <div className={styles.cardHeader}>
                                <span>Agenda Activa</span>
                                <FaCalendarCheck className={styles.iconBlue} />
                            </div>
                            <div className={styles.cardValue}>{data?.citasPendientes || 0}</div>
                            <small style={{color: '#aaa'}}>Citas pendientes</small>
                        </div>
                    </Link>

                    <Link href="/insumos" style={{textDecoration:'none'}}>
                        <div className={styles.metricCard} style={{cursor:'pointer', borderLeft: data?.insumosBajos && data.insumosBajos > 0 ? '4px solid #DC3545' : '4px solid #6c757d'}}>
                            <div className={styles.cardHeader}>
                                <span>Alerta Insumos</span>
                                <FaBoxOpen style={{color: data?.insumosBajos && data.insumosBajos > 0 ? '#DC3545' : '#aaa', fontSize: '1.5rem'}} />
                            </div>
                            <div className={styles.cardValue} style={{color: data?.insumosBajos && data.insumosBajos > 0 ? '#DC3545' : 'white'}}>
                                {data?.insumosBajos || 0}
                            </div>
                            <small style={{color: '#aaa'}}>Productos bajos en bodega</small>
                        </div>
                    </Link>

                    <Link href="/personal" style={{textDecoration:'none'}}>
                        <div className={styles.metricCard} style={{cursor:'pointer', borderLeft: '4px solid #F5C542'}}>
                            <div className={styles.cardHeader}>
                                <span>Top Barbero (Mes)</span>
                                <FaTrophy style={{color: '#F5C542', fontSize: '1.5rem'}} />
                            </div>
                            <div className={styles.cardValue} style={{fontSize: '1.2rem'}}>{data?.topBarber || "N/A"}</div>
                            <small style={{color: '#aaa'}}>Mayor facturación</small>
                        </div>
                    </Link>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
                    <div style={{ backgroundColor: '#2A2A2A', borderRadius: '12px', padding: '25px', border: '1px solid #444' }}>
                        <h3 style={{ color: 'white', marginTop: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
                            <FaChartPie style={{color: '#D4AF37'}}/> Origen de Ingresos
                        </h3>
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{backgroundColor: '#333', borderColor: '#555', color: 'white'}} itemStyle={{color: 'white'}} />
                                    <Legend verticalAlign="bottom" height={36}/>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <p style={{textAlign: 'center', color: '#aaa', fontSize: '0.9em', marginTop: 10}}>
                            Visualiza qué genera más dinero: Los servicios de barbería o la venta de productos.
                        </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ backgroundColor: '#2A2A2A', borderRadius: '12px', padding: '20px', border: '1px solid #444', flex: 1 }}>
                            <h4 style={{ color: '#aaa', marginTop: 0 }}>Cartera de Clientes</h4>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 15, marginTop: 10 }}>
                                <FaUsers size={40} color="#6f42c1" />
                                <div>
                                    <span style={{ fontSize: '2em', fontWeight: 'bold', color: 'white' }}>{data?.clientesTotales || 0}</span>
                                    <div style={{ color: '#666', fontSize: '0.9em' }}>Registrados</div>
                                </div>
                            </div>
                        </div>

                        <div style={{ backgroundColor: '#2A2A2A', borderRadius: '12px', padding: '20px', border: '1px solid #444', flex: 1 }}>
                            <h4 style={{ color: '#aaa', marginTop: 0 }}>Próxima Cita Hoy</h4>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 15, marginTop: 10 }}>
                                <FaClock size={40} color="#F5C542" />
                                <div>
                                    <span style={{ fontSize: '2em', fontWeight: 'bold', color: 'white' }}>{data?.proximaCita || "Sin datos"}</span>
                                    <div style={{ color: '#666', fontSize: '0.9em' }}>Horario</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default DashboardPage;