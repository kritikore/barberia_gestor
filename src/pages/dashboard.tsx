import React, { useEffect, useState, useMemo } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { 
    FaCut, FaShoppingBag, FaBoxOpen, FaTrophy, FaChartLine, 
    FaCalendarDay, FaTags, FaFilePdf, FaMoneyBillWave, FaClock, FaPrint, FaArrowRight 
} from 'react-icons/fa';
import { 
    ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
    ResponsiveContainer, Area, Legend 
} from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- INTERFACES ---
interface CitaItem { hora: string; cliente: string; servicio: string; precio?: number; }
interface VentaItem { producto: string; cantidad: number; total: number; vendedor: string; hora: string; }
interface ServicioItem { fecha: string; hora: string; barbero: string; cliente: string; servicio: string; precio: number; }

interface Metrics {
    servicios: number;
    productos: number;
    insumosBajos: number;
    topBarber: string;
    proximasCitas: CitaItem[];
    ventasDetalle: VentaItem[]; 
    serviciosDetalle: ServicioItem[];
}

const DashboardPage: NextPage = () => {
    const [data, setData] = useState<Metrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState<'day' | 'month'>('day');

    // ESTADO PARA EL MODAL DE DATOS FISCALES
    const [showPdfModal, setShowPdfModal] = useState(false);
    const [fiscalData, setFiscalData] = useState({
        empresa: "Mi Barbería", rfc: "", direccion: "", iva: 16
    });

    useEffect(() => {
        setLoading(true);
        fetch(`/api/dashboard/metrics?period=${period}`)
            .then(res => res.json())
            .then(d => { setData(d); setLoading(false); })
            .catch(e => { console.error(e); setLoading(false); });
    }, [period]);

    // --- PROCESAMIENTO DE DATOS PARA GRÁFICO COMPLEJO ---
    // Convertimos la lista plana de ventas en datos agrupados por HORA para ver tendencias
    const chartData = useMemo(() => {
        if (!data) return [];
        
        // Creamos un mapa de horas (09:00 a 20:00)
        const hoursMap: Record<string, { hora: string, servicios: number, productos: number }> = {};
        for(let i=9; i<=21; i++) {
            const h = i < 10 ? `0${i}:00` : `${i}:00`;
            hoursMap[h] = { hora: h, servicios: 0, productos: 0 };
        }

        // Rellenamos con Servicios
        data.serviciosDetalle.forEach(s => {
            const h = s.hora.substring(0, 2) + ":00";
            if (hoursMap[h]) hoursMap[h].servicios += Number(s.precio);
        });

        // Rellenamos con Productos
        data.ventasDetalle.forEach(v => {
            const h = v.hora.substring(0, 2) + ":00";
            if (hoursMap[h]) hoursMap[h].productos += Number(v.total);
        });

        return Object.values(hoursMap);
    }, [data]);

    const ingresoServicios = data?.servicios || 0;
    const ingresoProductos = (data?.productos && data.productos > 0) ? data.productos : (data?.ventasDetalle?.reduce((acc, curr) => acc + Number(curr.total), 0) || 0);
    const ingresoTotalBruto = ingresoServicios + ingresoProductos;

    // --- GENERACIÓN DE PDF ---
    const generarPDF = () => {
        if (!data) return;
        const doc = new jsPDF();
        const fechaImpresion = new Date();
        const tituloReporte = period === 'day' ? `CORTE DE CAJA DIARIO` : `ESTADO DE RESULTADOS MENSUAL`;
        const tasaIVA = fiscalData.iva / 100;
        const subtotalFiscal = ingresoTotalBruto / (1 + tasaIVA);
        const impuestosFiscal = ingresoTotalBruto - subtotalFiscal;

        // Encabezado
        doc.setFillColor(21, 25, 34); doc.rect(0, 0, 210, 45, 'F');
        doc.setTextColor(212, 175, 55); doc.setFontSize(18); doc.setFont("helvetica", "bold");
        doc.text(fiscalData.empresa.toUpperCase(), 15, 18);
        doc.setTextColor(255, 255, 255); doc.setFontSize(10); doc.setFont("helvetica", "normal");
        doc.text(`RFC: ${fiscalData.rfc}`, 15, 25); 
        doc.text(fiscalData.direccion, 15, 30);
        
        doc.setFontSize(14); doc.text(tituloReporte, 195, 20, { align: 'right' });
        doc.setFontSize(9); doc.text(`Emisión: ${fechaImpresion.toLocaleString()}`, 195, 35, { align: 'right' });

        // Resumen
        doc.setTextColor(0, 0, 0); doc.setFontSize(12); doc.text("RESUMEN CONTABLE", 15, 55);
        autoTable(doc, {
            startY: 60,
            head: [['CONCEPTO', 'IMPORTE']],
            body: [
                ['Ventas Servicios', `$${ingresoServicios.toLocaleString('es-MX', {minimumFractionDigits:2})}`],
                ['Ventas Productos', `$${ingresoProductos.toLocaleString('es-MX', {minimumFractionDigits:2})}`],
                ['SUBTOTAL BASE', `$${subtotalFiscal.toLocaleString('es-MX', {minimumFractionDigits:2})}`],
                [`IVA TRASLADADO (${fiscalData.iva}%)`, `$${impuestosFiscal.toLocaleString('es-MX', {minimumFractionDigits:2})}`],
                ['TOTAL NETO', { content: `$${ingresoTotalBruto.toLocaleString('es-MX', {minimumFractionDigits:2})}`, styles: { fontStyle: 'bold', fillColor: [220, 255, 220] } }],
            ],
            theme: 'grid', headStyles: { fillColor: [44, 62, 80] }
        });

        let finalY = (doc as any).lastAutoTable.finalY + 15;

        // Tablas Detalle
        if (data.serviciosDetalle?.length > 0) {
            doc.text("DETALLE OPERATIVO", 15, finalY);
            autoTable(doc, {
                startY: finalY + 5, head: [['Hora', 'Folio', 'Barbero', 'Servicio', 'Monto']],
                body: data.serviciosDetalle.map((s, i) => [s.hora.slice(0,5), `S-${1000+i}`, s.barbero, s.servicio, `$${s.precio}`]),
                theme: 'striped', headStyles: { fillColor: [212, 175, 55], textColor: 0 }, styles: { fontSize: 8 }
            });
            finalY = (doc as any).lastAutoTable.finalY + 15;
        }
        
        // Firmas
        if (finalY > 250) { doc.addPage(); finalY = 40; }
        doc.line(30, finalY + 30, 90, finalY + 30); doc.text("ELABORÓ", 60, finalY + 35, { align: 'center' });
        doc.line(120, finalY + 30, 180, finalY + 30); doc.text("AUTORIZÓ", 150, finalY + 35, { align: 'center' });

        doc.save(`Reporte_${period}.pdf`);
        setShowPdfModal(false);
    };

    if (loading) return <div style={{color:'white', padding: 50, textAlign:'center'}}>Analizando datos...</div>;

    return (
        <>
            <Head><title>Dashboard Pro</title></Head>

            {/* MODAL CONFIGURACIÓN PDF */}
            {showPdfModal && (
                <div style={{position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.85)', zIndex:999, display:'flex', alignItems:'center', justifyContent:'center'}}>
                    <div style={{background:'#1F2937', padding:30, borderRadius:12, width:'400px', border:'1px solid #374151'}}>
                        <h3 style={{color:'white', marginTop:0, display:'flex', alignItems:'center', gap:10}}><FaPrint /> Datos de Encabezado</h3>
                        <input type="text" placeholder="Nombre Empresa" value={fiscalData.empresa} onChange={e=>setFiscalData({...fiscalData, empresa:e.target.value})} style={inputStyle}/>
                        <input type="text" placeholder="RFC" value={fiscalData.rfc} onChange={e=>setFiscalData({...fiscalData, rfc:e.target.value})} style={inputStyle}/>
                        <input type="text" placeholder="Dirección" value={fiscalData.direccion} onChange={e=>setFiscalData({...fiscalData, direccion:e.target.value})} style={inputStyle}/>
                        <div style={{display:'flex', gap:10, alignItems:'center', marginTop:10}}>
                            <label style={{color:'#aaa'}}>IVA %:</label>
                            <input type="number" value={fiscalData.iva} onChange={e=>setFiscalData({...fiscalData, iva:Number(e.target.value)})} style={{...inputStyle, width:80, marginTop:0}}/>
                        </div>
                        <div style={{display:'flex', gap:10, marginTop:20}}>
                            <button onClick={()=>setShowPdfModal(false)} style={btnCancelStyle}>Cancelar</button>
                            <button onClick={generarPDF} style={btnConfirmStyle}>Descargar</button>
                        </div>
                    </div>
                </div>
            )}

            <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
                
                {/* HEADER */}
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', background: '#111827', padding: '20px', borderRadius: '16px', border: '1px solid #374151' }}>
                    <div>
                        <h1 style={{ margin: 0, color: 'white', fontSize: '1.5rem', display:'flex', alignItems:'center', gap: 10 }}>
                            <FaChartLine style={{ color: '#D4AF37' }} /> Panel de Control
                        </h1>
                        <span style={{color: '#6B7280', fontSize: '0.9rem'}}>Visión general del negocio</span>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <div style={{ background: '#1F2937', padding: '4px', borderRadius: '8px', display: 'flex' }}>
                            <button onClick={() => setPeriod('day')} style={period === 'day' ? activePeriodBtn : periodBtn}>Diario</button>
                            <button onClick={() => setPeriod('month')} style={period === 'month' ? activePeriodBtn : periodBtn}>Mensual</button>
                        </div>
                        <button onClick={() => setShowPdfModal(true)} style={pdfBtnStyle}><FaFilePdf /> Reporte Fiscal</button>
                    </div>
                </header>

                {/* KPI CARDS CON LINKS */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                    
                    <Link href="/citas" style={{textDecoration:'none'}}>
                        <KPI_Card title="Caja Total" value={`$${ingresoTotalBruto.toLocaleString()}`} icon={<FaMoneyBillWave />} color="#10B981" subtext="Ver Agenda" />
                    </Link>

                    <Link href="/citas" style={{textDecoration:'none'}}>
                        <KPI_Card title="Servicios" value={`$${ingresoServicios.toLocaleString()}`} icon={<FaCut />} color="#D4AF37" subtext={`${data?.serviciosDetalle?.length} cortes`} />
                    </Link>

                    <Link href="/inventario" style={{textDecoration:'none'}}>
                        <KPI_Card title="Retail" value={`$${ingresoProductos.toLocaleString()}`} icon={<FaShoppingBag />} color="#3B82F6" subtext={`${data?.ventasDetalle?.length} productos`} />
                    </Link>

                    <Link href="/insumos" style={{textDecoration:'none'}}>
                         {/* Usamos lógica para alertar si hay insumos bajos */}
                        <KPI_Card 
                            title="Alerta Insumos" 
                            value={data?.insumosBajos?.toString() || "0"} 
                            icon={<FaBoxOpen />} 
                            color={data?.insumosBajos && data.insumosBajos > 0 ? "#EF4444" : "#6B7280"} 
                            subtext="Items por agotarse" 
                        />
                    </Link>
                </div>

                {/* SECCIÓN PRINCIPAL: GRÁFICO COMPLEJO + TIMELINE CITAS */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
                    
                    {/* 1. GRÁFICO DE TENDENCIAS (COMPLEJO PERO ENTENDIBLE) */}
                    <div style={cardStyle}>
                        <h3 style={cardTitleStyle}>Rendimiento por Hora (Tendencia)</h3>
                        <p style={{color:'#6B7280', fontSize:'0.85rem', marginBottom: 20}}>Analiza las horas pico de facturación (Servicios + Productos)</p>
                        
                        <div style={{ width: '100%', height: 350 }}>
                            <ResponsiveContainer>
                                <ComposedChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorServicios" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                    <XAxis dataKey="hora" stroke="#9CA3AF" style={{fontSize:'0.8rem'}} />
                                    <YAxis stroke="#9CA3AF" style={{fontSize:'0.8rem'}} tickFormatter={(value) => `$${value}`}/>
                                    <Tooltip 
                                        contentStyle={{backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px', color:'white'}}
                                        formatter={(value: number) => [`$${value}`, '']}
                                    />
                                    <Legend />
                                    {/* Barras para Servicios (Base sólida) */}
                                    <Bar dataKey="servicios" name="Ingreso Servicios" barSize={20} fill="#D4AF37" radius={[4, 4, 0, 0]} />
                                    {/* Área para Productos (Tendencia suave encima) */}
                                    <Area type="monotone" dataKey="productos" name="Ingreso Productos" stroke="#3B82F6" fill="#3B82F6" strokeWidth={3} fillOpacity={0.2} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* 2. TIMELINE DE PRÓXIMAS CITAS (MEJORADO VISUALMENTE) */}
                    <div style={cardStyle}>
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 20}}>
                            <h3 style={cardTitleStyle}><FaCalendarDay style={{color: '#8B5CF6', marginRight: 10}}/> Agenda de Hoy</h3>
                            <Link href="/citas" style={{color:'#D4AF37', fontSize:'0.9rem', display:'flex', alignItems:'center', gap:5, textDecoration:'none'}}>
                                Gestionar <FaArrowRight size={10}/>
                            </Link>
                        </div>

                        {data?.proximasCitas && data.proximasCitas.length > 0 ? (
                            <div style={{display:'flex', flexDirection:'column', gap: 15, maxHeight: '380px', overflowY: 'auto', paddingRight: 5}}>
                                {data.proximasCitas.map((cita, i) => (
                                    <div key={i} style={{display:'flex', gap: 15, alignItems:'center'}}>
                                        {/* Columna Hora */}
                                        <div style={{display:'flex', flexDirection:'column', alignItems:'center', minWidth: 50}}>
                                            <span style={{color:'white', fontWeight:'bold'}}>{cita.hora.slice(0,5)}</span>
                                            <div style={{height: '100%', width: 2, background: '#374151', flex: 1, marginTop: 5}}></div>
                                        </div>
                                        
                                        {/* Tarjeta Cita */}
                                        <div style={{
                                            background: '#111827', flex: 1, padding: '12px', borderRadius: '10px', 
                                            borderLeft: '4px solid #D4AF37', border: '1px solid #374151',
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                        }}>
                                            <div>
                                                <div style={{color: 'white', fontWeight: '600'}}>{cita.cliente}</div>
                                                <div style={{color: '#9CA3AF', fontSize: '0.85rem'}}>{cita.servicio}</div>
                                            </div>
                                            <div style={{background: '#374151', padding: '5px 8px', borderRadius: '6px', color:'#D4AF37', fontSize:'0.8rem'}}>
                                                <FaClock /> Pendiente
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{textAlign:'center', padding: 50, color: '#6B7280'}}>
                                <FaCalendarDay size={40} style={{marginBottom: 10, opacity:0.5}}/>
                                <p>No hay más citas programadas para hoy.</p>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </>
    );
};

// --- ESTILOS & COMPONENTES ---
const cardStyle: React.CSSProperties = { backgroundColor: '#1F2937', borderRadius: '16px', padding: '25px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', height: '100%', border: '1px solid #374151' };
const cardTitleStyle: React.CSSProperties = { color: 'white', margin: '0 0 10px 0', fontSize: '1.2rem', fontWeight: '600' };
const inputStyle: React.CSSProperties = { width:'100%', padding:10, background:'#111827', border:'1px solid #4B5563', color:'white', borderRadius:6, marginTop:10 };
const btnCancelStyle: React.CSSProperties = { flex:1, padding:12, background:'transparent', border:'1px solid #4B5563', color:'white', borderRadius:6, cursor:'pointer' };
const btnConfirmStyle: React.CSSProperties = { flex:1, padding:12, background:'#D4AF37', border:'none', color:'black', borderRadius:6, cursor:'pointer', fontWeight:'bold' };

const KPI_Card = ({ title, value, icon, color, subtext }: any) => (
    <div style={{ 
        backgroundColor: '#1F2937', borderRadius: '16px', padding: '20px', 
        borderLeft: `6px solid ${color}`, boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        cursor: 'pointer', transition: 'transform 0.2s', border: '1px solid #374151'
    }}
    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
    >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 15 }}>
            <span style={{ color: '#9CA3AF', fontWeight: '600', fontSize: '0.9rem' }}>{title}</span>
            <div style={{ color: color, background: 'rgba(255,255,255,0.05)', padding: 8, borderRadius: 8 }}>{icon}</div>
        </div>
        <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'white' }}>{value}</div>
        <div style={{ fontSize: '0.85rem', color: '#6B7280', marginTop: 5 }}>{subtext}</div>
    </div>
);

// Estilos Botones Header
const periodBtn = { background: 'transparent', color: '#D1D5DB', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' };
const activePeriodBtn = { background: '#D4AF37', color: 'black', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' };
const pdfBtnStyle = { background: '#DC3545', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 8 };

export default DashboardPage;