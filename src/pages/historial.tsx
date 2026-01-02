import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { 
    FaHistory, FaArrowLeft, FaCut, FaShoppingBag, FaUserTie, FaCalendarAlt, FaFilter 
} from 'react-icons/fa';

interface Movimiento {
    tipo: 'SERVICIO' | 'PRODUCTO';
    id_referencia: number;
    fecha: string;
    hora: string;
    total: number;
    vendedor: string;
    detalle: string;
}

const HistorialPage: NextPage = () => {
    const router = useRouter();
    const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Estado para el filtro de fecha (Por defecto HOY)
    const [fechaFiltro, setFechaFiltro] = useState(new Date().toISOString().split('T')[0]);

    const fetchHistorial = (fecha: string) => {
        setLoading(true);
        // Si la fecha está vacía, pedimos 'todos' para ver historial general
        const queryParam = fecha ? `?fecha=${fecha}` : '?fecha=todos';
        
        fetch(`/api/historial/ventas${queryParam}`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setMovimientos(data);
                else setMovimientos([]);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };

    // Cargar al inicio y cuando cambia la fecha
    useEffect(() => {
        fetchHistorial(fechaFiltro);
    }, [fechaFiltro]);

    // Calcular total del día mostrado
    const totalDia = movimientos.reduce((acc, curr) => acc + Number(curr.total), 0);

    const formatDate = (dateString: string) => {
        if(!dateString) return '-';
        const date = new Date(dateString);
        // Ajuste zona horaria simple para visualización correcta
        const userTimezoneOffset = date.getTimezoneOffset() * 60000;
        const localDate = new Date(date.getTime() + userTimezoneOffset);
        return localDate.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    return (
        <>
            <Head><title>Historial Financiero</title></Head>
            
            <main style={{ padding: '30px', backgroundColor: '#F3F4F6', minHeight: '100vh', color: '#1F2937' }}>
                
                {/* ENCABEZADO Y CONTROLES */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: 20 }}>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <button 
                            onClick={() => router.back()} 
                            style={{
                                background:'white', border:'1px solid #E5E7EB', color:'#4B5563', 
                                cursor:'pointer', fontSize:'1.2rem', padding: '10px', borderRadius: '50%',
                                boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                            }}
                        >
                            <FaArrowLeft />
                        </button>
                        <div>
                            <h1 style={{ color: '#111827', margin: 0, fontSize: '1.8rem' }}>Historial de Ingresos</h1>
                            <p style={{ margin: '5px 0 0 0', color: '#6B7280', fontSize: '0.9rem' }}>
                                Movimientos detallados por día
                            </p>
                        </div>
                    </div>
                    
                    {/* CONTROLES DE FECHA Y TOTAL */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                        
                        {/* Selector de Fecha */}
                        <div style={{background: 'white', padding: '5px 15px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: 10, border: '1px solid #E5E7EB'}}>
                            <FaCalendarAlt color="#6B7280"/>
                            <input 
                                type="date" 
                                value={fechaFiltro}
                                onChange={(e) => setFechaFiltro(e.target.value)}
                                style={{border: 'none', outline: 'none', color: '#374151', fontWeight: 'bold', fontSize: '0.95rem', background: 'transparent'}}
                            />
                            {fechaFiltro && (
                                <button onClick={() => setFechaFiltro('')} style={{border:'none', background:'transparent', color:'#EF4444', cursor:'pointer', fontSize:'0.8rem', fontWeight:'bold'}}>
                                    Ver Todo
                                </button>
                            )}
                        </div>

                        {/* Total del Día */}
                        <div style={{ background: '#10B981', padding: '10px 20px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(16, 185, 129, 0.2)', color: 'white', textAlign: 'right' }}>
                            <span style={{ display: 'block', fontSize: '0.75rem', opacity: 0.9 }}>TOTAL VENTAS</span>
                            <span style={{ fontWeight: 'bold', fontSize: '1.3rem' }}>${totalDia.toLocaleString('es-MX', {minimumFractionDigits: 2})}</span>
                        </div>
                    </div>
                </div>

                {/* TABLA DE MOVIMIENTOS */}
                <div style={{ 
                    backgroundColor: 'white', borderRadius: '16px', 
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    overflow: 'hidden' 
                }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                            <tr>
                                <th style={thStyle}>Hora</th>
                                <th style={thStyle}>Tipo</th>
                                <th style={thStyle}>Concepto / Detalle</th>
                                <th style={thStyle}>Atendió / Vendió</th>
                                <th style={{...thStyle, textAlign: 'right'}}>Ingreso</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={5} style={{textAlign: 'center', padding: '50px', color: '#6B7280'}}>Cargando movimientos...</td></tr>
                            ) : movimientos.length === 0 ? (
                                <tr><td colSpan={5} style={{textAlign: 'center', padding: '50px', color: '#9CA3AF'}}>
                                    No hay movimientos registrados en esta fecha.
                                </td></tr>
                            ) : (
                                movimientos.map((m, index) => (
                                    <tr key={`${m.tipo}-${m.id_referencia}-${index}`} style={{ borderBottom: '1px solid #F3F4F6' }} className="hover-row">
                                        
                                        {/* HORA */}
                                        <td style={{...tdStyle, fontFamily: 'monospace', color: '#6B7280'}}>
                                            {m.hora ? m.hora.substring(0, 5) : '--:--'}
                                            {!fechaFiltro && <div style={{fontSize:'0.7rem', color:'#9CA3AF'}}>{formatDate(m.fecha)}</div>}
                                        </td>

                                        {/* TIPO */}
                                        <td style={tdStyle}>
                                            <span style={{
                                                display: 'inline-flex', alignItems: 'center', gap: '6px',
                                                padding: '4px 10px', borderRadius: '15px',
                                                fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.03em',
                                                backgroundColor: m.tipo === 'SERVICIO' ? '#EFF6FF' : '#FFF7ED',
                                                color: m.tipo === 'SERVICIO' ? '#2563EB' : '#EA580C',
                                            }}>
                                                {m.tipo === 'SERVICIO' ? <FaCut size={10} /> : <FaShoppingBag size={10} />}
                                                {m.tipo === 'SERVICIO' ? 'SERVICIO' : 'PRODUCTO'}
                                            </span>
                                        </td>

                                        {/* DETALLE (Ahora sí muestra qué se vendió) */}
                                        <td style={tdStyle}>
                                            <span style={{color: '#111827', fontWeight: '500'}}>{m.detalle}</span>
                                        </td>

                                        {/* VENDEDOR */}
                                        <td style={tdStyle}>
                                            <div style={{display:'flex', alignItems:'center', gap: 8, color: '#4B5563'}}>
                                                <FaUserTie size={14} color="#9CA3AF"/>
                                                {m.vendedor}
                                            </div>
                                        </td>

                                        {/* TOTAL */}
                                        <td style={{...tdStyle, textAlign: 'right'}}>
                                            <span style={{color: '#059669', fontWeight: 'bold', fontSize: '1rem'}}>
                                                + ${Number(m.total).toFixed(2)}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </main>

            <style jsx>{`
                .hover-row:hover { background-color: #F9FAFB; }
            `}</style>
        </>
    );
};

const thStyle: React.CSSProperties = {
    padding: '16px 20px', fontSize: '0.8rem', fontWeight: '700',
    textTransform: 'uppercase', color: '#6B7280', letterSpacing: '0.05em'
};

const tdStyle: React.CSSProperties = {
    padding: '16px 20px', fontSize: '0.9rem'
};

export default HistorialPage;