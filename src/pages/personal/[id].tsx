import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/AdminLayout';
import { FaArrowLeft, FaCut, FaShoppingBag, FaSyncAlt, FaExclamationTriangle } from 'react-icons/fa';
import styles from '@/styles/Servicios.module.css';

export default function DetalleBarberoAdmin() {
    const router = useRouter();
    const { id } = router.query;
    const [data, setData] = useState<any>(null);

    const loadData = async () => {
        if(!id) return;
        const res = await fetch(`/api/personal/${id}`);
        if(res.ok) setData(await res.json());
    };

    useEffect(() => { loadData(); }, [id]);

    const handleRestock = async () => {
        if(!confirm("¿Autorizar reabastecimiento completo de insumos para este barbero?")) return;
        await fetch(`/api/personal/${id}`, { method: 'PUT' });
        loadData(); // Recargar para ver barras al 100%
    };

    if(!data) return <div style={{color:'white', padding:30}}>Cargando datos reales...</div>;

    const { perfil, insumos, historial } = data;
    const ingresoTotal = historial.reduce((acc: number, curr: any) => acc + Number(curr.monto), 0);
    const necesitaStock = insumos.some((i: any) => i.pct <= 20);

    return (
        <>
            <main>
                <button onClick={() => router.back()} style={{background:'none', border:'none', color:'#aaa', cursor:'pointer', marginBottom:20, display:'flex', gap:5}}><FaArrowLeft /> Volver</button>

                {/* TARJETA PERFIL */}
                <div style={{background: '#222', padding: 25, borderRadius: 12, display:'flex', gap: 20, alignItems:'center', marginBottom:30}}>
                    <div style={{width: 80, height: 80, borderRadius: '50%', background: '#444', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'2rem', fontWeight:'bold', color:'white'}}>
                        {perfil.nom_bar.charAt(0)}
                    </div>
                    <div>
                        <h1 style={{margin:0, color:'white'}}>{perfil.nom_bar} {perfil.apell_bar}</h1>
                        <p style={{color:'#aaa', margin:0}}>Estado: <span style={{color: perfil.estado==='Activo'?'#28a745':'red'}}>{perfil.estado}</span></p>
                        <p style={{color:'#aaa', margin:0}}>Total Generado: <span style={{color:'var(--color-accent)'}}>${ingresoTotal}</span></p>
                    </div>
                    {necesitaStock && (
                        <div style={{marginLeft:'auto', background:'rgba(220,53,69,0.2)', color:'#dc3545', padding:10, borderRadius:8, display:'flex', alignItems:'center', gap:10, border:'1px solid #dc3545'}}>
                            <FaExclamationTriangle /> <span>¡Nivel Crítico de Insumos!</span>
                        </div>
                    )}
                </div>

                {/* SECCIÓN INSUMOS (CONSUMIBLES) */}
                <h2 style={{color:'white'}}>📦 Insumos Asignados (Consumo Automático)</h2>
                <div style={{background: '#1a1a1a', padding: 20, borderRadius: 12, border: '1px solid #333', marginBottom:30}}>
                    <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:20}}>
                        {insumos.map((ins: any, idx: number) => (
                            <div key={idx} style={{marginBottom:10}}>
                                <div style={{display:'flex', justifyContent:'space-between', color:'#ccc', fontSize:'0.9rem', marginBottom:5}}>
                                    <span>{ins.nombre}</span>
                                    <span>{Math.round(ins.pct)}% ({ins.actual}/{ins.max})</span>
                                </div>
                                <div style={{width:'100%', height:8, background:'#333', borderRadius:4, overflow:'hidden'}}>
                                    <div style={{
                                        width: `${ins.pct}%`, 
                                        height:'100%', 
                                        background: ins.pct <= 20 ? '#dc3545' : (ins.pct <= 50 ? '#ffc107' : '#28a745'),
                                        transition: 'width 0.5s'
                                    }} />
                                </div>
                            </div>
                        ))}
                    </div>
                    <div style={{marginTop:20, textAlign:'right'}}>
                        <button onClick={handleRestock} style={{background:'#0D6EFD', color:'white', border:'none', padding:'10px 20px', borderRadius:6, cursor:'pointer', fontWeight:'bold', display:'inline-flex', alignItems:'center', gap:8}}>
                            <FaSyncAlt /> Autorizar Reabastecimiento
                        </button>
                    </div>
                </div>

                {/* HISTORIAL */}
                <h2 style={{color:'white'}}>📜 Historial de Actividad</h2>
                <div className={styles.tableContainer}>
                    <table className={styles.serviciosTable}>
                        <thead><tr><th>Fecha</th><th>Tipo</th><th>Detalle</th><th>Monto</th></tr></thead>
                        <tbody>
                            {historial.map((h: any, i: number) => (
                                <tr key={i}>
                                    <td>{new Date(h.fecha).toLocaleDateString()}</td>
                                    <td>{h.tipo_movimiento === 'Cita' ? <span style={{color:'var(--color-accent)'}}><FaCut/> Servicio</span> : <span style={{color:'#0D6EFD'}}><FaShoppingBag/> Venta</span>}</td>
                                    <td style={{color:'#ccc'}}>{h.detalle}</td>
                                    <td style={{fontWeight:'bold', color:'#28a745'}}>${h.monto}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </>
    );
}