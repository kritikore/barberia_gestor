import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import styles from '@/styles/Dashboard.module.css';
import { FaCut, FaShoppingBag, FaBoxOpen, FaTrophy, FaChartPie, FaCalendarDay, FaTags } from 'react-icons/fa';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- INTERFACES ---
interface CitaItem { hora: string; cliente: string; servicio: string; }
interface VentaItem { producto: string; cantidad: number; total: number; vendedor: string; hora: string; }

// Nueva interfaz para el detalle de cortes en PDF
interface ServicioItem { 
    fecha: string; 
    hora: string; 
    barbero: string; 
    cliente: string; 
    servicio: string; 
    precio: number; 
}

interface Metrics {
    servicios: number;
    productos: number; 
    insumosBajos: number;
    topBarber: string;
    proximasCitas: CitaItem[];
    ventasDetalle: VentaItem[]; 
    serviciosDetalle: ServicioItem[]; // <--- Recibimos la lista de cortes
    totalRevenue: number; 
}

const COLORS = ['#D4AF37', '#0D6EFD'];

const DashboardPage: NextPage = () => {
    const [data, setData] = useState<Metrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState<'day' | 'month'>('day');

    useEffect(() => {
        setLoading(true);
        fetch(`/api/dashboard/metrics?period=${period}`)
            .then(res => res.json())
            .then(d => { setData(d); setLoading(false); })
            .catch(e => { console.error(e); setLoading(false); });
    }, [period]);

    const totalProductosReales = (data?.productos && data.productos > 0) 
        ? data.productos 
        : (data?.ventasDetalle?.reduce((acc, curr) => acc + Number(curr.total), 0) || 0);

    const chartData = [
        { name: 'Cortes/Servicios', value: data?.servicios || 0 },
        { name: 'Venta Productos', value: totalProductosReales },
    ];
    const totalIngresos = (data?.servicios || 0) + totalProductosReales;

    // --- GENERAR PDF MEJORADO ---
    const descargarReporteSimple = () => {
        if (!data) return;
        const doc = new jsPDF();
        const fecha = new Date();

        // Encabezado
        doc.setFillColor(28, 28, 28);
        doc.rect(0, 0, 210, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.text("The Gentleman's Cut", 105, 15, { align: 'center' });
        doc.setFontSize(14);
        doc.text(`Reporte - ${period === 'day' ? 'Diario' : 'Mensual'}`, 105, 28, { align: 'center' });

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        doc.text(`Generado: ${fecha.toLocaleString()}`, 14, 48);

        // TABLA 1: Resumen General
        autoTable(doc, {
            startY: 55,
            head: [['Concepto', 'Valor']],
            body: [
                ['Ingresos Servicios', `$${(data.servicios || 0).toLocaleString()}`],
                ['Venta Productos', `$${totalProductosReales.toLocaleString()}`],
                ['TOTAL INGRESOS', `$${totalIngresos.toLocaleString()}`],
                ['Barbero Top', `${data.topBarber || 'N/A'}`],
            ],
            theme: 'grid',
            headStyles: { fillColor: [212, 175, 55] },
        });

        let finalY = (doc as any).lastAutoTable.finalY + 10;

        // TABLA 2: Detalle de SERVICIOS (Cortes realizados)
        if (data.serviciosDetalle && data.serviciosDetalle.length > 0) {
            doc.setFontSize(12);
            doc.setTextColor(0);
            doc.text("Detalle de Servicios Realizados (Cortes):", 14, finalY);

            autoTable(doc, {
                startY: finalY + 5,
                head: [['Fecha', 'Hora', 'Barbero', 'Cliente', 'Servicio', 'Precio']],
                body: data.serviciosDetalle.map(s => [
                    s.fecha,
                    s.hora.slice(0,5),
                    s.barbero,
                    s.cliente,
                    s.servicio,
                    `$${s.precio}`
                ]),
                theme: 'striped',
                headStyles: { fillColor: [212, 175, 55] }, // Dorado
                styles: { fontSize: 9 }
            });
            finalY = (doc as any).lastAutoTable.finalY + 10;
        }

        // TABLA 3: Detalle de PRODUCTOS Vendidos
        if (data.ventasDetalle && data.ventasDetalle.length > 0) {
            doc.setFontSize(12);
            doc.setTextColor(0);
            doc.text("Detalle de Productos Vendidos:", 14, finalY);

            autoTable(doc, {
                startY: finalY + 5,
                head: [['Hora', 'Producto', 'Vendedor', 'Cant', 'Total']],
                body: data.ventasDetalle.map(v => [
                    v.hora,
                    v.producto,
                    v.vendedor,
                    v.cantidad,
                    `$${v.total}`
                ]),
                theme: 'striped',
                headStyles: { fillColor: [13, 110, 253] }, // Azul
                styles: { fontSize: 9 }
            });
        }

        doc.save(`Reporte_${period}_${fecha.toLocaleDateString()}.pdf`);
    };

    return (
        <>
            <Head><title>Panel de Control</title></Head>
            <div className={styles.dashboardContainer}>
                
                <header className={styles.header} style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 30, flexWrap:'wrap', gap: 15}}>
                    <div>
                        <h1 className={styles.title}>Panel de Control</h1>
                        <span className={styles.date}>Resumen del Negocio</span>
                    </div>
                    
                    <div style={{display:'flex', gap: 15}}>
                        <div style={{background: '#2A2A2A', padding: '5px', borderRadius: '8px', display: 'flex', gap: '5px'}}>
                            <button onClick={() => setPeriod('day')} style={{background: period === 'day' ? 'var(--color-accent)' : 'transparent', color: period === 'day' ? 'black' : '#aaa', border: 'none', padding: '8px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold'}}>Hoy</button>
                            <button onClick={() => setPeriod('month')} style={{background: period === 'month' ? 'var(--color-accent)' : 'transparent', color: period === 'month' ? 'black' : '#aaa', border: 'none', padding: '8px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold'}}>Este Mes</button>
                        </div>
                        <button onClick={descargarReporteSimple} style={{ background: '#D4AF37', color: 'black', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Descargar PDF</button>
                    </div>
                </header>

                {/* TARJETAS */}
                <div className={styles.dailySummaryGrid} style={{ marginBottom: '30px', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
                    <Link href="/citas" style={{textDecoration:'none'}}>
                        <div className={styles.metricCard} style={{cursor:'pointer', borderLeft: '4px solid #D4AF37'}}>
                            <div className={styles.cardHeader}><span>Ingresos Servicios</span><FaCut style={{color: '#D4AF37'}} /></div>
                            <div className={styles.cardValue}>${(data?.servicios || 0).toLocaleString()}</div>
                        </div>
                    </Link>
                    <Link href="/inventario" style={{textDecoration:'none'}}>
                        <div className={styles.metricCard} style={{cursor:'pointer', borderLeft: '4px solid #0D6EFD'}}>
                            <div className={styles.cardHeader}><span>Venta Productos</span><FaShoppingBag style={{color: '#0D6EFD'}} /></div>
                            <div className={styles.cardValue}>${totalProductosReales.toLocaleString()}</div>
                        </div>
                    </Link>
                    <Link href="/personal" style={{textDecoration:'none'}}>
                        <div className={styles.metricCard} style={{cursor:'pointer', borderLeft: '4px solid #28a745'}}>
                            <div className={styles.cardHeader}><span>Top Barbero</span><FaTrophy style={{color: '#28a745'}} /></div>
                            <div className={styles.cardValue} style={{fontSize:'1.3rem'}}>{data?.topBarber || "N/A"}</div>
                        </div>
                    </Link>
                    <Link href="/insumos" style={{textDecoration:'none'}}>
                        <div className={styles.metricCard} style={{cursor:'pointer', borderLeft: data?.insumosBajos && data.insumosBajos > 0 ? '4px solid #DC3545' : '4px solid #6c757d'}}>
                            <div className={styles.cardHeader}><span>Alerta Bodega</span><FaBoxOpen style={{color: data?.insumosBajos && data.insumosBajos > 0 ? '#DC3545' : '#aaa'}} /></div>
                            <div className={styles.cardValue} style={{color: data?.insumosBajos && data.insumosBajos > 0 ? '#DC3545' : 'white'}}>{data?.insumosBajos || 0}</div>
                        </div>
                    </Link>
                </div>

                {/* GRÁFICO Y LISTAS */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', alignItems: 'start' }}>
                    
                    {/* 1. GRÁFICO */}
                    <div style={{ backgroundColor: '#2A2A2A', borderRadius: '12px', padding: '25px', border: '1px solid #444', height: '100%', minHeight: '400px' }}>
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 20}}>
                            <h3 style={{ color: 'white', margin: 0 }}><FaChartPie style={{color: '#D4AF37'}}/> Ingresos</h3>
                            <span style={{background: '#333', padding: '5px 10px', borderRadius: '15px', fontWeight:'bold', color:'white'}}>${totalIngresos.toLocaleString()}</span>
                        </div>
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" label={({ percent }) => (percent || 0) > 0 ? `${((percent || 0) * 100).toFixed(0)}%` : ''}>
                                        {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} contentStyle={{backgroundColor: '#333', borderColor: '#555', color: 'white'}} />
                                    <Legend verticalAlign="bottom" height={36}/>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* 2. PRÓXIMAS CITAS */}
                    <div style={{ backgroundColor: '#2A2A2A', borderRadius: '12px', padding: '25px', border: '1px solid #444', height: '100%', minHeight: '400px' }}>
                        <h3 style={{ color: 'white', marginTop: 0, marginBottom: 20 }}><FaCalendarDay style={{color: '#0D6EFD'}}/> Citas Hoy</h3>
                        {data?.proximasCitas && data.proximasCitas.length > 0 ? (
                            <ul style={{listStyle: 'none', padding: 0}}>
                                {data.proximasCitas.map((cita, index) => (
                                    <li key={index} style={{display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #444'}}>
                                        <div style={{display:'flex', alignItems:'center', gap: 15}}>
                                            <div style={{background: '#333', color: 'var(--color-accent)', padding: '5px', borderRadius: '5px', fontWeight: 'bold'}}>{cita.hora.slice(0,5)}</div>
                                            <div><div style={{color: 'white', fontWeight: 'bold'}}>{cita.cliente}</div><div style={{color: '#aaa', fontSize: '0.85em'}}>{cita.servicio}</div></div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : <p style={{color: '#666', textAlign:'center', marginTop: 50}}>No hay citas hoy.</p>}
                        <div style={{marginTop: 20, textAlign: 'center'}}><Link href="/citas" style={{color: 'var(--color-accent)'}}>Ver Agenda &rarr;</Link></div>
                    </div>

                    {/* 3. VENTAS PRODUCTOS */}
                    <div style={{ backgroundColor: '#2A2A2A', borderRadius: '12px', padding: '25px', border: '1px solid #444', height: '100%', minHeight: '400px' }}>
                        <h3 style={{ color: 'white', marginTop: 0, marginBottom: 20 }}><FaTags style={{color: '#28a745'}}/> Ventas Productos</h3>
                        {data?.ventasDetalle && data.ventasDetalle.length > 0 ? (
                            <div style={{maxHeight: '300px', overflowY: 'auto'}}>
                                <ul style={{listStyle: 'none', padding: 0}}>
                                    {data.ventasDetalle.map((venta, index) => (
                                        <li key={index} style={{padding: '10px 0', borderBottom: '1px solid #444', display:'flex', justifyContent:'space-between'}}>
                                            <div><div style={{color:'white', fontWeight:'bold'}}>{venta.producto}</div><div style={{color:'#aaa', fontSize:'0.8rem'}}>Vendió: {venta.vendedor}</div></div>
                                            <div style={{textAlign:'right'}}><div style={{color:'#28a745', fontWeight:'bold'}}>${venta.total}</div><div style={{color:'#666', fontSize:'0.8rem'}}>x{venta.cantidad}</div></div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ) : <p style={{color: '#666', textAlign:'center', marginTop: 50}}>No hay ventas hoy.</p>}
                        <div style={{marginTop: 20, textAlign: 'center'}}><Link href="/inventario" style={{color: 'var(--color-accent)'}}>Ir a Inventario &rarr;</Link></div>
                    </div>

                </div>
            </div>
        </>
    );
};

export default DashboardPage;