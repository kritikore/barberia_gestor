import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useBarbero } from '@/hooks/useBarbero';
import Head from 'next/head';
import { 
    FaBoxOpen, FaExclamationTriangle, FaArrowLeft, FaWhatsapp, FaCheckCircle, FaCut 
} from 'react-icons/fa';

// NÚMERO DEL ADMIN/DUEÑO PARA PEDIR MATERIAL
// (Cámbialo por el número real del encargado de compras)
const ADMIN_PHONE = "5574968832"; 

export default function InsumosBarberoPage() {
    const router = useRouter();
    const { barbero } = useBarbero();
    const [insumos, setInsumos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if(barbero) {
            setLoading(true);
            fetch(`/api/personal/${barbero.id_bar}`)
                .then(r => r.json())
                .then(data => {
                    // Aseguramos que data.insumos sea un array
                    setInsumos(data.insumos || []);
                    setLoading(false);
                })
                .catch(err => {
                    console.error(err);
                    setLoading(false);
                });
        }
    }, [barbero]);

    // Función para pedir material por WhatsApp
    const solicitarRestock = (nombreInsumo: string, cantidadActual: number) => {
        const mensaje = `Hola Admin 👋, soy ${barbero?.nom_bar}. \n\nNecesito reabastecimiento de: *${nombreInsumo}*.\nMe quedan solo *${cantidadActual}* usos disponibles.\n\n¡Gracias!`;
        const url = `https://wa.me/52${ADMIN_PHONE}?text=${encodeURIComponent(mensaje)}`;
        window.open(url, '_blank');
    };

    if(!barbero) return <div style={{color:'white', padding:30}}>Cargando perfil...</div>;

    return (
        <>
            <Head><title>Mis Insumos</title></Head>

            <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
                
                {/* HEADER */}
                <header style={{ 
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', 
                    background: '#111827', padding: '20px', borderRadius: '16px', border: '1px solid #374151' 
                }}>
                    <div style={{display:'flex', alignItems:'center', gap: 15}}>
                        <button onClick={() => router.back()} style={{background:'none', border:'none', color:'#9CA3AF', cursor:'pointer', fontSize:'1.2rem'}}>
                            <FaArrowLeft />
                        </button>
                        <div>
                            <h1 style={{ margin: 0, color: 'white', fontSize: '1.5rem', display:'flex', alignItems:'center', gap: 10 }}>
                                <FaBoxOpen style={{ color: '#3B82F6' }} /> Control de Insumos
                            </h1>
                            <span style={{color: '#6B7280', fontSize: '0.9rem'}}>Inventario personal de {barbero.nom_bar}</span>
                        </div>
                    </div>
                </header>

                {/* INFO TEXT */}
                <div style={{background: 'rgba(59, 130, 246, 0.1)', border: '1px solid #3B82F6', borderRadius: 8, padding: 15, marginBottom: 30, color: '#93C5FD', display:'flex', gap: 10, alignItems:'center'}}>
                    <FaCut />
                    <p style={{margin:0, fontSize:'0.9rem'}}>
                        Los insumos se descuentan automáticamente cada vez que completas una cita. Si un nivel es bajo, solicita reabastecimiento.
                    </p>
                </div>

                {loading ? (
                    <div style={{color:'white', padding:20, textAlign:'center'}}>Cargando inventario...</div>
                ) : (
                    <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:'20px'}}>
                        {insumos.length > 0 ? insumos.map((ins: any, idx: number) => {
                            // Definir estado Crítico (menos del 20%)
                            const esCritico = ins.pct <= 20;
                            const colorBarra = esCritico ? '#EF4444' : (ins.pct <= 50 ? '#F59E0B' : '#10B981');
                            
                            return (
                                <div key={idx} style={{
                                    backgroundColor: '#1F2937', 
                                    borderRadius: '16px', 
                                    padding: '25px', 
                                    border: `1px solid ${esCritico ? '#EF4444' : '#374151'}`,
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}>
                                    {/* Encabezado Card */}
                                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom: 15}}>
                                        <div>
                                            <h3 style={{color:'white', margin:'0 0 5px 0', fontSize:'1.2rem'}}>{ins.nombre}</h3>
                                            <span style={{color: esCritico ? '#EF4444' : '#9CA3AF', fontSize:'0.85rem', fontWeight:'bold'}}>
                                                {esCritico ? '¡Nivel Crítico!' : 'Nivel Óptimo'}
                                            </span>
                                        </div>
                                        <div style={{
                                            background: esCritico ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)', 
                                            padding: 10, borderRadius: '50%', 
                                            color: esCritico ? '#EF4444' : '#10B981'
                                        }}>
                                            {esCritico ? <FaExclamationTriangle size={20}/> : <FaCheckCircle size={20}/>}
                                        </div>
                                    </div>

                                    {/* Barra de Progreso */}
                                    <div style={{marginBottom: 20}}>
                                        <div style={{display:'flex', justifyContent:'space-between', color:'#D1D5DB', fontSize:'0.9rem', marginBottom: 5}}>
                                            <span>Disponibles: <strong>{ins.actual}</strong></span>
                                            <span>{Math.round(ins.pct)}%</span>
                                        </div>
                                        <div style={{width:'100%', height:10, background:'#374151', borderRadius:5, overflow:'hidden'}}>
                                            <div style={{
                                                width: `${ins.pct}%`, 
                                                height:'100%', 
                                                background: colorBarra,
                                                borderRadius: 5,
                                                transition: 'width 0.5s ease-in-out'
                                            }} />
                                        </div>
                                    </div>

                                    {/* Botón de Acción (WhatsApp) */}
                                    {esCritico ? (
                                        <button 
                                            onClick={() => solicitarRestock(ins.nombre, ins.actual)}
                                            style={{
                                                width: '100%', padding: '12px', border: 'none', borderRadius: '8px',
                                                background: '#25D366', color: 'white', fontWeight: 'bold', cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                                transition: 'background 0.2s'
                                            }}
                                        >
                                            <FaWhatsapp size={18} /> Solicitar Reabastecimiento
                                        </button>
                                    ) : (
                                        <div style={{textAlign:'center', padding: '12px', color:'#4B5563', fontSize:'0.9rem', border:'1px dashed #374151', borderRadius:8}}>
                                            Stock suficiente
                                        </div>
                                    )}
                                </div>
                            );
                        }) : (
                            <div style={{gridColumn: '1/-1', textAlign:'center', color:'#6B7280', padding: 40}}>
                                <FaBoxOpen size={50} style={{marginBottom:10, opacity:0.5}}/>
                                <p>No se encontraron registros de insumos.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}