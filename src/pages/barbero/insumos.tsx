import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/AdminLayout';
import { useBarbero } from '@/hooks/useBarbero';
import { FaBoxOpen, FaExclamationCircle, FaHome, FaArrowLeft } from 'react-icons/fa';

export default function InsumosBarberoPage() {
    const router = useRouter();
    const { barbero } = useBarbero();
    const [insumos, setInsumos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if(barbero) {
            fetch(`/api/personal/${barbero.id_bar}`)
                .then(r => r.json())
                .then(data => {
                    setInsumos(data.insumos || []);
                    setLoading(false);
                })
                .catch(() => setLoading(false));
        }
    }, [barbero]);

    if(!barbero) return null;

    return (
        <>
            <main>
                {/* ENCABEZADO CON NAVEGACIÓN */}
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:30}}>
                    <div style={{display:'flex', alignItems:'center', gap:10}}>
                        <FaBoxOpen size={28} color="#6c757d"/> 
                        <h1 style={{margin:0, color:'white', fontSize:'1.8rem'}}>Mis Insumos</h1>
                    </div>
                    
                    <button 
                        onClick={() => router.push('/barbero/dashboard')} 
                        style={{
                            background: '#333', color: 'white', border: '1px solid #555', 
                            padding: '10px 15px', borderRadius: '8px', cursor: 'pointer', 
                            display: 'flex', alignItems: 'center', gap: 8, fontWeight:'bold'
                        }}
                    >
                        <FaHome /> Volver al Dashboard
                    </button>
                </div>

                <p style={{color:'#aaa', marginBottom:30}}>
                    Estos niveles bajan automáticamente con cada corte realizado.
                </p>

                {loading ? (
                    <div style={{color:'white', padding:20}}>Cargando insumos...</div>
                ) : (
                    <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(250px, 1fr))', gap:20}}>
                        {insumos.map((ins: any, idx: number) => (
                            <div key={idx} style={{background:'#222', padding:20, borderRadius:12, border: ins.pct <= 20 ? '1px solid #dc3545' : '1px solid #444'}}>
                                <h3 style={{color:'white', margin:'0 0 10px 0'}}>{ins.nombre}</h3>
                                
                                <div style={{display:'flex', justifyContent:'space-between', marginBottom:5, color:'#ccc'}}>
                                    <span>Rendimiento: {ins.actual} serv.</span>
                                    <span>{Math.round(ins.pct)}%</span>
                                </div>

                                <div style={{width:'100%', height:10, background:'#333', borderRadius:5, overflow:'hidden'}}>
                                    <div style={{
                                        width: `${ins.pct}%`, 
                                        height:'100%', 
                                        background: ins.pct <= 20 ? '#dc3545' : '#28a745',
                                        transition: 'width 0.5s'
                                    }} />
                                </div>

                                {ins.pct <= 20 && (
                                    <div style={{marginTop:10, color:'#dc3545', fontSize:'0.9rem', display:'flex', alignItems:'center', gap:5, fontWeight:'bold'}}>
                                        <FaExclamationCircle /> Solicitar Reabastecimiento
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </>
    );
}