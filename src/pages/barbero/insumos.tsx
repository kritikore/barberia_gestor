// src/pages/barbero/insumos.tsx
import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { FaBoxOpen, FaExclamationTriangle, FaCheckCircle, FaHandPaper, FaArrowLeft } from 'react-icons/fa';
import BarberLayout from '@/components/BarberLayout';

interface InsumoBarbero {
    id_ib: number;
    nombre: string;
    usos_restantes: number;
    capacidad_total: number;
    estado: string; // 'En Uso', 'Solicitado'
}

const InsumosBarberoPage: NextPage = () => {
    const router = useRouter();
    const [insumos, setInsumos] = useState<InsumoBarbero[]>([]);
    const [loading, setLoading] = useState(true);

    // ID Simulado (En una app real vendría del login)
    const ID_BARBERO = 1; 

    const fetchInsumos = async () => {
        try {
            const res = await fetch(`/api/barbero/insumos?id_bar=${ID_BARBERO}`);
            if (res.ok) setInsumos(await res.json());
        } catch (e) { console.error(e); } 
        finally { setLoading(false); }
    };

    useEffect(() => { fetchInsumos(); }, []);

    const solicitarRestock = async (id_ib: number) => {
        if(!confirm("¿Solicitar reposición de este insumo al Admin?")) return;
        
        try {
            await fetch('/api/barbero/insumos', {
                method: 'PUT', // Actualiza estado a 'Solicitado'
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ id_ib, accion: 'solicitar' })
            });
            fetchInsumos(); // Recargar para ver el cambio
            alert("✅ Solicitud enviada al administrador.");
        } catch (error) {
            alert("Error al solicitar.");
        }
    };

    return (
        <>
            <Head><title>Mis Insumos</title></Head>
            
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
                    <button onClick={() => router.push('/barbero/dashboard')} style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: '1.5em' }}>
                        <FaArrowLeft />
                    </button>
                    <h1 style={{ margin: 0, color: 'white' }}>Mis Insumos y Materiales</h1>
                </div>

                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px'}}>
                    {loading ? <p style={{color: '#aaa'}}>Cargando...</p> : insumos.map((ins) => {
                        // Calcular porcentaje
                        const porcentaje = Math.max(0, Math.min(100, (ins.usos_restantes / ins.capacidad_total) * 100));
                        const esCritico = porcentaje < 20; // Alerta si queda menos del 20%

                        return (
                            <div key={ins.id_ib} style={{background: '#2A2A2A', padding: '20px', borderRadius: '10px', border: esCritico ? '1px solid #DC3545' : '1px solid #444', boxShadow: '0 4px 10px rgba(0,0,0,0.3)'}}>
                                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                                    <div>
                                        <h3 style={{color: 'white', margin: '0 0 5px 0'}}>{ins.nombre}</h3>
                                        <p style={{color: '#aaa', margin: 0, fontSize: '0.9em'}}>Capacidad: {ins.capacidad_total} usos</p>
                                    </div>
                                    {esCritico && <FaExclamationTriangle color="#DC3545" size={24} title="Stock Crítico" />}
                                </div>
                                
                                <div style={{margin: '20px 0'}}>
                                    <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '0.9em'}}>
                                        <span style={{color: '#ccc'}}>Nivel Actual</span>
                                        <strong style={{color: esCritico ? '#DC3545' : '#28a745'}}>{ins.usos_restantes} usos</strong>
                                    </div>
                                    {/* Barra de Progreso */}
                                    <div style={{width: '100%', height: '8px', background: '#444', borderRadius: '4px', overflow: 'hidden'}}>
                                        <div style={{
                                            width: `${porcentaje}%`, 
                                            height: '100%', 
                                            background: esCritico ? '#DC3545' : '#0D6EFD',
                                            transition: 'width 0.5s ease-out'
                                        }}></div>
                                    </div>
                                </div>

                                {/* Botón de Acción */}
                                {ins.estado === 'Solicitado' ? (
                                    <button disabled style={{width: '100%', padding: '12px', background: '#444', color: '#888', border: '1px dashed #666', borderRadius: '6px', cursor: 'not-allowed'}}>
                                        ⏳ Solicitud Pendiente...
                                    </button>
                                ) : esCritico ? (
                                    // 🔑 BOTÓN DE RE-STOCK (Solo aparece si es crítico)
                                    <button onClick={() => solicitarRestock(ins.id_ib)} style={{width: '100%', padding: '12px', background: '#F5C542', color: 'black', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}}>
                                        <FaHandPaper /> Pedir Re-Stock
                                    </button>
                                ) : (
                                    <div style={{textAlign: 'center', color: '#28a745', fontSize: '0.9em', padding: '10px', background: 'rgba(40, 167, 69, 0.1)', borderRadius: '6px'}}>
                                        <FaCheckCircle /> Stock Saludable
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    
                    {!loading && insumos.length === 0 && (
                        <p style={{color: '#888', gridColumn: '1/-1', textAlign: 'center'}}>
                            No tienes insumos asignados. Pídele al administrador que te asigne material.
                        </p>
                    )}
                </div>
            </div>
        </>
    );
};

export default InsumosBarberoPage;