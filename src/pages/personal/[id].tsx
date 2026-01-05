import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { 
    FaArrowLeft, FaPhone, FaEnvelope, FaCut, FaBoxOpen, 
    FaExclamationTriangle, FaWhatsapp, FaSyncAlt, FaMoneyBillWave 
} from 'react-icons/fa';

export default function DetalleBarberoPage() {
    const router = useRouter();
    const { id } = router.query;
    
    // ESTADOS
    const [barbero, setBarbero] = useState<any>(null);
    const [insumos, setInsumos] = useState<any[]>([]);
    const [historial, setHistorial] = useState<any[]>([]); // 👈 AQUÍ GUARDAMOS LOS CORTES
    const [estadisticas, setEstadisticas] = useState<any>(null); // 👈 AQUÍ LOS TOTALES
    const [loading, setLoading] = useState(true);

    // Cargar datos del Barbero + Insumos + Historial
    const fetchDatos = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/personal/${id}`);
            const data = await res.json();
            
            if (res.ok) {
                setBarbero(data.perfil);
                setInsumos(data.insumos || []);
                setHistorial(data.historial || []); // Guardamos la lista de cortes
                setEstadisticas(data.estadisticas || { totalCortes: 0, totalGenerado: 0 });
            }
        } catch (error) { 
            console.error(error); 
        } finally { 
            setLoading(false); 
        }
    };

    useEffect(() => { fetchDatos(); }, [id]);

    // --- FUNCIÓN DE REABASTECIMIENTO (RESTOCK) ---
    const handleRestock = async (insumoKey: string, nombreInsumo: string) => {
        if(!confirm(`¿Autorizar reabastecimiento de ${nombreInsumo} para ${barbero.nom_bar}?`)) return;

        try {
            // 1. Actualizar BD (Rellenar al 100%)
            const res = await fetch(`/api/personal/${id}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ 
                    action: 'restock', 
                    item: insumoKey 
                })
            });

            if(res.ok) {
                // 2. Notificar al Barbero por WhatsApp
                const telLimpio = barbero.tel_bar ? barbero.tel_bar.replace(/\D/g, '') : '';
                
                if (telLimpio.length >= 10) {
                    const mensaje = `Hola ${barbero.nom_bar} 👋, tu solicitud de insumo (*${nombreInsumo}*) ha sido autorizada y tu inventario actualizado en el sistema. ✅`;
                    const url = `https://wa.me/52${telLimpio}?text=${encodeURIComponent(mensaje)}`;
                    window.open(url, '_blank'); 
                } else {
                    alert("Stock actualizado (No se abrió WhatsApp porque el número no es válido).");
                }
                
                fetchDatos(); // Recargar datos visuales para ver la barra llena
            } else {
                alert("Error al actualizar inventario.");
            }
        } catch (e) { console.error(e); }
    };

    if (loading) return <div style={{color:'white', padding:30, textAlign:'center'}}>Cargando perfil...</div>;
    if (!barbero) return <div style={{color:'white', padding:30, textAlign:'center'}}>Barbero no encontrado.</div>;

    return (
        <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
            <Head><title>{barbero.nom_bar} - Detalle</title></Head>

            {/* HEADER */}
            <header style={{ marginBottom: 30, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div style={{display:'flex', alignItems:'center', gap: 15}}>
                    <Link href="/personal" style={{color:'#9CA3AF', fontSize:'1.5rem', display:'flex', alignItems:'center'}}>
                        <FaArrowLeft/>
                    </Link>
                    <div>
                        <h1 style={{ margin: 0, color: 'white', fontSize: '2rem' }}>{barbero.nom_bar} {barbero.apell_bar}</h1>
                        <span style={{
                            color: barbero.estado === 'Activo' ? '#10B981' : '#EF4444', 
                            fontWeight:'bold', background: 'rgba(0,0,0,0.2)', padding:'2px 8px', borderRadius:4
                        }}>
                            {barbero.estado?.toUpperCase()}
                        </span>
                    </div>
                </div>
            </header>

            {/* TARJETAS DE INFORMACIÓN */}
            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginBottom: 40}}>
                
                {/* CONTACTO */}
                <div style={cardStyle}>
                    <h3 style={{color:'#D4AF37', margin:'0 0 15px 0', display:'flex', alignItems:'center', gap:10}}>
                        <FaPhone/> Contacto
                    </h3>
                    <p style={{color:'white', margin:'8px 0'}}>📞 {barbero.tel_bar || 'Sin teléfono'}</p>
                    <p style={{color:'white', margin:'8px 0'}}>✉️ {barbero.email}</p>
                </div>

                {/* ESTADÍSTICAS (KPIs REALES) */}
                <div style={cardStyle}>
                    <h3 style={{color:'#3B82F6', margin:'0 0 15px 0', display:'flex', alignItems:'center', gap:10}}>
                        <FaCut/> Rendimiento General
                    </h3>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10}}>
                        <span style={{color:'#ccc'}}>Total Servicios:</span>
                        <strong style={{color:'white', fontSize:'1.2rem'}}>{estadisticas?.totalCortes || 0}</strong>
                    </div>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                        <span style={{color:'#ccc'}}>Dinero Generado:</span>
                        <strong style={{color:'#10B981', fontSize:'1.2rem', display:'flex', alignItems:'center', gap:5}}>
                            <FaMoneyBillWave size={16}/> ${estadisticas?.totalGenerado || 0}
                        </strong>
                    </div>
                </div>
            </div>

            {/* --- MÓDULO DE INSUMOS (ADMIN) --- */}
            <h2 style={{color:'white', borderBottom:'1px solid #333', paddingBottom:10, marginBottom:20, display:'flex', alignItems:'center', gap:10}}>
                <FaBoxOpen /> Gestión de Insumos
            </h2>

            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:20}}>
                {insumos.map((ins: any, idx: number) => {
                    const esBajo = ins.pct <= 25;
                    return (
                        <div key={idx} style={{
                            background: '#1F2937', padding: 20, borderRadius: 12,
                            border: esBajo ? '1px solid #EF4444' : '1px solid #374151',
                            position: 'relative'
                        }}>
                            <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                                <h3 style={{color:'white', margin:'0 0 5px 0'}}>{ins.nombre}</h3>
                                {esBajo && <FaExclamationTriangle color="#EF4444" />}
                            </div>
                            
                            <div style={{margin:'15px 0'}}>
                                <div style={{display:'flex', justifyContent:'space-between', color:'#aaa', fontSize:'0.8rem', marginBottom:5}}>
                                    <span>Nivel Actual: {ins.actual}</span>
                                    <span>{Math.round(ins.pct)}%</span>
                                </div>
                                <div style={{width:'100%', height:8, background:'#333', borderRadius:4, overflow:'hidden'}}>
                                    <div style={{
                                        width: `${ins.pct}%`, height:'100%', borderRadius:4,
                                        background: esBajo ? '#EF4444' : '#10B981', transition:'width 0.3s'
                                    }}/>
                                </div>
                            </div>

                            {/* BOTÓN DE REABASTECIMIENTO */}
                            <button 
                                onClick={() => handleRestock(ins.key, ins.nombre)}
                                style={{
                                    width:'100%', padding: 10, borderRadius: 6, border:'none', cursor:'pointer',
                                    background: esBajo ? '#EF4444' : '#374151',
                                    color: 'white', fontWeight: 'bold',
                                    display: 'flex', alignItems:'center', justifyContent:'center', gap: 8,
                                    opacity: esBajo ? 1 : 0.8,
                                    transition: 'background 0.2s'
                                }}
                            >
                                <FaSyncAlt /> {esBajo ? 'Autorizar Reabastecimiento' : 'Rellenar Stock'}
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* --- NUEVO: HISTORIAL DE ACTIVIDAD --- */}
            <h2 style={{color:'white', borderBottom:'1px solid #333', paddingBottom:10, marginTop: 40, marginBottom:20}}>
                ⏳ Historial de Actividad
            </h2>

            {historial && historial.length > 0 ? (
                <div style={{overflowX: 'auto', background:'#1F2937', borderRadius:12, padding:10, border:'1px solid #374151'}}>
                    <table style={{width:'100%', borderCollapse:'collapse', color:'#ddd', minWidth: 600}}>
                        <thead>
                            <tr style={{background:'#111', textAlign:'left', borderBottom:'2px solid #333'}}>
                                <th style={{padding:12}}>Fecha</th>
                                <th style={{padding:12}}>Cliente</th>
                                <th style={{padding:12}}>Servicio</th>
                                <th style={{padding:12}}>Monto</th>
                                <th style={{padding:12}}>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {historial.map((item: any, i: number) => {
                                // Formatear fecha
                                const fechaStr = new Date(item.fecha).toLocaleDateString('es-MX', {day: '2-digit', month: 'short', year:'numeric'});
                                
                                return (
                                    <tr key={i} style={{borderBottom:'1px solid #333'}}>
                                        <td style={{padding:12}}>
                                            <div style={{fontWeight:'bold'}}>{fechaStr}</div>
                                            <div style={{fontSize:'0.8rem', color:'#888'}}>{item.hora ? item.hora.slice(0,5) : ''}</div>
                                        </td>
                                        <td style={{padding:12}}>{item.cliente}</td>
                                        <td style={{padding:12}}>{item.servicio}</td>
                                        <td style={{padding:12, color:'#10B981', fontWeight:'bold'}}>${item.precio}</td>
                                        <td style={{padding:12}}>
                                            <span style={{
                                                padding:'2px 8px', borderRadius:4, fontSize:'0.75rem', fontWeight:'bold',
                                                background: item.estado === 'Completada' || item.estado === 'Pagado' ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)',
                                                color: item.estado === 'Completada' || item.estado === 'Pagado' ? '#10B981' : '#F59E0B'
                                            }}>
                                                {item.estado ? item.estado.toUpperCase() : 'N/A'}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div style={{textAlign:'center', padding:40, background:'#1F2937', borderRadius:12, border:'1px dashed #444', color:'#aaa'}}>
                    <p>Este barbero aún no tiene servicios registrados en el historial.</p>
                </div>
            )}
        </div>
    );
}

const cardStyle: React.CSSProperties = { 
    background: '#1F2937', 
    padding: 20, 
    borderRadius: 12, 
    border: '1px solid #374151',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)' 
};